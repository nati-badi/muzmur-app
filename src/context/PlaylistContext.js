const React = require('react');
const { createContext, useState, useContext, useEffect, useCallback, useMemo } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const UserProfileService = require('../services/UserProfileService');
const SyncService = require('../services/SyncService');

const PlaylistContext = createContext();

const PLAYLISTS_STORAGE_KEY = 'user_playlists';

const PlaylistProvider = ({ children, userId, isAnonymous }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Storage key is user-specific
  const getStorageKey = useCallback(() => {
    return isAnonymous ? `${PLAYLISTS_STORAGE_KEY}_guest` : `${PLAYLISTS_STORAGE_KEY}_${userId}`;
  }, [userId, isAnonymous]);

  useEffect(() => {
    loadPlaylists();
  }, [getStorageKey]);

  const loadPlaylists = async () => {
    try {
      const key = getStorageKey();
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setPlaylists(JSON.parse(stored));
      } else {
        setPlaylists([]);
      }
      setIsLoaded(true);
    } catch (e) {
      console.error('Failed to load playlists:', e);
      setIsLoaded(true);
    }
  };

  const persistPlaylists = async (newList) => {
    try {
      const key = getStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(newList));

      // Sync to cloud if authenticated
      if (!isAnonymous && userId) {
        const { isConnected } = SyncService.getSyncStatus();

        if (isConnected) {
          await UserProfileService.syncPlaylists(userId, newList);
        } else {
          await UserProfileService.queueSync({
            type: 'playlists',
            data: newList
          });
        }
      }
    } catch (e) {
      console.error('Failed to persist playlists:', e);
    }
  };

  const createPlaylist = useCallback(async (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const newList = [...playlists, newPlaylist];
    setPlaylists(newList);
    await persistPlaylists(newList);
    return newPlaylist;
  }, [playlists, getStorageKey]);

  const renamePlaylist = useCallback(async (playlistId, newName) => {
    const newList = playlists.map(p =>
      p.id === playlistId ? { ...p, name: newName, updatedAt: Date.now() } : p
    );
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, getStorageKey]);

  const deletePlaylist = useCallback(async (playlistId) => {
    const newList = playlists.filter(p => p.id !== playlistId);
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, getStorageKey]);

  const addToPlaylist = useCallback(async (playlistId, hymnId) => {
    const newList = playlists.map(p => {
      if (p.id === playlistId) {
        // Avoid duplicates
        if (p.items.includes(hymnId)) return p;
        return {
          ...p,
          items: [...p.items, hymnId],
          updatedAt: Date.now()
        };
      }
      return p;
    });
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, getStorageKey]);

  const removeFromPlaylist = useCallback(async (playlistId, hymnId) => {
    const newList = playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          items: p.items.filter(id => id !== hymnId),
          updatedAt: Date.now()
        };
      }
      return p;
    });
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, getStorageKey]);

  const reorderPlaylist = useCallback(async (playlistId, newItems) => {
    const newList = playlists.map(p =>
      p.id === playlistId ? { ...p, items: newItems, updatedAt: Date.now() } : p
    );
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, getStorageKey]);

  const setPlaylistsFromCloud = useCallback(async (cloudPlaylists) => {
    setPlaylists(cloudPlaylists);
    const key = getStorageKey();
    await AsyncStorage.setItem(key, JSON.stringify(cloudPlaylists));
  }, [getStorageKey]);

  const value = useMemo(() => ({
    playlists,
    isLoaded,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylist,
    setPlaylistsFromCloud
  }), [
    playlists, isLoaded, createPlaylist, renamePlaylist,
    deletePlaylist, addToPlaylist, removeFromPlaylist,
    reorderPlaylist, setPlaylistsFromCloud
  ]);

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

const usePlaylists = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
};

module.exports = { PlaylistProvider, usePlaylists };
