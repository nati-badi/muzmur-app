const React = require('react');
const { createContext, useState, useContext, useEffect, useCallback, useMemo } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const PlaylistContext = createContext();

const PLAYLISTS_STORAGE_KEY = 'user_playlists_local';

const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Storage key is user-specific
  const getStorageKey = useCallback(() => PLAYLISTS_STORAGE_KEY, []);

  const persistPlaylists = useCallback(async (newList) => {
    try {
      const key = getStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to persist playlists:', e);
    }
  }, [getStorageKey]);

  const loadPlaylists = useCallback(async () => {
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
  }, [getStorageKey]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

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
  }, [playlists, persistPlaylists]);

  const renamePlaylist = useCallback(async (playlistId, newName) => {
    const newList = playlists.map(p =>
      p.id === playlistId ? { ...p, name: newName, updatedAt: Date.now() } : p
    );
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, persistPlaylists]);

  const deletePlaylist = useCallback(async (playlistId) => {
    const newList = playlists.filter(p => p.id !== playlistId);
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, persistPlaylists]);

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
  }, [playlists, persistPlaylists]);

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
  }, [playlists, persistPlaylists]);

  const reorderPlaylist = useCallback(async (playlistId, newItems) => {
    const newList = playlists.map(p =>
      p.id === playlistId ? { ...p, items: newItems, updatedAt: Date.now() } : p
    );
    setPlaylists(newList);
    await persistPlaylists(newList);
  }, [playlists, persistPlaylists]);

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
