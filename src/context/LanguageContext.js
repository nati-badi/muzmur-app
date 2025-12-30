const React = require('react');
const { createContext, useState, useContext, useEffect } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const LanguageContext = createContext();

const translations = {
  en: {
    // Screen Titles
    profile: 'Profile',
    today: 'Today',
    settings: 'Settings',
    favorites: 'Favorites',
    home: 'Home',
    
    // Profile Screen
    user: 'User',
    appearance: 'Appearance',
    language: 'Language',
    notifications: 'Notifications',
    helpSupport: 'Help & Support',
    logout: 'Logout',
    
    // Settings labels
    amharic: 'Amharic',
    english: 'English',
    
    // Today Screen
    todaysFeatured: "Today's Featured Hymns",
    comingSoon: 'Coming soon! Check back for daily featured hymns.',
    
    // Home Screen
    searchPlaceholder: 'Search by hymn title or lyrics...',
    sections: 'Sections',
    all: 'All',
    short: 'Short',
    long: 'Long',
    loadMore: 'Load More',
    noResults: 'No hymns found',
    
    // Sidebar
    sidebarTitle: 'Menu',
    
    // Common
    back: 'Back',
    translation: 'Translation',
  },
  am: {
    // Screen Titles
    profile: 'መገለጫ',
    today: 'ዛሬ',
    settings: 'ቅንብሮች',
    favorites: 'ተወዳጆች',
    home: 'ቤት',
    
    // Profile Screen
    user: 'ተጠቃሚ',
    appearance: 'ገጽታ',
    language: 'ቋንቋ',
    notifications: 'ማሳወቂያዎች',
    helpSupport: 'እርዳታ',
    logout: 'ውጣ',
    
    // Settings labels
    amharic: 'አማርኛ',
    english: 'English',
    
    // Today Screen
    todaysFeatured: 'የዕለቱ መዝሙራት',
    comingSoon: 'ለዛሬ የተመረጡ መዝሙራት እዚህ ይገኛሉ። በቅርቡ ይጠበቁ!',
    
    // Home Screen
    searchPlaceholder: 'በመዝሙር ርዕስ ወይም ግጥም ይፈልጉ...',
    sections: 'ክፍላት',
    all: 'ሁሉንም',
    short: 'አጭር',
    long: 'ረጅም',
    loadMore: 'ተጨማሪ አሳይ',
    noResults: 'ምንም መዝሙር አልተገኘም',
    
    // Sidebar
    sidebarTitle: 'ማውጫ',
    
    // Common
    back: 'ተመለስ',
    translation: 'ትርጉም',
  }
};

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('am'); // Default to Amharic
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_language');
      if (stored && (stored === 'am' || stored === 'en')) {
        setLanguage(stored);
      }
      setIsLoaded(true);
    } catch (e) {
      console.error('Failed to load language:', e);
      setIsLoaded(true);
    }
  };

  const changeLanguage = async (newLang) => {
    try {
      if (newLang === 'am' || newLang === 'en') {
        setLanguage(newLang);
        await AsyncStorage.setItem('app_language', newLang);
      }
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['am'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

module.exports = { LanguageProvider, useLanguage };
