const { initializeApp, getApp, getApps } = require('firebase/app');
const { getAuth, initializeAuth, getReactNativePersistence } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkrurc3q-NxT0gkopBxPPXLF72kwAA6bU",
  authDomain: "muzmur-app.firebaseapp.com",
  projectId: "muzmur-app",
  storageBucket: "muzmur-app.firebasestorage.app",
  messagingSenderId: "260498236434",
  appId: "1:260498236434:web:00655ece7c2861c71164cb",
  measurementId: "G-ESVDENWWSZ"
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

module.exports = {
  app,
  auth,
  db
};
