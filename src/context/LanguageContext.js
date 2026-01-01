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
    player: 'Player',
    appTitle: 'ቅዱስ ዜማ',
    appTagline: 'Orthodox Hymns',
    shareMessage: 'Check out the app! Download it now to listen to your favorite hymns.',
    
    // Profile Screen
    user: 'User',
    appearance: 'Appearance',
    language: 'Language',
    notifications: 'Notifications',
    helpSupport: 'Help & Support',
    aboutUs: 'About Us',
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
    playlists: 'Playlists',
    recent: 'Recent',
    
    // Sidebar
    sidebarTitle: 'Menu',
    
    // Common
    back: 'Back',
    translation: 'Translation',
    ok: 'OK',
    great: 'OK',
    cancel: 'Cancel',
    viewProfile: 'View Profile',
    signInToSync: 'Sign in to sync',
    guestUser: 'Guest User',
    version: 'Version',

    // Overflow Menu
    shareApp: 'Share App',
    feedback: 'Feedback',
    checkUpdates: 'Check for Updates',
    feedbackAlertTitle: 'Feedback',
    feedbackAlertMessage: 'We value your feedback! Please send us your thoughts at natibadideb@gmail.com',
    updatesAlertTitle: 'Check for Updates',
    updatesAlertMessage: 'You are already on the latest version (v1.0.0).',
    moreOptions: 'More Options',
    chooseAction: 'Choose an action:',
    noHymnSelected: 'No Hymn Selected',
    selectHymnDetail: 'Choose a hymn from the list to start listening.',
    browseMezmurs: 'Browse Mezmurs',
    ourMission: 'Our Mission',
    missionStatement: 'This application is dedicated to preserving and sharing the rich heritage of Ethiopian Orthodox Tewahedo Church Mezmurs. Our goal is to make these spiritual hymns accessible to everyone, everywhere.',
    developerLabel: 'Developer',
  },
  am: {
    // Screen Titles
    profile: 'መገለጫ',
    today: 'ዛሬ',
    settings: 'ቅንብሮች',
    favorites: 'ተወዳጆች',
    home: 'ቤት',
    player: 'ማጫወቻ',
    appTitle: 'ቅዱስ ዜማ',
    appTagline: 'ኦርቶዶክስ መዝሙራት',
    shareMessage: 'መተግበሪያውን ይመልከቱ! የሚወዱትን መዝሙር ለማዳመጥ አሁኑኑ ያውርዱት።',
    
    // Profile Screen
    user: 'ተጠቃሚ',
    appearance: 'ገጽታ',
    language: 'ቋንቋ',
    notifications: 'ማሳወቂያዎች',
    helpSupport: 'እርዳታና ድጋፍ',
    aboutUs: 'ስለ እኛ',
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
    playlists: 'ስብስቦች',
    recent: 'የቅርብ ጊዜ',
    
    // Sidebar
    sidebarTitle: 'ማውጫ',
    
    // Common
    back: 'ተመለስ',
    translation: 'ትርጉም',
    ok: 'እሺ',
    great: 'እሺ',
    cancel: 'ሰርዝ',
    viewProfile: 'መገለጫን ይመልከቱ',
    signInToSync: 'ለመቀላቀል ይግቡ',
    guestUser: 'እንግዳ ተጠቃሚ',
    version: 'ስሪት',

    // Overflow Menu
    shareApp: 'መተግበሪያውን አጋራ',
    feedback: 'አስተያየት',
    checkUpdates: 'ዝመናን ፈትሽ',
    feedbackAlertTitle: 'አስተያየት',
    feedbackAlertMessage: 'አስተያየትዎን እናደንቃለን! እባክዎን ሃሳብዎን በ natibadideb@gmail.com ይላኩልን',
    updatesAlertTitle: 'ዝመናን ፈትሽ',
    updatesAlertMessage: 'እርስዎ በአሁኑ ጊዜ የቅርብ ጊዜው ስሪት (v1.0.0) ላይ ነዎት።',
    moreOptions: 'ተጨማሪ አማራጮች',
    chooseAction: 'አንድ እርምጃ ይምረጡ:',
    noHymnSelected: 'ምንም መዝሙር አልተመረጠም',
    selectHymnDetail: 'መዝሙር ለማዳመጥ ከዝርዝሩ ውስጥ አንዱን ይምረጡ።',
    browseMezmurs: 'መዝሙራትን ይመልከቱ',
    ourMission: 'ዓላማችን',
    missionStatement: 'ይህ መተግበሪያ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን መዝሙራትን ቅርሶችን ለመጠበቅና ለማካፈል የተዘጋጀ ነው። ዓላማችን እነዚህን መንፈሳዊ መዝሙራት ለሁሉም ሰው በየትኛውም ቦታ ተደራሽ ማድረግ ነው።',
    developerLabel: 'አልሚ',
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
