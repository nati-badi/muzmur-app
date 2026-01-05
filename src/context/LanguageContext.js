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
    mezmurs: 'Mezmurs',
    player: 'Player',
    appTitle: 'ቅዱስ ዜማ',
    appTagline: 'Orthodox Hymns',
    calendar: 'Calendar',
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
    explore: 'Explore',
    categories: 'Categories',
    recentlyPlayed: 'Recently Played',
    seeAll: 'See All',
    searchHint: 'Search All Hymns...',
    searchResults: 'Search Results',
    todaysFeast: "Today's Feast",
    commemoration: "Commemoration of the Day",
    noFavorites: 'No favorite hymns yet.',
    
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

    // Auth Errors
    invalidEmail: 'Please enter a valid email address',
    userNotFound: 'No account found with this email',
    wrongPassword: 'Incorrect password',
    emailInUse: 'An account with this email already exists',
    weakPassword: 'Password should be at least 6 characters',
    networkError: 'Network error. Please check your connection',
    tooManyRequests: 'Too many attempts. Please try again later',
    genericError: 'Something went wrong. Please try again',
    fillAllFields: 'Please fill in all fields',
    nameRequired: 'Please enter your name',
    passwordTooShort: 'Password must be at least 6 characters',

    // Profile Actions
    signInRequired: 'Sign In Required',
    signInToUpload: 'Please sign in to upload a profile picture.',
    permissionDenied: 'Permission Denied',
    cameraRollPermission: 'Sorry, we need camera roll permissions to make this work!',
    uploadFailed: 'Upload Failed',
    imagePickFailed: 'Failed to pick image',
    imageUploadFailed: 'Failed to upload image',
    error: 'Error',
  },
  am: {
    // Screen Titles
    profile: 'መገለጫ',
    today: 'ዛሬ',
    settings: 'ቅንብሮች',
    favorites: 'ተወዳጆች',
    home: 'ቤት',
    mezmurs: 'መዝሙራት',
    player: 'ማጫወቻ',
    appTitle: 'ቅዱስ ዜማ',
    appTagline: 'ኦርቶዶክስ መዝሙራት',
    calendar: 'የቀን መቁጠሪያ',
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
    explore: 'ማሰሻ',
    categories: 'ምድቦች',
    recentlyPlayed: 'በቅርብ የተጫወቱ',
    seeAll: 'ሁሉንም አሳይ',
    searchHint: 'ሁሉንም መዝሙራት ይፈልጉ...',
    searchResults: 'የፍለጋ ውጤቶች',
    todaysFeast: 'የዕለቱ መታሰቢያ',
    commemoration: 'የዕለቱ መታሰቢያ',
    noFavorites: 'ምንም የተመረጡ መዝሙራት የሉም።',
    
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

    // Auth Errors
    invalidEmail: 'እባክዎን ትክክለኛ የኢሜይል አድራሻ ያስገቡ',
    userNotFound: 'በዚህ ኢሜይል የተመዘገበ አካውንት አልተገኘም',
    wrongPassword: 'የተሳሳተ የይለፍ ቃል',
    emailInUse: 'ይህ ኢሜይል ቀድሞውኑ ስራ ላይ ውሏል',
    weakPassword: 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት',
    networkError: 'የኔትወርክ ችግር። እባክዎን ግንኙነትዎን ያረጋግጡ',
    tooManyRequests: 'ከመጠን በላይ ሙከራ ተደርጓል። እባክዎን ቆይተው እንደገና ይሞክሩ',
    genericError: 'ችግር ተከስቷል። እባክዎን እንደገና ይሞክሩ',
    fillAllFields: 'እባክዎን ሁሉንም ቦታዎች ይሙሉ',
    nameRequired: 'እባክዎን ስምዎን ያስገቡ',
    passwordTooShort: 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት',

    // Profile Actions
    signInRequired: 'መግባት ያስፈልጋል',
    signInToUpload: 'እባክዎን የመገለጫ ፎቶ ለመቀየር ይግቡ',
    permissionDenied: 'ፈቃድ ተከልክሏል',
    cameraRollPermission: 'ይቅርታ፣ ይህንን ለማድረግ የጋለሪ ፈቃድ ያስፈልገናል!',
    uploadFailed: 'መጫን አልተቻለም',
    imagePickFailed: 'ፎቶ መምረጥ አልተቻለም',
    imageUploadFailed: 'ፎቶ መጫን አልተቻለም',
    error: 'ስህተት',
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

  const t = React.useCallback((key) => {
    return translations[language]?.[key] || translations['am'][key] || key;
  }, [language]);

  const contextValue = React.useMemo(() => ({
    language,
    changeLanguage,
    t,
    isLoaded
  }), [language, t, isLoaded]);

  return (
    <LanguageContext.Provider value={contextValue}>
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
