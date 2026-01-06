const React = require('react');
const { useState, useEffect } = React;
const { YStack, XStack, Text, Input, Button } = require('tamagui');
const { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useAuth } = require('../context/AuthContext');

const AuthScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
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
    
    // Firebase error codes mapping to English strings
    if (errorMessage.includes('auth/invalid-email')) {
      return 'Please enter a valid email address';
    }
    if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/invalid-credential')) {
      return 'No account found with this email';
    }
    if (errorMessage.includes('auth/wrong-password')) {
      return 'Incorrect password';
    }
    if (errorMessage.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists';
    }
    if (errorMessage.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters';
    }
    if (errorMessage.includes('auth/network-request-failed')) {
      return 'Network error. Please check your connection';
    }
    if (errorMessage.includes('auth/too-many-requests')) {
      return 'Too many attempts. Please try again later';
    }
    
    return 'Something went wrong. Please try again';
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && !displayName) {
      setError('Please enter your name');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
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
    setError('');
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
                    placeholder="Your Name"
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
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.textSecondary}
                  borderColor={(error && !email) || (error && error.includes('valid email')) ? theme.error : theme.borderColor}
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
                    setError('');
                  }}
                  secureTextEntry
                  placeholderTextColor={theme.textSecondary}
                  borderColor={(error && !password) || (error && (error.includes('6 characters') || error.includes('Incorrect password'))) ? theme.error : theme.borderColor}
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
                    {isLogin ? 'Sign In' : 'Register'}
                  </Text>
                )}
              </Button>

              <Button
                size="$5"
                backgroundColor={theme.surface}
                borderWidth={1.5}
                borderColor={theme.borderColor}
                paddingHorizontal="$4"
                marginTop="$4"
                onPress={handleGoogleLogin}
                disabled={loading}
                pressStyle={{ opacity: 0.8, backgroundColor: theme.borderColor }}
                borderRadius={12}
                elevation="$1"
              >
                <XStack space="$3" alignItems="center" justifyContent="center">
                  <Image 
                    source={require('../../assets/google_logo.png')} 
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text 
                    color={theme.text} 
                    fontSize={15} 
                    fontWeight="600"
                    fontFamily="$ethiopic"
                  >
                    Continue with Google
                  </Text>
                </XStack>
              </Button>

              <Button
                size="$4"
                backgroundColor="transparent"
                borderWidth={1.5}
                borderColor={theme.textSecondary + '40'} // More visible but still subtle
                marginTop="$2"
                onPress={handleGuestMode}
                disabled={loading}
                pressStyle={{ opacity: 0.6, backgroundColor: theme.borderColor }}
                borderRadius={12}
              >
                <XStack space="$2" alignItems="center">
                  <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                  <Text fontFamily="$ethiopic" fontSize="$3" color={theme.textSecondary} fontWeight="600">
                    Continue as Guest
                  </Text>
                </XStack>
              </Button>
            </YStack>

            {/* Footer */}
            <YStack paddingVertical="$5" paddingBottom={insets.bottom + 20} alignItems="center">
              <Text fontFamily="$body" fontSize="$2" color={theme.textSecondary} opacity={0.6} textAlign="center" paddingHorizontal="$6">
                By continuing, you agree to our Terms and Privacy Policy.
              </Text>
            </YStack>
          </ScrollView>
        </YStack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

module.exports = AuthScreen;
