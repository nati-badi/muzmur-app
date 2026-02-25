const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const CACHE_KEYS = {
    SEARCH_HISTORY: 'cache_search_history',
    HYMN_HISTORY: 'cache_hymn_history',
    RECOMMENDATIONS: 'cache_ephemeral_recommendations'
};

const MAX_HISTORY = 50;
const MAX_SEARCHES = 10;

class CacheService {
    constructor() {
        this.ephemeral = {
            suggestions: new Map(),
            recommendations: null
        };
    }

    /**
     * TIER 2: PRIORITY CACHE (Persistent)
     */

    // Search History
    async getRecentSearches() {
        try {
            const data = await AsyncStorage.getItem(CACHE_KEYS.SEARCH_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    async addSearchQuery(query) {
        if (!query || query.trim().length < 2) return;
        try {
            let searches = await this.getRecentSearches();
            searches = [query.trim(), ...searches.filter(q => q !== query.trim())].slice(0, MAX_SEARCHES);
            await AsyncStorage.setItem(CACHE_KEYS.SEARCH_HISTORY, JSON.stringify(searches));
        } catch (e) {
            console.error('Failed to save search history', e);
        }
    }

    // Hymn History
    async getHymnHistory() {
        try {
            const data = await AsyncStorage.getItem(CACHE_KEYS.HYMN_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    async addToHistory(hymn) {
        if (!hymn || !hymn.id) return;
        try {
            let history = await this.getHymnHistory();
            // Store minimal data to save space
            const entry = { id: hymn.id, title: hymn.title, section: hymn.section, timestamp: Date.now() };
            history = [entry, ...history.filter(h => h.id !== hymn.id)].slice(0, MAX_HISTORY);
            await AsyncStorage.setItem(CACHE_KEYS.HYMN_HISTORY, JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save hymn history', e);
        }
    }

    /**
     * TIER 3: EPHEMERAL CACHE (Runtime)
     */
    setSuggestions(query, results) {
        this.ephemeral.suggestions.set(query.toLowerCase(), results);
    }

    getSuggestions(query) {
        return this.ephemeral.suggestions.get(query.toLowerCase());
    }

    setRecommendations(data) {
        this.ephemeral.recommendations = data;
    }

    getRecommendations() {
        return this.ephemeral.recommendations;
    }

    clearEphemeral() {
        this.ephemeral.suggestions.clear();
        this.ephemeral.recommendations = null;
    }
}

module.exports = new CacheService();
