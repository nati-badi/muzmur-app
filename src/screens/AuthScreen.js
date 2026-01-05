const React = require('react');
const { useState, useEffect } = React;
const { YStack, XStack, Text, Input, Button } = require('tamagui');
const { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAuth } = require('../context/AuthContext');

const AuthScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { signIn, signUp, signInAsGuest, signInWithGoogle, user } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Navigate to Main when user is fully authenticated (not guest)
  useEffect(() => {
    if (user && !user.isAnonymous) {
      navigation.replace('Main');
    }
  }, [user, navigation]);

  // Helper to format Firebase errors
  const formatError = (errorMessage) => {
    if (!errorMessage) return '';
    
    // Firebase error codes mapping to localized keys
    if (errorMessage.includes('auth/invalid-email')) {
      return t('invalidEmail');
    }
    if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/invalid-credential')) {
      // Modern safety: often combined to prevent account enumeration
      return t('userNotFound');
    }
    if (errorMessage.includes('auth/wrong-password')) {
      return t('wrongPassword');
    }
    if (errorMessage.includes('auth/email-already-in-use')) {
      return t('emailInUse');
    }
    if (errorMessage.includes('auth/weak-password')) {
      return t('weakPassword');
    }
    if (errorMessage.includes('auth/network-request-failed')) {
      return t('networkError');
    }
    if (errorMessage.includes('auth/too-many-requests')) {
      return t('tooManyRequests');
    }
    
    // Generic error
    return t('genericError');
  };

  const handleSubmit = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    // Validation
    if (!email || !password) {
      setError(t('fillAllFields'));
      return;
    }

    if (!isLogin && !displayName) {
      setError(t('nameRequired'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');

    const result = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password, displayName);

    setLoading(false);

    if (!result.success) {
      setError(formatError(result.error));
    }
    // Navigation is handled by useEffect when user state changes
  };

  const handleGuestMode = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setError('');
    
    const result = await signInAsGuest();
    setLoading(false);
    
    if (result.success) {
      navigation.replace('Main');
    } else {
      setError(formatError(result.error));
    }
  };

  const handleGoogleLogin = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setError('');

    const result = await signInWithGoogle();
    setLoading(false);

    if (result.success) {
      navigation.replace('Main');
    } else {
      if (result.error !== 'Sign in cancelled') {
          setError(formatError(result.error));
      }
    }
  };

  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setError(''); // Clear error when switching tabs
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <YStack alignItems="center" paddingVertical="$6" space="$2">
              <Ionicons name="musical-notes" size={60} color={theme.primary} />
              <Text fontFamily="$ethiopicSerif" fontSize="$8" fontWeight="800" color={theme.primary}>
                ቅዱስ ዜማ
              </Text>
              <Text fontFamily="$ethiopicSerif" fontSize="$4" color={theme.textSecondary} opacity={0.8}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
            </YStack>

            {/* Tab Switcher */}
            <XStack paddingHorizontal="$6" marginBottom="$4" space="$3">
              <Button
                f={1}
                size="$4"
                backgroundColor={isLogin ? theme.primary : 'transparent'}
                borderWidth={1}
                borderColor={theme.primary}
                onPress={() => handleTabSwitch(true)}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text 
                  fontFamily="$ethiopicSerif" 
                  fontSize="$4" 
                  fontWeight="700"
                  color={isLogin ? 'white' : theme.primary}
                >
                  Sign In
                </Text>
              </Button>
              <Button
                f={1}
                size="$4"
                backgroundColor={!isLogin ? theme.primary : 'transparent'}
                borderWidth={1}
                borderColor={theme.primary}
                onPress={() => handleTabSwitch(false)}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text 
                  fontFamily="$ethiopicSerif" 
                  fontSize="$4" 
                  fontWeight="700"
                  color={!isLogin ? 'white' : theme.primary}
                >
                  Register
                </Text>
              </Button>
            </XStack>

            {/* Form */}
            <YStack paddingHorizontal="$6" space="$3">
              {!isLogin && (
                <YStack space="$2">
                  <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text} fontWeight="600">
                    Name
                  </Text>
                  <Input
                    size="$5"
                    fontFamily="$ethiopic"
                    backgroundColor={theme.surface}
                    placeholder="Your name"
                    value={displayName}
                    placeholderTextColor={theme.textSecondary}
                    borderColor={error && !displayName && !isLogin ? theme.error : theme.borderColor}
                    focusStyle={{ borderColor: theme.primary, borderWidth: 2 }}
                    onChangeText={(text) => {
                      setDisplayName(text);
                      setError('');
                    }}
                  />
                </YStack>
              )}

              <YStack space="$2">
                <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text} fontWeight="600">
                  Email
                </Text>
                <Input
                  size="$5"
                  fontFamily="$body"
                  backgroundColor={theme.surface}
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text.trim().toLowerCase());
                    setError(''); // Clear error on input
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.textSecondary}
                  borderColor={(error && !email) || (error && error.includes(t('invalidEmail'))) ? theme.error : theme.borderColor}
                  focusStyle={{ borderColor: theme.primary, borderWidth: 2 }}
                />
              </YStack>

              <YStack space="$2">
                <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text} fontWeight="600">
                  Password
                </Text>
                <Input
                  size="$5"
                  fontFamily="$body"
                  backgroundColor={theme.surface}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(''); // Clear error on input
                  }}
                  secureTextEntry
                  placeholderTextColor={theme.textSecondary}
                  borderColor={(error && !password) || (error && (error.includes(t('passwordTooShort')) || error.includes(t('wrongPassword')))) ? theme.error : theme.borderColor}
                  focusStyle={{ borderColor: theme.primary, borderWidth: 2 }}
                />
              </YStack>

              {error ? (
                <YStack 
                  backgroundColor={`${theme.error}10`} 
                  padding="$3.5" 
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor={`${theme.error}40`}
                  animation="quick"
                  enterStyle={{ opacity: 0, scale: 0.95, y: -5 }}
                >
                  <XStack space="$2.5" alignItems="center">
                    <Ionicons name="alert-circle" size={22} color={theme.error} />
                    <Text fontFamily="$body" fontSize="$3" color={theme.error} fontWeight="600" f={1}>
                      {error}
                    </Text>
                  </XStack>
                </YStack>
              ) : null}

              <Button
                size="$5"
                backgroundColor={theme.primary}
                marginTop="$3"
                onPress={handleSubmit}
                disabled={loading}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                elevation="$4"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text fontFamily="$ethiopicSerif" fontSize="$5" fontWeight="800" color="white">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </Button>

              <Button
                size="$4"
                backgroundColor="white"
                borderWidth={1}
                borderColor="#ddd"
                marginTop="$4"
                onPress={handleGoogleLogin}
                disabled={loading}
                pressStyle={{ opacity: 0.8 }}
                elevation="$2"
              >
                <XStack space="$2" alignItems="center">
                  <Ionicons name="logo-google" size={20} color="black" />
                  <Text fontFamily="$ethiopic" fontSize="$3" color="black" fontWeight="600">
                    Continue with Google
                  </Text>
                </XStack>
              </Button>

              <Button
                size="$4"
                backgroundColor="transparent"
                borderWidth={1}
                borderColor={theme.borderColor}
                marginTop="$2"
                onPress={handleGuestMode}
                disabled={loading}
                pressStyle={{ opacity: 0.8 }}
              >
                <XStack space="$2" alignItems="center">
                  <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                  <Text fontFamily="$ethiopic" fontSize="$3" color={theme.textSecondary}>
                    Continue as Guest
                  </Text>
                </XStack>
              </Button>
            </YStack>

            {/* Footer */}
            <YStack paddingVertical="$5" paddingBottom={insets.bottom + 20} alignItems="center">
              <Text fontFamily="$body" fontSize="$2" color={theme.textSecondary} opacity={0.6} textAlign="center" paddingHorizontal="$6">
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
            </YStack>
          </ScrollView>
        </YStack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

module.exports = AuthScreen;
