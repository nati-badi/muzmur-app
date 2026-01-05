const React = require('react');
const { createContext, useState, useContext, useEffect } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { THEMES } = require('../constants/theme');

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(THEMES.classic);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('app_theme');
      if (savedThemeId && THEMES[savedThemeId]) {
        setCurrentTheme(THEMES[savedThemeId]);
      }
    } catch (e) {
      console.error('Failed to load theme:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateTheme = async (themeId) => {
    if (THEMES[themeId]) {
      setCurrentTheme(THEMES[themeId]);
      try {
        await AsyncStorage.setItem('app_theme', themeId);
      } catch (e) {
        console.error('Failed to save theme:', e);
      }
    }
  };

  const contextValue = React.useMemo(() => ({
    theme: currentTheme,
    setTheme: updateTheme,
    isLoaded
  }), [currentTheme, isLoaded]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

module.exports = {
  ThemeProvider,
  useAppTheme
};
