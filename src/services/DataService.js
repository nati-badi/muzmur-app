const mezmursData = require('../data/mezmurs.json');
const oroMezmursData = require('../data/OroMuzmurs.json');
const { normalizeAmharic } = require('../utils/textUtils');
const { SECTIONS } = require('../constants/sections');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const STORAGE_KEYS = {
  MEZMUR_OVERRIDES: 'mezmur_cloud_overrides',
  LAST_SYNC_TIME: 'mezmur_last_sync_timestamp'
};

/**
 * DataService provides pre-indexed, high-performance access to hymn data.
 * It eliminates the need for expensive O(N) operations during render cycles.
 * Now supports "Delta Sync" to merge cloud-edited hymns with local base data.
 */
class DataService {
  constructor() {
    this.allHymns = [];
    this.hymnsBySection = {};
    this.initializationPromise = this.init();
    this.isReady = false;
    this.lastSyncTime = null;
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  async init() {
    try {
      console.log('DataService: Starting initialization...');
      // 1. Process base local data
      const processedAmharic = mezmursData.map(item => this.processHymn(item));
      const processedOromo = oroMezmursData.map(item =>
        this.processHymn({ ...item, id: `oro_${item.id}`, section: SECTIONS.AFAN_OROMO })
      );

      let initialHymns = [...processedAmharic, ...processedOromo];
      console.log(`DataService: Processed ${initialHymns.length} base hymns.`);

      // 2. Load and apply stored overrides
      const storedOverrides = await AsyncStorage.getItem(STORAGE_KEYS.MEZMUR_OVERRIDES);
      const storedSyncTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);

      if (storedSyncTime) {
        this.lastSyncTime = parseInt(storedSyncTime);
      }

      if (storedOverrides) {
        const overrides = JSON.parse(storedOverrides);
        console.log(`DataService: Applying ${Object.keys(overrides).length} cloud overrides.`);
        initialHymns = this.mergeOverrides(initialHymns, Object.values(overrides));
      }

      this.allHymns = initialHymns;
      this.rebuildSectionIndex();

      this.isReady = true;
      console.log('DataService: Initialization complete. App is ready (offline).');

      return true;
    } catch (error) {
      console.error('DataService init error:', error);
      this.isReady = true; // Fallback to local data only
      return false;
    }
  }

  /** Offline app: no cloud hymn sync. */
  async syncWithCloud() {
    return { success: true, updates: [] };
  }

  /**
   * Manually update a specific hymn in memory and notify listeners.
   * Useful for instant UI feedback after an admin edit.
   */
  updateLocalHymn(updatedData) {
    const processed = this.processHymn(updatedData);

    const existingIdx = this.allHymns.findIndex(h => h.id.toString() === processed.id.toString());
    const newHymns = [...this.allHymns];

    if (existingIdx !== -1) {
      newHymns[existingIdx] = processed;
    } else {
      newHymns.push(processed);
    }

    this.allHymns = newHymns;
    this.rebuildSectionIndex();
    this.notifyListeners();
  }

  /**
   * Manually remove a hymn from memory and notify listeners.
   */
  removeLocalHymn(hymnId) {
    this.allHymns = this.allHymns.filter(h => h.id.toString() !== hymnId.toString());
    this.rebuildSectionIndex();
    this.notifyListeners();
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

    const rawSearchText = (item.title + ' ' + (item.lyrics || '') + ' ' + item.id).toLowerCase();
    const searchText = normalizeAmharic(rawSearchText);

    return { ...item, lengthType, searchText };
  }

  async waitForReady() {
    return this.initializationPromise;
  }

  getAll() {
    return this.allHymns;
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
      label: s
    }));
  }
}

const dataServiceInstance = new DataService();
module.exports = dataServiceInstance;

