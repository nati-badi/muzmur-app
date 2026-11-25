const mezmursData = require('../data/mezmurs.json');
const oroMezmursData = require('../data/OroMuzmurs.json');
const { normalizeAmharic } = require('../utils/textUtils');
const { SECTIONS } = require('../constants/sections');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const OFFLINE_DATA_VERSION = 2;
const OFFLINE_DATA_VERSION_KEY = 'offline_data_version';

/**
 * DataService provides pre-indexed, high-performance access to hymn data.
 */
class DataService {
  constructor() {
    this.allHymns = [];
    this.hymnsBySection = {};
    this.initializationPromise = this.init();
    this.isReady = false;
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback);
  }

  async init() {
    try {
      console.log('DataService: Starting initialization...');

      const storedVersion = await AsyncStorage.getItem(OFFLINE_DATA_VERSION_KEY);
      if (storedVersion !== String(OFFLINE_DATA_VERSION)) {
        await AsyncStorage.multiRemove([
          'mezmur_cloud_overrides',
          'mezmur_last_sync_timestamp',
          'syncQueue',
        ]);
        await AsyncStorage.setItem(OFFLINE_DATA_VERSION_KEY, String(OFFLINE_DATA_VERSION));
        console.log('DataService: Cleared legacy cloud sync data.');
      }

      const processedAmharic = mezmursData.map(item => this.processHymn(item));
      const processedOromo = oroMezmursData.map(item =>
        this.processHymn({ ...item, id: `oro_${item.id}`, section: SECTIONS.AFAN_OROMO })
      );

      this.allHymns = [...processedAmharic, ...processedOromo];
      this.rebuildSectionIndex();

      this.isReady = true;
      console.log(`DataService: Ready with ${this.allHymns.length} hymns (offline).`);
      return true;
    } catch (error) {
      console.error('DataService init error:', error);
      this.isReady = true;
      return false;
    }
  }

  async syncWithCloud() {
    return { success: true, updates: [] };
  }

  mergeOverrides(baseList, overrideList) {
    const hMap = new Map();
    baseList.forEach(h => hMap.set(h.id.toString(), h));
    overrideList.forEach(h => hMap.set(h.id.toString(), h));
    return Array.from(hMap.values());
  }

  rebuildSectionIndex() {
    this.hymnsBySection = {};
    this.allHymns.forEach(h => {
      if (h.section) {
        if (!this.hymnsBySection[h.section]) {
          this.hymnsBySection[h.section] = [];
        }
        this.hymnsBySection[h.section].push(h);
      }
    });
  }

  processHymn(item) {
    let lengthType = 'SHORT_FILTER';
    if (item.lyrics) {
      const count = item.lyrics.split('\n').length;
      if (count > 8) lengthType = 'LONG_FILTER';
    }

    const rawSearchText = `${item.title} ${item.lyrics || ''} ${item.id}`.toLowerCase();
    const searchText = normalizeAmharic(rawSearchText);

    return { ...item, lengthType, searchText };
  }

  async waitForReady() {
    return this.initializationPromise;
  }

  getAll() {
    return this.allHymns;
  }

  getById(id) {
    return this.allHymns.find(h => h.id.toString() === id.toString());
  }

  getBySection(sectionId) {
    return this.hymnsBySection[sectionId] || [];
  }

  getFeaturedForFeast(sectionMatch) {
    if (!sectionMatch || !this.hymnsBySection[sectionMatch]) {
      return this.allHymns.slice(0, 5);
    }
    return this.hymnsBySection[sectionMatch].slice(0, 10);
  }

  getSections() {
    return Object.keys(this.hymnsBySection).map(s => ({
      id: s,
      label: s,
    }));
  }
}

const dataServiceInstance = new DataService();
module.exports = dataServiceInstance;