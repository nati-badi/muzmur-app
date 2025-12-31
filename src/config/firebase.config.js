const { initializeApp } = require('firebase/app');
const { getAuth, initializeAuth, getReactNativePersistence } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

// Firebase configuration
// TODO: Replace with your Firebase project credentials
// Get these from Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAkrurc3q-NxT0gkopBxPPXLF72kwAA6bU",
  authDomain: "muzmur-app.firebaseapp.com",
  projectId: "muzmur-app",
  storageBucket: "muzmur-app.firebasestorage.app",
  messagingSenderId: "260498236434",
  appId: "1:260498236434:web:00655ece7c2861c71164cb",
  measurementId: "G-ESVDENWWSZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

module.exports = {
  app,
  auth,
  db
};
