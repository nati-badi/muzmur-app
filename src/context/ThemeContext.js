const React = require('react');
const { createContext, useState, useContext, useEffect } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { THEMES } = require('../constants/theme');
const { useColorScheme } = require('react-native');

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 'light' or 'dark'
  const [themeMode, setThemeMode] = useState('system'); // 'classic', 'midnight', 'system'
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('app_theme_mode');
      if (savedMode) {
        setThemeMode(savedMode);
      }
    } catch (e) {
      console.error('Failed to load theme mode:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateThemeMode = async (mode) => {
    if (THEMES[mode] || mode === 'system') {
      setThemeMode(mode);
      try {
        await AsyncStorage.setItem('app_theme_mode', mode);
      } catch (e) {
        console.error('Failed to save theme mode:', e);
      }
    }
  };

  // Determine the actual theme object to provide
  const theme = React.useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? THEMES.midnight : THEMES.classic;
    }
    return THEMES[themeMode] || THEMES.classic;
  }, [themeMode, systemColorScheme]);

  const contextValue = React.useMemo(() => ({
    theme,
    themeMode,
    setTheme: updateThemeMode,
    isLoaded
  }), [theme, themeMode, isLoaded]);

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
