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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Singleton for Auth with persistence
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);

module.exports = {
  app,
  auth,
  db
};
