const React = require('react');
const { createContext, useContext, useState, useEffect, useCallback } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const UserProfileService = require('../services/UserProfileService');

const LOCAL_USER_ID = 'local_user';
const PROFILE_CACHE_KEY = `cached_user_profile_${LOCAL_USER_ID}`;

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);

  const user = React.useMemo(
    () => ({
      uid: LOCAL_USER_ID,
      displayName: profileData?.displayName || null,
      email: null,
      photoURL: profileData?.photoURL || null,
      isAnonymous: false,
    }),
    [profileData]
  );

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
        if (cached) {
          setProfileData(JSON.parse(cached));
        }
        const remote = await UserProfileService.getProfile(LOCAL_USER_ID);
        if (!cancelled && remote.success && remote.data) {
          setProfileData(remote.data);
          await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(remote.data));
        }
      } catch (e) {
        console.error('Error loading local profile:', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsDataReady(true);
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateProfilePicture = useCallback(async (url) => {
    setProfileData((prev) => {
      const next = { ...(prev || {}), photoURL: url };
      AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return { success: true };
  }, []);

  const updateDisplayName = useCallback(async (displayName) => {
    const result = await UserProfileService.saveProfile(LOCAL_USER_ID, { displayName });
    if (result.success) {
      setProfileData((prev) => {
        const next = { ...(prev || {}), displayName };
        AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    }
    return result;
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      profileData,
      loading,
      isDataReady,
      error: null,
      signUp: async () => ({ success: false, error: 'Offline app' }),
      signIn: async () => ({ success: false, error: 'Offline app' }),
      signInWithGoogle: async () => ({ success: false, error: 'Offline app' }),
      signInAsGuest: async () => ({ success: true, user }),
      logOut: async () => ({ success: true }),
      updateProfilePicture,
      updateDisplayName,
      isAuthenticated: true,
      isAnonymous: false,
      isAdmin: false,
    }),
    [user, profileData, loading, isDataReady, updateProfilePicture, updateDisplayName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
  useAuth,
};