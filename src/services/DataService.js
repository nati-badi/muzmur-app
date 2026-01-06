const mezmursData = require('../data/mezmurs.json');
const { normalizeAmharic } = require('../utils/textUtils');

/**
 * DataService provides pre-indexed, high-performance access to hymn data.
 * It eliminates the need for expensive O(N) operations during render cycles.
 */
class DataService {
  constructor() {
    this.allHymns = [];
    this.hymnsBySection = {};
    this.initializationPromise = this.init();
    this.isReady = false;
  }

  async init() {
    // Process data once
    this.allHymns = mezmursData.map(item => {
      let lengthType = 'SHORT_FILTER';
      if (item.lyrics) {
        const count = item.lyrics.split('\n').length;
        if (count > 8) lengthType = 'LONG_FILTER';
      }
      
      const rawSearchText = (item.title + ' ' + (item.lyrics || '') + ' ' + item.id).toLowerCase();
      const searchText = normalizeAmharic(rawSearchText);
      
      const processed = { ...item, lengthType, searchText };
      
      // Index by section
      if (item.section) {
        if (!this.hymnsBySection[item.section]) {
          this.hymnsBySection[item.section] = [];
        }
        this.hymnsBySection[item.section].push(processed);
      }
      
      return processed;
    });

    this.isReady = true;
    return true;
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
      // Return a stable random set of 5 common hymns if no feast match
      return this.allHymns.slice(0, 5); 
    }
    
    // Return first 10 for diversity, component slices what it needs
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
