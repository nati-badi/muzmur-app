const { initializeApp, getApp, getApps } = require('firebase/app');
const { getAuth, initializeAuth, getReactNativePersistence } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5X9EhGAEaD_ia9RS9Ywl2j2hLOZe0Zjs",
  authDomain: "muzmur-app-v2-20d15.firebaseapp.com",
  projectId: "muzmur-app-v2-20d15",
  storageBucket: "muzmur-app-v2-20d15.firebasestorage.app",
  messagingSenderId: "696692999848",
  appId: "1:696692999848:web:21c578da833217a69a249d",
  measurementId: "G-L66DWCKV71"
};

// Singleton pattern for Firebase initialization
let app;
let auth;

if (getApps().length === 0) {
  // First time initialization
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  // Already initialized - get existing instances
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);
const { getStorage } = require('firebase/storage');
const storage = getStorage(app);

module.exports = {
  app,
  auth,
  db,
  storage
};
