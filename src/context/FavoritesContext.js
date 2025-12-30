const React = require('react');
const { createContext, useState, useContext, useEffect, useCallback } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const FavoritesContext = createContext();

const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('favorites');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Sanitize to array of strings
          setFavorites(Array.isArray(parsed) ? parsed.map(String) : []);
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavorites();
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const idStr = String(id);
    setFavorites((prev) => {
      const isFav = prev.includes(idStr);
      const next = isFav ? prev.filter((fid) => fid !== idStr) : [...prev, idStr];
      
      // Persist to storage
      AsyncStorage.setItem('favorites', JSON.stringify(next)).catch(e => {
        console.error('Failed to save favorites', e);
      });
      
      return next;
    });
  }, []);

  const isFavorite = useCallback((id) => {
    return favorites.includes(String(id));
  }, [favorites]);

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length
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
