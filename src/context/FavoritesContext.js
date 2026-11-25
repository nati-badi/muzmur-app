const React = require('react');
const { createContext, useState, useContext, useEffect, useCallback } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const FavoritesContext = createContext();

const FAVORITES_KEY = 'favorites_local';

const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFavorites(Array.isArray(parsed) ? parsed.map(String) : []);
        } else {
          setFavorites([]);
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
        setFavorites([]);
      }
    };
    loadFavorites();
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const idStr = String(id);
    setFavorites((prev) => {
      const isFav = prev.includes(idStr);
      const next = isFav ? prev.filter((fid) => fid !== idStr) : [...prev, idStr];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch((e) => {
        console.error('Failed to save favorites locally', e);
      });
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.includes(String(id)),
    [favorites]
  );

  const setFavoritesFromCloud = useCallback((cloudFavorites) => {
    const sanitized = Array.isArray(cloudFavorites) ? cloudFavorites.map(String) : [];
    setFavorites(sanitized);
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(sanitized)).catch(console.error);
  }, []);

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,
    syncPending: false,
    setFavoritesFromCloud,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
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
  useFavorites,
};