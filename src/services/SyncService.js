let NetInfo;
try {
    NetInfo = require('@react-native-community/netinfo');
} catch (e) {
    console.warn('NetInfo not available, using mock fallback.');
    NetInfo = { addEventListener: () => () => { }, fetch: async () => ({ isConnected: true }) };
}
const DataService = require('./DataService');
const UserProfileService = require('./UserProfileService');

class SyncService {
    constructor() {
        this.unsubscribe = null;
        this.isConnected = true;
        this.isSyncing = false;
        this.listeners = new Set();
    }

    start() {
        if (this.unsubscribe) return;

        try {
            if (!NetInfo || typeof NetInfo.addEventListener !== 'function') {
                console.warn('NetInfo native module not found. Background sync monitoring disabled.');
                return;
            }

            this.unsubscribe = NetInfo.addEventListener(state => {
                const wasDisconnected = !this.isConnected;
                this.isConnected = state.isConnected && state.isInternetReachable !== false;

                // Magic Sync: If we just regained connection, trigger sync
                if (wasDisconnected && this.isConnected) {
                    this.performMagicSync();
                }

                this.notifyListeners();
            });
        } catch (error) {
            console.error('Error starting SyncService (NetInfo error):', error);
        }
    }

    stop() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    async performMagicSync() {
        if (this.isSyncing) return;

        try {
            this.isSyncing = true;
            this.notifyListeners();
            console.log('Regained connection. Performing magic sync...');

            // 1. Sync Hymns (Delta Sync)
            console.log('Starting hymn sync...');
            await DataService.syncWithCloud();
            console.log('Hymn sync finished.');

            // 2. Process Pending User Operations (Queue)
            const { auth } = require('../config/firebase.config');
            const currentUser = auth.currentUser;
            if (currentUser) {
                console.log(`Processing sync queue for user: ${currentUser.uid}`);
                await UserProfileService.processQueue(currentUser.uid);
                console.log('Sync queue processing finished.');
            }

            console.log('Magic sync completed successfully.');
        } catch (error) {
            console.error('Magic sync failed:', error);
        } finally {
            this.isSyncing = false;
            this.notifyListeners();
        }
    }

    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }

    notifyListeners() {
        const status = {
            isConnected: this.isConnected,
            isSyncing: this.isSyncing
        };
        this.listeners.forEach(callback => callback(status));
    }

    getSyncStatus() {
        return {
            isConnected: this.isConnected,
            isSyncing: this.isSyncing
        };
    }
}

module.exports = new SyncService();
