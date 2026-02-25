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
    tigrigna: 'Tigrigna',
    afanOromo: 'Afan Oromo',

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
    preferences: 'Preferences',
    menu: 'Menu',
    system: 'System (Auto)',
    midnight: 'Midnight',
    signIn: 'Sign In',
    register: 'Register',
    guestUser: 'Guest User',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    yourNamePlaceholder: 'Your Name',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    termsAndPrivacy: 'By continuing, you agree to our Terms & Privacy Policy',

    // Calendar Weekdays
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',

    // Feast/Calendar
    todaysFeast: "Today's Feast",
    annualFeast: 'Annual Feast',
    monthlyFeast: 'Monthly Commemoration',
    noFeastToday: 'No registered feast today',
    feastSecret: 'The Secret of the Day',
    todayLabel: 'Today',

    // Auth
    continueAsGuest: 'Continue as Guest',
    continueWithGoogle: 'Continue with Google',

    // Ethiopian Months
    month1: 'Meskerem',
    month2: 'Tikimt',
    month3: 'Hidar',
    month4: 'Tahsas',
    month5: 'Tir',
    month6: 'Yekatit',
    month7: 'Megabit',
    month8: 'Miyazia',
    month9: 'Ginbot',
    month10: 'Sene',
    month11: 'Hamle',
    month12: 'Nehase',
    month13: 'Pagume',

    // UI Labels
    showMore: 'Show More',
    showLess: 'Show Less',
    welcomeBackPrompt: 'Welcome Back',
    goodMorningPrompt: 'Good Morning',
    searchMezmurs: 'Search Mezmurs...',
    searchSections: 'Search Sections...',
    searchSuggestionsLabel: 'Search Suggestions',
    mezmurSectionsTitle: 'Mezmur Sections',
    confirmLogout: 'Are you sure you want to logout?',

    // Auth Labels
    guest: 'Guest',

    // Section Names (Data-driven)
    "የእመቤታችን የምስጋና መዝሙራት": "Hymns of St. Mary",
    "የቅዱስ ሚካኤል መዝሙራት": "Hymns of St. Michael",
    "የቅዱስ ገብርኤል መዝሙራት": "Hymns of St. Gabriel",
    "የከተራና የጥምቀት መዝሙራት": "Hymns of Epiphany",
    "የመድኃኔዓለም የምስጋና መዝሙራት": "Hymns of Medhane Alem",
    "የቅዱስ ጊዮርጊስ መዝሙራት": "Hymns of St. George",
    "የአቡነ ተክለ ሃይማኖት መዝሙራት": "Hymns of Abune Tekle H.",
    "የቃና ዘገሊላ መዝሙራት": "Hymns of Cana of Galilee",
    "የአቡነ ገብረ መንፈስ ቅዱስ መዝሙራት": "Hymns of Abune G. Menfes",
    "ስለ ቤተ ክርስቲያን": "About the Church",
    "የቅድስት አርሴማ": "Hymns of St. Arsema",
    "Afan Oromo Mezmurs": "Afan Oromo Mezmurs",

    // Section Short Labels
    'የእመቤታችን': 'St. Mary',
    'የቅዱስ ሚካኤል': 'St. Michael',
    'የቅዱስ ገብርኤል': 'St. Gabriel',
    'የጥምቀት': 'Epiphany',
    'የመድኃኔዓለም': 'Medhane Alem',
    'የቅዱስ ጊዮርጊስ': 'St. George',
    'የአቡነ ተክለ ሃይማኖት': 'Abune Tekle H.',
    'የቃና ዘገሊላ': 'Cana Galilee',
    'የአቡነ ገብረ መንፈስ ቅዱስ': 'Abune Gabre M.',
    'ስለ ቤተ ክርስቲያን': 'Church',
    'የቅድስት አርሴማ': 'St. Arsema',
    'Afan Oromo Mezmurs': 'Afan Oromo',

    // Categories
    'አጭር': 'Short',
    'ረጅም': 'Long',
    yearSuffix: 'E.C.',

    // Theme Names
    classic: 'Classic',
    forest: 'Forest',
    serene: 'Serene',
    royal: 'Royal',
    rose: 'Rose',
    midnight: 'Midnight',
    system: 'System (Auto)',

    // Playlists
    myPlaylists: 'My Playlists',
    createPlaylist: 'Create Playlist',
    playlistName: 'Playlist Name',
    enterPlaylistName: 'Enter playlist name',
    addHymn: 'Add Hymn',
    removeFromPlaylist: 'Remove from Playlist',
    deletePlaylist: 'Delete Playlist',
    noPlaylists: 'No playlists yet. Create one to get started!',
    renamePlaylist: 'Rename Playlist',
    playlistCreated: 'Playlist created',
    playlistDeleted: 'Playlist deleted',
    addToPlaylist: 'Add to Playlist',
    selectPlaylist: 'Select Playlist',
    items: 'items',
    playAll: 'Play All',
    confirmDeletePlaylist: 'Are you sure you want to delete this playlist?',
    save: 'Save',

    // Footer
    madeWithLove: 'Made with ❤️ for the Church',
    adminDashboard: 'Admin Dashboard',
    manageMezmurs: 'Manage Mezmurs',
    addMezmur: 'Add Mezmur',
    editMezmur: 'Edit Mezmur',
    manageUsers: 'Manage Users',
    adminFeedback: 'Feedback (Admin)',
    submitFeedback: 'Submit Feedback',
    feedbackSubject: 'Subject',
    feedbackMessage: 'Message',
    sendFeedback: 'Send Feedback',
    role: 'Role',
    makeAdmin: 'Make Admin',
    removeAdmin: 'Remove Admin',
    banUser: 'Ban User',
    unbanUser: 'Unban User',
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
    tigrigna: 'ትግርኛ',
    afanOromo: 'አፋን ኦሮሞ',

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
    playlists: 'የመዝሙር ዝርዝሮች',
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
    preferences: 'ምርጫዎች',
    menu: 'ማውጫ',
    system: 'ሲስተም (ራስ-ሰር)',
    midnight: 'ጥቁር',
    signIn: 'ግባ',
    register: 'ተመዝገብ',
    guestUser: 'እንግዳ ተጠቃሚ',
    welcomeBack: 'እንኳን ደህና መጡ',
    createAccount: 'አካውንት ይፍጠሩ',
    yourNamePlaceholder: 'የእርስዎ ስም',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    name: 'ስም',
    termsAndPrivacy: 'በመቀጠልህ በውላችን እና በግላዊነት ፖሊሲያችን ተስማምተሃል።',

    // Calendar Weekdays
    monday: 'ሰኞ',
    tuesday: 'ማክሰ',
    wednesday: 'ረቡዕ',
    thursday: 'ሐሙስ',
    friday: 'ዓርብ',
    saturday: 'ቅዳሜ',
    sunday: 'እሁድ',

    // Feast/Calendar
    todaysFeast: 'የዕለቱ መታሰቢያ',
    annualFeast: 'ዓመታዊ በዓል',
    monthlyFeast: 'የዕለቱ መታሰቢያ',
    noFeastToday: 'የተመዘገበ በዓል የለም',
    feastSecret: 'የዕለቱ ምስጢር',
    todayLabel: 'ዛሬ',

    // Auth
    continueAsGuest: 'እንደ እንግዳ ቀጥል',
    continueWithGoogle: 'በጎግል ቀጥል',

    // Ethiopian Months
    month1: 'መስከረም',
    month2: 'ጥቅምት',
    month3: 'ህዳር',
    month4: 'ታህሳስ',
    month5: 'ጥር',
    month6: 'የካቲት',
    month7: 'መጋቢት',
    month8: 'ሚያዚያ',
    month9: 'ግንቦት',
    month10: 'ሰኔ',
    month11: 'ሐምሌ',
    month12: 'ነሐሴ',
    month13: 'ጳጉሜ',

    // UI Labels
    showMore: 'ተጨማሪ አሳይ',
    showLess: 'ቀንስ',
    welcomeBackPrompt: 'እንኳን ደህና መጡ',
    goodMorningPrompt: 'ሰላም ላንተ ይሁን',
    searchMezmurs: 'መዝሙራትን ይፈልጉ...',
    searchSections: 'ክፍላትን ይፈልጉ...',
    searchSuggestionsLabel: 'የፍለጋ ጥቆማዎች',
    mezmurSectionsTitle: 'የመዝሙር ክፍላት',
    confirmLogout: 'በእርግጥ መውጣት ይፈልጋሉ?',

    // Auth Labels
    guest: 'እንግዳ',

    // Section Names (Data-driven) - Amharic stays same as it is the key
    "የእመቤታችን የምስጋና መዝሙራት": "የእመቤታችን የምስጋና መዝሙራት",
    "የቅዱስ ሚካኤል መዝሙራት": "የቅዱስ ሚካኤል መዝሙራት",
    "የቅዱስ ገብርኤል መዝሙራት": "የቅዱስ ገብርኤል መዝሙራት",
    "የከተራና የጥምቀት መዝሙራት": "የከተራና የጥምቀት መዝሙራት",
    "የመድኃኔዓለም የምስጋና መዝሙራት": "የመድኃኔዓለም የምስጋና መዝሙራት",
    "የቅዱስ ጊዮርጊስ መዝሙራት": "የቅዱስ ጊዮርጊስ መዝሙራት",
    "የአቡነ ተክለ ሃይማኖት መዝሙራት": "የአቡነ ተክለ ሃይማኖት መዝሙራት",
    "የቃና ዘገሊላ መዝሙራት": "የቃና ዘገሊላ መዝሙራት",
    "የአቡነ ገብረ መንፈስ ቅዱስ መዝሙራት": "የአቡነ ገብረ መንፈስ ቅዱስ መዝሙራት",
    "ስለ ቤተ ክርስቲያን": "ስለ ቤተ ክርስቲያን",
    "የቅድስት አርሴማ": "የቅድስት አርሴማ",
    "Afan Oromo Mezmurs": "የአፋን ኦሮሞ መዝሙራት",

    // Section Short Labels
    'የእመቤታችን': 'የእመቤታችን',
    'የቅዱስ ሚካኤል': 'የቅዱስ ሚካኤል',
    'የቅዱስ ገብርኤል': 'የቅዱስ ገብርኤል',
    'የጥምቀት': 'የጥምቀት',
    'የመድኃኔዓለም': 'የመድኃኔዓለም',
    'የቅዱስ ጊዮርጊስ': 'የቅዱስ ጊዮርጊስ',
    'የአቡነ ተክለ ሃይማኖት': 'የአቡነ ተክለ ሃይማኖት',
    'የቃና ዘገሊላ': 'የቃና ዘገሊላ',
    'የአቡነ ገብረ መንፈስ ቅዱስ': 'የአቡነ ገብረ መንፈስ ቅዱስ',
    'የቅድስት አርሴማ': 'የቅድስት አርሴማ',
    'Afan Oromo Mezmurs': 'አፋን ኦሮሞ',

    // Categories
    'አጭር': 'አጭር',
    'ረጅም': 'ረጅም',
    yearSuffix: 'ዓ.ም',

    // Theme Names
    classic: 'ክላሲክ',
    forest: 'አረንጓዴ',
    serene: 'ሰማያዊ',
    royal: 'ወይን ጠጅ',
    rose: 'ሮዝ',
    midnight: 'ጥቁር',
    system: 'ሲስተም (ራስ-ሰር)',

    // Playlists
    myPlaylists: 'የእኔ ዝርዝሮች',
    createPlaylist: 'ዝርዝር ፍጠር',
    playlistName: 'የዝርዝር ስም',
    enterPlaylistName: 'የዝርዝር ስም ያስገቡ',
    addHymn: 'መዝሙር ጨምር',
    removeFromPlaylist: 'ከዝርዝር አስወግድ',
    deletePlaylist: 'ዝርዝር አጥፋ',
    noPlaylists: 'ምንም ዝርዝር የለም። መጀመሪያ ዝርዝር ይፍጠሩ!',
    renamePlaylist: 'ስም ቀይር',
    playlistCreated: 'ዝርዝሩ ተፈጥሯል',
    playlistDeleted: 'ዝርዝሩ ተሰርዟል',
    addToPlaylist: 'ወደ ዝርዝር ጨምር',
    selectPlaylist: 'ዝርዝር ይምረጡ',
    items: 'መዝሙራት',
    playAll: 'ሁሉንም አጫውት',
    confirmDeletePlaylist: 'እርግጠኛ ነዎት ይህንን ዝርዝር ማጥፋት ይፈልጋሉ?',
    save: 'አስቀምጥ',

    // Footer
    madeWithLove: 'ለቤተክርስቲያን በፍቅር የተሰራ',
    adminDashboard: 'የአስተዳዳሪ ዳሽቦርድ',
    manageMezmurs: 'መዝሙራትን ያስተዳድሩ',
    addMezmur: 'መዝሙር ይጨምሩ',
    editMezmur: 'መዝሙር ያስተካክሉ',
    manageUsers: 'ተጠቃሚዎችን ያስተዳድሩ',
    adminFeedback: 'አስተያየቶች (አስተዳዳሪ)',
    submitFeedback: 'አስተያየት ይስጡ',
    feedbackSubject: 'ርዕስ',
    feedbackMessage: 'መልእክት',
    sendFeedback: 'አስተያየት ላክ',
    role: 'ሚና',
    makeAdmin: 'አስተዳዳሪ አድርግ',
    removeAdmin: 'ከአስተዳዳሪነት አስወግድ',
    banUser: 'አግድ',
    unbanUser: 'እገዳ አንሳ',
  },
  ti: {
    profile: 'መገለጺ',
    today: 'ሎሚ',
    settings: 'ቅንብር',
    favorites: 'ዝተመርጹ',
    home: 'ገዛ',
    mezmurs: 'መዝሙራት',
    player: 'መጻወቲ',
    appTitle: 'ቅዱስ ዜማ',
    appTagline: 'ኦርቶዶክስ መዝሙራት',
    calendar: 'መቁጸሪ',
    user: 'ተጠቃሚ',
    appearance: 'ትርኢት',
    language: 'ቛንቋ',
    notifications: 'መፍለጢታት',
    helpSupport: 'ሓገዝን ደገፍን',
    aboutUs: 'ብዛዕባና',
    logout: 'ውጻእ',
    amharic: 'አማርኛ',
    english: 'English',
    tigrigna: 'ትግርኛ',
    afanOromo: 'ኦሮምኛ',
    searchPlaceholder: 'ብአርእስቲ ወይ ግጥሚ ድለ...',
    sections: 'ክፍልታት',
    all: 'ኩሉ',
    short: 'ሓጺር',
    long: 'ነዊሕ',
    loadMore: 'ተወሳኺ አርኢ',
    noResults: 'ዝተረኽበ መዝሙር የለን',
    translation: 'ትርጉም',
    ok: 'እሺ',
    cancel: 'ሰርዝ',
    viewProfile: 'መገለጺ ርአ',
    version: 'ስሪት',
    preferences: 'ምርጫታት',
    menu: 'ዝርዝር',
    system: 'ሲስተም',
    midnight: 'ጥቁር',

    // Ethiopian Months (Amharic used as default for Ti/Om if unknown, but providing Ti)
    month1: 'መስከረም',
    month2: 'ጥቅምቲ',
    month3: 'ሕዳር',
    month4: 'ታሕሳስ',
    month5: 'ጥሪ',
    month6: 'ለካቲት',
    month7: 'መጋቢት',
    month8: 'ሚያዝያ',
    month9: 'ግንቦት',
    month10: 'ሰነ',
    month11: 'ሓምለ',
    month12: 'ነሓሰ',
    month13: 'ጳጉሜን',

    showMore: 'ተወሳኺ አርኢ',
    showLess: 'ቀንስ',
    welcomeBackPrompt: 'እንቋዕ ደሓን መጻእኩም',
    goodMorningPrompt: 'ሰላም ንዓኻ ይኹን',

    // Calendar Weekdays
    monday: 'ሰኑይ',
    tuesday: 'ሰሉስ',
    wednesday: 'ረቡዕ',
    thursday: 'ሓሙስ',
    friday: 'ዓርቢ',
    saturday: 'ቀዳም',
    sunday: 'ሰንበት',

    // Feast/Calendar
    todaysFeast: 'ናይ ሎሚ መዘከርታ',
    annualFeast: 'ዓመታዊ በዓል',
    monthlyFeast: 'ናይ ወርሒ መዘከርታ',
    noFeastToday: 'ዝተመዝገበ በዓል የለን',
    feastSecret: 'ምስጢር እታ ዕለት',
    todayLabel: 'ሎሚ',
    commemoration: 'መዘከርታ እታ ዕለት',

    // Missing Today/Home titles
    todaysFeatured: 'ንሎሚ ዝተመርጹ መዝሙራት',
    recentlyPlayed: 'ቅድሚ ሕጂ ዝተጻወቱ',
    seeAll: 'ኩሉ አርኢ',
    explore: 'ምድህሳስ',
    categories: 'ምድባት',
    searchHint: 'ኩሉ መዝሙራት ድለ...',

    // Auth Labels
    guest: 'ጋሻ',
    signIn: 'እቶ',
    guestUser: 'ጋሻ ተጠቃሚ',
    register: 'ተመዝገብ',
    email: 'ኢሜይል',
    password: 'መፍትሕ ምስጢር',
    name: 'ስም',
    termsAndPrivacy: 'ብምቕጻልካ ኣብ ውዕልናን ፖሊሲ ግላውነትናን ተሰማሚዕካ ኣለኻ።',
    playlists: 'ዝርዝር መዝሙራት',

    // Overflow Menu
    shareApp: 'መተግበሪ ኣካፍል',
    feedback: 'ርእይቶ',
    checkUpdates: 'ሓድሽ ስሪት ኣለዎ ድዩ',
    shareMessage: 'ነዚ መተግበሪ ተመልከት! ዝወደድካዮም መዝሙራት ንምስማዕ ሕጂ ኣውርዶ።',
    feedbackAlertTitle: 'ርእይቶ',
    feedbackAlertMessage: 'ርእይቶኹም ኣገዳሲ እዩ! ሓሳባትኩም ናብ natibadideb@gmail.com ስደዱልና።',
    updatesAlertTitle: 'ሓድሽ ስሪት ምርመራ',
    updatesAlertMessage: 'ድሮ ኣብ ዝሓደሸ ስሪት (v1.0.0) ኣለኹም።',
    moreOptions: 'ተወሳኺ ኣማራጺታት',
    chooseAction: 'ሓደ ተግባር ምረጽ:',
    great: 'ጽቡቕ',

    // Section Names (Data-driven)
    "የእመቤታችን የምስጋና መዝሙራት": "ናይ እመቤትና ምስጋና መዝሙራት",
    "የቅዱስ ሚካኤል መዝሙራት": "ናይ ቅዱስ ሚካኤል መዝሙራት",
    "የቅዱስ ገብርኤል መዝሙራት": "ናይ ቅዱስ ገብርኤል መዝሙራት",
    "የከተራና የጥምቀት መዝሙራት": "ናይ ጥምቀት መዝሙራት",
    "የመድኃኔዓለም የምስጋና መዝሙራት": "ናይ መድኃኔዓለም መዝሙራት",
    "የቅዱስ ጊዮርጊስ መዝሙራት": "ናይ ቅዱስ ጊዮርጊስ መዝሙራት",
    "የአቡነ ተክለ ሃይማኖት መዝሙራት": "ናይ አቡነ ተክለ ሃይማኖት",
    "የቃና ዘገሊላ መዝሙራት": "ናይ ቃና ዘገሊላ መዝሙራት",
    "የአቡነ ገብረ መንፈስ ቅዱስ መዝሙራት": "ናይ አቡነ ገብረ መንፈስ ቅዱስ",
    "ስለ ቤተ ክርስቲያን": "ብዛዕባ ቤተ ክርስቲያን",
    "የቅድስት አርሴማ": "ናይ ቅድስት አርሴማ",
    "Afan Oromo Mezmurs": "ናይ አፋን ኦሮሞ መዝሙራት",

    // Section Short Labels
    'የእመቤታችን': 'እመቤትና',
    'የቅዱስ ሚካኤል': 'ቅዱስ ሚካኤል',
    'የቅዱስ ገብርኤል': 'ቅዱስ ገብርኤል',
    'የጥምቀት': 'ጥምቀት',
    'የመድኃኔዓለም': 'መድኃኔዓለም',
    'የቅዱስ ጊዮርጊስ': 'ቅዱስ ጊዮርጊስ',
    'የአቡነ ተክለ ሃይማኖት': 'ተክለ ሃይማኖት',
    'የቃና ዘገሊላ': 'ቃና ዘገሊላ',
    'የአቡነ ገብረ መንፈስ ቅዱስ': 'ገብረ መንፈስ',
    'ስለ ቤተ ክርስቲያን': 'ቤተ ክርስቲያን',
    'የቅድስት አርሴማ': 'አርሴማ',
    'Afan Oromo Mezmurs': 'ኦሮምኛ',

    // Categories
    'አጭር': 'ሓጺር',
    'ረጅም': 'ነዊሕ',

    // Feast Names (Common keys for data-level translation)
    "መድኃኔዓለም": "መድኃኔዓለም",
    "ልደታ ማርያም": "ልደታ ማርያም",
    "ብሥራት": "ብሥራት",
    "በአታ ማርያም": "በአታ ማርያም",
    "ከና ዘገሊላ": "ቃና ዘገሊላ",
    "አስተርዮ ማርያም": "አስተርዮ ማርያም",
    "ኪዳነ ምሕረት": "ኪዳነ ምሕረት",
    "ደብረ ታቦር": "ደብረ ታቦር",
    "ፍልሰታ ለማርያም": "ፍልሰታ ለማርያም",
    "መስቀል": "መስቀል",
    "ሆሣዕና": "ሆሣዕና",
    "ስቅለት": "ስቅለት",
    "ትንሣኤ": "ትንሣኤ",
    "ዕርገት": "ዕርገት",
    "ጰራቅሊጦስ": "ጰራቅሊጦስ",
    "ቅዱስ ሚካኤል": "ቅዱስ ሚካኤል",
    "ቅዱስ ገብርኤል": "ቅዱስ ገብርኤል",
    "ቅዱስ ሩፋኤል": "ቅዱስ ሩፋኤል",
    "ቅዱስ ዑራኤል": "ቅዱስ ዑራኤል",
    "ቅዱስ ቂርቆስ": "ቅዱስ ቂርቆስ",
    "ቅዱስ እስጢፋኖስ": "ቅዱስ እስጢፋኖስ",
    "ቅዱስ ጊዮርጊስ": "ቅዱስ ጊዮርጊስ",
    "አቡነ ተክለ ሃይማኖት": "አቡነ ተክለ ሃይማኖት",
    "አቡነ ገብረ መንፈስ ቅዱስ": "አቡነ ገብረ መንፈስ ቅዱስ",
    "አቡነ አረጋዊ": "አቡነ አረጋዊ",
    "ሐና እና ኢያቄም": "ሐና እና ኢያቄም",
    "ጻድቃን": "ጻድቃን",
    "ሰማዕታት": "ሰማዕታት",
    "መላእክት": "መላእክት",
    "ልደተ ክርስቶስ": "ልደተ ክርስቶስ",
    "ጥምቀት": "ጥምቀት",
    "ልደታ ለማርያም": "ልደታ ለማርያም",
    "ጽዮን ማርያም": "ጽዮን ማርያም",
    "ቁስቋም": "ቁስቋም",
    "ሕንፀተ ቤተክርስቲያን": "ሕንፀተ ቤተክርስቲያን",
    "ቅድስት ሥላሴ": "ቅድስት ሥላሴ",
    "ተዘከረ መስቀሉ": "ተዘከረ መስቀሉ",
    "ኪዳነ ምሕረት (የካቲት 16)": "ኪዳነ ምሕረት (የካቲት 16)",
    "እንቁጣጣሽ (አዲስ ዓመት)": "አዲስ ዓመት (እንቁጣጣሽ)",
    "ዮሐንስ መጥምቅ": "ዮሐንስ መጥምቅ",
    "ጥንተ ስቅለቱ": "ጥንተ ስቅለቱ",
    "የደምራ በዓል": "የደምራ በዓል",
    "ቁልቢ": "ቁልቢ",
    "የገና ዋዜማ": "ናይ ገና ዋዜማ",
    "ልደት": "ልደት",
    "ቡሄ": "ቡሄ",
    "ጳጉሜ": "ጳጉሜን",

    "እንቁጣጣሽ (አዲስ ዓመት)፣ ዮሐንስ መጥምቅ": "አዲስ ዓመት (እንቁጣጣሽ)፡ ዮሃንስ መጥምቕ",
    "መስቀል (የደምራ በዓል)": "መስቀል (ናይ ደምራ በዓል)",
    "ቅዱስ ሚካኤል (ህዳር ሚካኤል)": "ቅዱስ ሚካኤል (ሕዳር ሚካኤል)",
    "በዓለ ገና (ልደት)": "በዓለ ገና (ልደት)",
    "ኪዳነ ምሕረት (የካቲት 16)": "ኪዳነ ምሕረት (ለካቲት 16)",
    "ቅዱስ ገብርኤል (ቁልቢ)": "ቅዱስ ገብርኤል (ቁልቢ)",
    "ደብረ ታቦር (ቡሄ)": "ደብረ ታቦር (ቡሄ)",

    // Feast Description keys
    "ቅዱስ ሚካኤል ሕዝበ እስራኤልን ከግብፅ ባርነት የመራበትና ባሕረ ኤርትራን የከፈለበት ዕለት ነው።": "ቅዱስ ሚካኤል ንህዝቢ እስራኤል ካብ ባርነት ግብጺ ዝመርሓሉን ባህረ ኤርትራ ዝኸፈለሉን ዕለት እዩ።",
    "እመቤታችን ንፅህናዋ ተጠብቆ እንዲኖር በሦስት ዓመቷ ወደ ቤተ መቅደስ የገባችበት ዕለት ነው።": "እመቤታችን ንፅህናኣ ተሓልዩ ክትነብር ኣብ ሰለስተ ዓመታ ናብ ቤተ መቅደስ ዝአተወትሉ ዕለት እዩ።",
    "ቅዱስ ገብርኤል ሠለስቱ ደቂቅን (ሦስቱን ወጣቶች) ከሚነድ እሳት ያዳነበት ዕለት ነው።": "ቅዱስ ገብርኤል ንሰለስቱ ደቂቅ ካብ ዝነድድ ሓዊ ዘድሓነሉ ዕለት እዩ።",
    "እመቤታችን ቅድስት ድንግል ማርያም የተወለደችበት ዕለት ነው።": "እመቤታችን ቅድስት ድንግል ማርያም ዝተወለደትሉ ዕለት እዩ።",
    "ንግሥት እሌኒ በጸሎትና በሱባኤ የእውነተኛውን መስቀል የተቀበረበትን ቦታ ያገኘችበትን ዕለት ለማስታወስ ይከበራል።": "ንግሥቲ እሌኒ ብጸሎትን ብሱባኤን ነቲ ዝተቐበረ ናይ ሓቂ መስቀል ዝረኸበትሉ ዕለት ንምዝካር ይኽበር።",
    "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ለዓለም ድኅነት በዕፀ መስቀል ላይ የፈጸመው የማዳን ሥራ ይታሰባል::": "ጐይታናን መድሓኒናን ኢየሱስ ክርስቶስ ንድሕነት ዓለም ኣብ ዕፀ መስቀል ዝፈጸሞ ናይ ምድሓን ስራሕ ይዝከር።",
    "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ለዓለም ድኅነት በዕፀ መስቀል ላይ የፈጸመው የማዳን ሥራ ይታሰባል::": "ጐይታናን መድሓኒናን ኢየሱስ ክርስቶስ ንድሕነት ዓለም ኣብ ዕፀ መስቀል ዝፈጸሞ ናይ ምድሓን ስራሕ ይዝከር።",
    "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ በቤተልሔም የተወለደበት ታላቅ የደስታ ዕለት ነው።": "ጐይታናን መድሓኒናን ኢየሱስ ክርስቶስ ኣብ ቤትልሔም ዝተወለደሉ ዓብዪ ናይ ሓጐስ ዕለት እዩ።",
    "ጌታችን በዮርዳኖስ ባሕር በዮሐንስ እጅ ለመጠመቁ መታሰቢያ የሚከበር ታላቅ በዓል ነው።": "ጐይታና ኣብ ባሕረ ዮርዳኖስ ብኢድ ዮሃንስ ንዝተጠመቖ መዘከርታ ዝኽበር ዓብዪ በዓል እዩ።",
    "ታላቁ ሰማዕት ቅዱስ ጊዮርጊስ በሰማዕትነት ያለፈበት ዓመታዊ በዓል ነው።": "እቲ ዓብዪ ሰማዕት ቅዱስ ጊዮርጊስ ብሰማዕትነት ዝሓለፈሉ ዓመታዊ በዓል እዩ።",

    yearSuffix: 'ዓ.ም',

    // UI Labels
    searchMezmurs: 'መዝሙራት ድለ...',
    searchSections: 'ክፍልታት ድለ...',
    searchSuggestionsLabel: 'ጥቆማታት ድለያ',
    mezmurSectionsTitle: 'ክፍልታት መዝሙር',
    confirmLogout: 'ርግጸኛ ዲኻ ክትወጽእ?',
    playlists: 'ዝርዝር መዝሙራት',
    recent: 'ቀረባ ግዜ',

    // Theme Names
    classic: 'ክላሲክ',
    forest: 'ቀጠልያ',
    serene: 'ሰማያዊ',
    royal: 'ወይን ጠጅ',
    rose: 'ሮዝ',
    midnight: 'ጥቁር',
    system: 'ሲስተም (ባዕላዊ)',

    // Playlists
    myPlaylists: 'ናተይ ዝርዝራት',
    createPlaylist: 'ዝርዝር ፍጠር',
    playlistName: 'ስም ዝርዝር',
    enterPlaylistName: 'ስም ዝርዝር የእትው',
    addHymn: 'መዝሙር ወስኽ',
    removeFromPlaylist: 'ካብ ዝርዝር አውጽእ',
    deletePlaylist: 'ዝርዝር አጥፋ',
    noPlaylists: 'ምንም ዝርዝር የለን። መጀመሪያ ዝርዝር ፍጠር!',
    renamePlaylist: 'ስም ቀይር',
    playlistCreated: 'ዝርዝር ተፈጢሩ',
    playlistDeleted: 'ዝርዝር ተሰሪዙ',
    addToPlaylist: 'ናብ ዝርዝር ወስኽ',
    selectPlaylist: 'ዝርዝር ምረጽ',
    items: 'መዝሙራት',
    playAll: 'ኩሉ አጻውት',
    confirmDeletePlaylist: 'ርግጸኛ ዲኻ እዚ ዝርዝር ክትስርዞ ትደሊ?',
    save: 'አቀምጥ',

    // Footer
    madeWithLove: 'ንቤተክርስቲያን ብፍቕሪ ዝተዳለወ',
    adminDashboard: 'ምምሕዳር ዳሽቦርድ',
    manageMezmurs: 'መዝሙራት አምሕድር',
    addMezmur: 'መዝሙር ወስኽ',
    editMezmur: 'መዝሙር አዐርይ',
    manageUsers: 'ተጠቃሚታት አምሕድር',
    adminFeedback: 'ርእይቶታት (ምምሕዳር)',
    submitFeedback: 'ርእይቶ ሃብ',
    feedbackSubject: 'አርእስቲ',
    feedbackMessage: 'መልእኽቲ',
    sendFeedback: 'ርእይቶ ስደድ',
    role: 'ተራ',
    makeAdmin: 'አማሓዳሪ ግበር',
    removeAdmin: 'ካብ አማሓዳሪነት አውጽእ',
    banUser: 'አግድ',
    unbanUser: 'እገዳ አልዕል',
  },
  om: {
    profile: 'Ibsa',
    today: 'Harr’a',
    settings: 'Sajataa',
    favorites: 'Filatamaa',
    home: 'Mana',
    mezmurs: 'Faaruu',
    player: 'Taphattuu',
    appTitle: 'ቅዱስ ዜማ',
    appTagline: 'Faaruu Ortodoksii',
    calendar: 'Kaalandarii',
    user: 'Fayyadamaa',
    appearance: 'Bifa',
    language: 'Afaan',
    notifications: 'Beeksisa',
    helpSupport: 'Gargaarsaa',
    aboutUs: 'Waa’ee Keenya',
    logout: 'Ba’i',
    amharic: 'Afaan Amaaraa',
    english: 'Afaan Ingiliffaa',
    tigrigna: 'Afaan Tigree',
    afanOromo: 'Afaan Oromoo',
    searchPlaceholder: 'Mata dureen barbaadi...',
    sections: 'Kutaalee',
    all: 'Hunda',
    short: 'Gabaabaa',
    long: 'Dheeraa',
    loadMore: 'Dabalata',
    noResults: 'Faaruun hin argamne',
    translation: 'Hiika',
    ok: 'Toole',
    cancel: 'Haqi',
    viewProfile: 'Ibsa rarr’i',
    version: 'Lakkoofsa',
    preferences: 'Filannoo',
    menu: 'Mana',
    system: 'Sirna',
    midnight: 'Dukkana',

    // Ethiopian Months (OM)
    month1: 'Fulbaana',
    month2: 'Onkololeessa',
    month3: 'Sadaasa',
    month4: 'Muddee',
    month5: 'Amajjii',
    month6: 'Gurraandhala',
    month7: 'Bitootessa',
    month8: 'Eebila',
    month9: 'Caamsaa',
    month10: 'Waxabajjii',
    month11: 'Adooleessa',
    month12: 'Hagayya',
    month13: 'Qaammee',

    showMore: 'Dabalata',
    showLess: 'Xinnayi',
    welcomeBackPrompt: 'Baga nagaan dhuftan',
    goodMorningPrompt: 'Nagaan siif haa tahu',
    searchMezmurs: 'Faaruu barbaadi...',
    searchSections: 'Kutaalee barbaadi...',
    searchSuggestionsLabel: 'Yaada barbaadduu',
    mezmurSectionsTitle: 'Kutaalee Faaruu',
    confirmLogout: 'Dhuguma ba’uu barbaadduu?',

    // Calendar Weekdays
    monday: 'Wiixata',
    tuesday: 'Kibxata',
    wednesday: 'Roobii',
    thursday: 'Kamisa',
    friday: 'Jimmata',
    saturday: 'Sanbata',
    sunday: 'Dilbata',

    // Feast/Calendar
    todaysFeast: 'Ayyaana Har’aa',
    annualFeast: 'Ayyaana Waggaa',
    monthlyFeast: 'Yaadannoo Ji’aa',
    noFeastToday: 'Ayyaanni galmeeffame hin jiru',
    feastSecret: 'Iccitii Guyyaa',
    todayLabel: 'Har’a',
    commemoration: 'Yaadannoo Guyyaa',

    // Missing Today/Home titles
    todaysFeatured: 'Faaruu Filatamaa Har’aa',
    recentlyPlayed: 'Dhiyootti kan Taphatame',
    seeAll: 'Hunda Argisiisi',
    explore: 'Sakatta’i',
    categories: 'Ramaddiiwwan',
    searchHint: 'Faaruu hunda barbaadi...',

    // Auth Labels
    guest: 'Keessummaa',
    signIn: 'Seeni',
    guestUser: 'Keessummaa',
    register: 'Galmaa’i',
    email: 'Iimeeyilii',
    password: 'Jecha Icchitii',
    name: 'Maqaa',
    termsAndPrivacy: 'Itti fufuun kee, Imaammata dhuunfaa fi waadaa keenya irratti walii galuu kee agarsiisa.',
    playlists: 'Tarree Taphaa',

    // Overflow Menu
    shareApp: 'Appii Qoodi',
    feedback: 'Yaada',
    checkUpdates: 'Haaromsa Ilaali',
    shareMessage: 'Appii kana ilaali! Faaruu jaallattu dhaggeeffachuuf amma buufadhu.',
    feedbackAlertTitle: 'Yaada',
    feedbackAlertMessage: 'Yaada keessan ni kabajina! Yaada keessan gara natibadideb@gmail.com nuu ergaa.',
    updatesAlertTitle: 'Haaromsa Sakatta\'uu',
    updatesAlertMessage: 'Duraan dursitee fooyya\'aa isa haaraa (v1.0.0) irra jirta.',
    moreOptions: 'Filannoo Dabalataa',
    chooseAction: 'Gocha tokko filadhu:',
    great: 'Gaarii',

    // Section Names (Data-driven)
    "የእመቤታችን የምስጋና መዝሙራት": "Faaruu Galataa Dubroo Maariyaam",
    "የቅዱስ ሚካኤል መዝሙራት": "Faaruu Qulqulluu Miikaa’el",
    "የቅዱስ ገብርኤል መዝሙራት": "Faaruu Qulqulluu Gabri’eel",
    "የከተራና የጥምቀት መዝሙራት": "Faaruu Cuuphaa",
    "የመድኃኔዓለም የምስጋና መዝሙራት": "Faaruu Madhaanee-Aalam",
    "የቅዱስ ጊዮርጊስ መዝሙራት": "Faaruu Qulqulluu Giyoorgis",
    "የአቡነ ተክለ ሃይማኖት መዝሙራት": "Faaruu Abuna Takla Haymaanot",
    "የቃና ዘገሊላ መዝሙራት": "Faaruu Kaanaazegaliilaa",
    "የአቡነ ገብረ መንፈስ ቅዱስ መዝሙራት": "Faaruu Abuna Gabramenfes Qudus",
    "ስለ ቤተ ክርስቲያን": "Waa’ee Mana Kiristaanaa",
    "የቅድስት አርሴማ": "Faaruu Qulqulleettii Arseemaa",
    "Afan Oromo Mezmurs": "Faaruu Afaan Oromoo",

    // Section Short Labels
    'የእመቤታችን': 'Dubroo Maariyaam',
    'የቅዱስ ሚካኤል': 'Maikaa’el',
    'የቅዱስ ገብርኤል': 'Gabri’eel',
    'የጥምቀት': 'Cuuphaa',
    'የመድኃኔዓለም': 'Madhaanee-Aalam',
    'የቅዱስ ጊዮርጊስ': 'Giyoorgis',
    'የአቡነ ተክለ ሃይማኖት': 'Takla Haymaanot',
    'Afan Oromo Mezmurs': 'Afaan Oromoo',
    'የቃና ዘገሊላ': 'Kaanaazegaliilaa',
    'የአቡነ ገብረ መንፈስ ቅዱስ': 'Gabramenfes',
    'ስለ ቤተ ክርስቲያን': 'Mana Kiristaanaa',
    'የቅድስት አርሴማ': 'Arseemaa',

    // Categories
    'አጭር': 'Gabaabaa',
    'ረጅም': 'Dheeraa',

    // Feast Names (Common keys for data-level translation in Oromo)
    "መድኃኔዓለም": "Madhaanee-Aalam",
    "ልደታ ማርያም": "Lideta Mariyam",
    "ብሥራት": "Bishraat",
    "በአታ ማርያም": "Ba'ata Mariyam",
    "ከና ዘገሊላ": "Kaanaazegaliilaa",
    "አስተርዮ ማርያም": "Asteriyo Mariyam",
    "ኪዳነ ምሕረት": "Kidane Mehret",
    "ደብረ ታቦር": "Debre Tabor",
    "ፍልሰታ ለማርያም": "Filseta Mariyam",
    "መስቀል": "Meskel",
    "ሆሣዕና": "Hosa'ina",
    "ስቅለት": "Siqlat",
    "ትንሣኤ": "Tinsa'ee",
    "ዕርገት": "Irget",
    "ጰራቅሊጦስ": "Paraklitos",
    "ቅዱስ ሚካኤል": "Kidus Miikaa'el",
    "ቅዱስ ገብርኤል": "Kidus Gabri'eel",
    "ቅዱስ ሩፋኤል": "Kidus Rupha'eel",
    "ቅዱስ ዑራኤል": "Kidus Uura'eel",
    "ቅዱስ ቂርቆስ": "Kidus Qirqos",
    "ቅዱስ እስጢፋኖስ": "Kidus Estifanos",
    "ቅዱስ ጊዮርጊስ": "Kidus Giyoorgis",
    "አቡነ ተክለ ሃይማኖት": "Abuna Takla Haymaanot",
    "አቡነ ገብረ መንፈስ ቅዱስ": "Abuna Gabramenfes Qudus",
    "አቡነ አረጋዊ": "Abuna Aregaawii",
    "ልደተ ክርስቶስ": "Lideta Kristos",
    "ጥምቀት": "Cuuphaa",
    "ጽዮን ማርያም": "Tsion Mariyam",

    // UI Labels
    playlists: 'Tarree Taphaa',
    recent: 'Dhiyootti',
    yearSuffix: 'E.C.',

    // Feast Descriptions (OM)
    "እመቤታችን ቅድስት ድንግል ማርያም የተወለደችበት ዕለት ነው።": "Guyyaa dhaloota Dubroo Maariyaam itti yaadatamu.",
    "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ለዓለም ድኅነት በዕፀ መስቀል ላይ የፈጸመው የማዳን ሥራ ይታሰባል::": "Hojii fayyina Gooftaa keenya Yesuus Kiristoos fayyina addunyaatiif hojjete yaadachuu.",
    "ቅዱስ ሚካኤል ሕዝበ እስራኤልን ከግብፅ ባርነት የመራበትና ባሕረ ኤርትራን የከፈለበት ዕለት ነው።": "Ayyaana ji’aa Qulqulluu Miikaa’el, kan Israa’eloota biyya Masirii keessaa baasee geggeesse.",
    "እመቤታችን ንፅህናዋ ተጠብቆ እንዲኖር በሦስት ዓመቷ ወደ ቤተ መቅደስ የገባችበት ዕለት ነው።": "Yaadannoo Dubroo Maariyaam ganna sadiitti gara mana qulqullummaa itti seente.",
    "ቅዱስ ገብርኤል ሠለስቱ ደቂቅን (ሦስቱን ወጣቶች) ከሚነድ እሳት ያዳነበት ዕለት ነው።": "Guyyaa Qulqulluu Gabri’eel dargaggoota sadan ibidda boba’u keessaa oolche.",
    "ንግሥት እሌኒ በጸሎትና በሱባኤ የእውነተኛውን መስቀል የተቀበረበትን ቦታ ያገኘችበትን ዕለት ለማስታወስ ይከበራል።": "Yaadannoo fannoo dhugaa mootitti Heleenaan argamuu isaa kabajama.",
    "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ በቤተልሔም የተወለደበት ታላቅ የደስታ ዕለት ነው።": "Guyyaa gammachuu dhaloota Gooftaa keenyaa fi Fayyisaa keenya Yesuus Kiristoos Beetalihemitti dhalate.",
    "ጌታችን በዮርዳኖስ ባሕር በዮሐንስ እጅ ለመጠመቁ መታሰቢያ የሚከበር ታላቅ በዓል ነው።": "Ayyaana guddaa cuuphaa Gooftaa keenyaa laga Yordaanositti Harka Yohaannisiin raawwatame.",
    "ታላቁ ሰማዕት ቅዱስ ጊዮርጊስ በሰማዕትነት ያለፈበት ዓመታዊ በዓል ነው።": "Ayyaana waggaa wareegamtoota gurguddoo Qulqulluu Giyoorgis yaadachuuf kabajamu.",
    "በዓለ ገና (ልደት)": "Dhaloota Kiristoos (Genaa)",
    "ጥምቀት": "Cuuphaa",
    "እንቁጣጣሽ (አዲስ ዓመት)፣ ዮሐንስ መጥምቅ": "Ayyaana Enqutaataash (Waggaa Haaraa)",
    "መስቀል (የደምራ በዓል)": "Ayyaana Masqalaa",
    "ቅዱስ ሚካኤል (ህዳር ሚካኤል)": "Ayyaana Qulqulluu Miikaa’el (Hidaar)",
    "ኪዳነ ምሕረት (የካቲት 16)": "Kidane Mehret (Guraandhala 16)",
    "ቅዱስ ገብርኤል (ቁልቢ)": "Qulqulluu Gabri’eel (Kulubii)",
    "ደብረ ታቦር (ቡሄ)": "Ayyaana Debre Tabor (Buhee)",

    // Theme Names
    classic: 'Kilaasikii',
    forest: 'Magariisa',
    serene: 'Cuquliisa',
    royal: 'Waatoo',
    rose: 'Roozii',
    midnight: 'Dukkana',
    system: 'Sirna (Of-danda’aa)',

    // Playlists
    myPlaylists: 'Tarreewwan Ko',
    createPlaylist: 'Tarree Uumi',
    playlistName: 'Maqaa Tarree',
    enterPlaylistName: 'Maqaa tarree galchi',
    addHymn: 'Faaruu Dabali',
    removeFromPlaylist: 'Tarree keessaa baasi',
    deletePlaylist: 'Tarree Haqi',
    noPlaylists: 'Tarreen hin jiru. Jalqabuuf tokko uumi!',
    renamePlaylist: 'Maqaa Jijjiiri',
    playlistCreated: 'Tarreen uumameera',
    playlistDeleted: 'Tarreen haqameera',
    addToPlaylist: 'Gara tarreetti dabali',
    selectPlaylist: 'Tarree filadhu',
    items: 'faarulee',
    playAll: 'Hunda Taphadhu',
    confirmDeletePlaylist: 'Dhuguma tarree kana haquu barbaadda?',
    save: 'Save',

    // Footer
    madeWithLove: 'Mana Kiristaanaaf jaalalaan kan hojjetame',
    adminDashboard: 'Admin Dashboard',
    manageMezmurs: 'Faaruu Bulchiinsa',
    addMezmur: 'Faaruu Dabali',
    editMezmur: 'Faaruu Sirreessi',
    manageUsers: 'Fayyadamtoota Bulchiinsa',
    adminFeedback: 'Yaada (Admin)',
    submitFeedback: 'Yaada Kenni',
    feedbackSubject: 'Mata Duree',
    feedbackMessage: 'Ergaa',
    sendFeedback: 'Yaada Ergi',
    role: 'Gahee',
    makeAdmin: 'Admin Godhi',
    removeAdmin: 'Admin irraa Kaasi',
    banUser: 'Dhorki',
    unbanUser: 'Dhorkaa Kaasi',
  },
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
      const validLangs = ['am', 'en', 'ti', 'om'];
      if (stored && validLangs.includes(stored)) {
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
      const validLangs = ['am', 'en', 'ti', 'om'];
      if (validLangs.includes(newLang)) {
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
