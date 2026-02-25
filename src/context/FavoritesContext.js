const React = require('react');
const { createContext, useState, useContext, useEffect, useCallback } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const UserProfileService = require('../services/UserProfileService');
const SyncService = require('../services/SyncService');

const FavoritesContext = createContext();

const FavoritesProvider = ({ children, userId, isAnonymous }) => {
  const [favorites, setFavorites] = useState([]);
  const [syncPending, setSyncPending] = useState(false);

  // Get storage key based on userId and auth status
  const getStorageKey = useCallback(() => {
    // If not logged in OR is anonymous (guest), use a shared guest key
    if (!userId || isAnonymous) {
      return 'favorites_guest';
    }
    // Only use user-specific key for fully authenticated accounts
    return `favorites_${userId}`;
  }, [userId, isAnonymous]);

  // Load favorites when userId changes
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storageKey = getStorageKey();
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Sanitize to array of strings
          setFavorites(Array.isArray(parsed) ? parsed.map(String) : []);
        } else {
          // No favorites for this user yet
          setFavorites([]);
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
        setFavorites([]);
      }
    };
    loadFavorites();
  }, [userId, getStorageKey]);

  // Sync to cloud when user is authenticated
  const syncToCloud = useCallback(async (favoritesList) => {
    if (!userId || !favoritesList) return;

    try {
      setSyncPending(true);
      const { isConnected } = SyncService.getSyncStatus();

      if (isConnected) {
        await UserProfileService.syncFavorites(userId, favoritesList);
      } else {
        await UserProfileService.queueSync({
          type: 'favorites',
          data: favoritesList
        });
      }
      setSyncPending(false);
    } catch (error) {
      console.error('Failed to sync favorites to cloud:', error);
      // Queue for later sync
      await UserProfileService.queueSync({
        type: 'favorites',
        data: favoritesList
      });
      setSyncPending(false);
    }
  }, [userId]);

  const toggleFavorite = useCallback(async (id) => {
    const idStr = String(id);
    setFavorites((prev) => {
      const isFav = prev.includes(idStr);
      const next = isFav ? prev.filter((fid) => fid !== idStr) : [...prev, idStr];

      // Persist to local storage immediately (offline-first) with user-specific key
      const storageKey = getStorageKey();
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(e => {
        console.error('Failed to save favorites locally', e);
      });

      // Sync to cloud in background (non-blocking)
      syncToCloud(next);

      return next;
    });
  }, [syncToCloud, getStorageKey]);

  const isFavorite = useCallback((id) => {
    return favorites.includes(String(id));
  }, [favorites]);

  // Update favorites from cloud (e.g., after login)
  const setFavoritesFromCloud = useCallback((cloudFavorites) => {
    const sanitized = Array.isArray(cloudFavorites) ? cloudFavorites.map(String) : [];
    setFavorites(sanitized);

    // Update local storage with user-specific key
    const storageKey = getStorageKey();
    AsyncStorage.setItem(storageKey, JSON.stringify(sanitized)).catch(e => {
      console.error('Failed to update local favorites', e);
    });
  }, [getStorageKey]);

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,
    syncPending,
    setFavoritesFromCloud
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

module.exports = {
  FavoritesProvider,
  useFavorites
};
