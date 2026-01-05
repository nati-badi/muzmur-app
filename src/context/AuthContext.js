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
  const [error, setError] = useState(null);

  // Fetch Firestore profile data
  const fetchProfile = async (uid) => {
    try {
      const { doc, getDoc } = require('firebase/firestore');
      const { db } = require('../config/firebase.config');
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.uid);
      } else {
        setProfileData(null);
      }
      setLoading(false);
    });

    // Configure Google Sign-In
    GoogleSignin.configure({
        webClientId: '696692999848-fh9ajem00u585o8989jainpqn0nmcdo1.apps.googleusercontent.com',
    });

    return unsubscribe;
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
      
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo.data || userInfo; // Handle different versions of lib
      
      if (!idToken) throw new Error('No ID Token found');

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      
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

  const value = {
    user,
    profileData,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    logOut,
    updateProfilePicture,
    isAuthenticated: !!user && !user.isAnonymous,
    isAnonymous: user?.isAnonymous || false,
  };

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
