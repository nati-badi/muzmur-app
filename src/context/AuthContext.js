const React = require('react');
const { createContext, useContext, useState, useEffect } = React;
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} = require('firebase/auth');
const { auth } = require('../config/firebase.config');
const { GoogleSignin } = require('@react-native-google-signin/google-signin');

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [error, setError] = useState(null);

  const STORAGE_KEYS = {
    USER_PROFILE: 'cached_user_profile'
  };

  const getProfileKey = (uid) => `${STORAGE_KEYS.USER_PROFILE}_${uid}`;

  // Fetch Firestore profile data
  const fetchProfile = async (uid) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

      // 1. Try to load from cache first for instant UI
      const cacheKey = getProfileKey(uid);
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setProfileData(JSON.parse(cached));
      }

      // 2. Fetch fresh data from Firestore
      const { doc, getDoc } = require('firebase/firestore');
      const { db } = require('../config/firebase.config');
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
        // Update cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
        // Process any queued syncs when logging in
        const UserProfileService = require('../services/UserProfileService');
        UserProfileService.processQueue(currentUser.uid).catch(console.error);
      } else {
        setProfileData(null);
      }
      setIsDataReady(true);
      setLoading(false);
    });

    // Safety timeout to ensure loading eventually clears 
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setIsDataReady(true);
    }, 5000);

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '696692999848-fh9ajem00u585o8989jainpqn0nmcdo1.apps.googleusercontent.com',
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign in anonymously (guest mode)
  const signInAsGuest = async () => {
    try {
      setError(null);
      const result = await signInAnonymously(auth);
      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setError(null);
      await GoogleSignin.hasPlayServices();

      // Force account selection by signing out first
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore if not signed in
      }

      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo.data || userInfo; // Handle different versions of lib

      if (!idToken) throw new Error('No ID Token found');

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);

      // Ensure user document exists in Firestore
      if (result.user) {
        const { doc, getDoc, setDoc, serverTimestamp } = require('firebase/firestore');
        const { db } = require('../config/firebase.config');
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Create initial profile if it doesn't exist
          await setDoc(docRef, {
            displayName: result.user.displayName || 'User',
            email: result.user.email,
            photoURL: result.user.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            provider: 'google'
          });
        }
      }

      return { success: true, user: result.user };
    } catch (err) {
      if (err.message && err.message.includes('CANCELED')) {
        // User cancelled, do nothing
        return { success: false, error: 'Sign in cancelled' };
      }
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign out
  const logOut = async () => {
    try {
      setError(null);
      await signOut(auth);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update user profile picture
  const updateProfilePicture = async (url) => {
    try {
      if (!user) return { success: false, error: 'No user' };
      setError(null);

      // We no longer call updateProfile(auth.currentUser) with the potentially huge Base64 URL
      // Instead, we just update our local profileData state
      // The Base64 is already saved in Firestore by UserProfileService
      setProfileData(prev => ({
        ...prev,
        photoURL: url
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = React.useMemo(() => ({
    user,
    profileData,
    loading,
    isDataReady,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    logOut,
    updateProfilePicture,
    isAuthenticated: !!user && !user.isAnonymous,
    isAnonymous: user?.isAnonymous || false,
    isAdmin: profileData?.role === 'admin',
  }), [user, profileData, loading, error, signUp, signIn, signInWithGoogle, signInAsGuest, logOut, updateProfilePicture]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

module.exports = {
  AuthProvider,
  useAuth
};
