const React = require('react');
const { useEffect, useCallback } = React;
const { SafeAreaProvider } = require('react-native-safe-area-context');
const AppNavigator = require('./src/navigation/AppNavigator').default || require('./src/navigation/AppNavigator');
const { StatusBar } = require('expo-status-bar');
const { TamaguiProvider, PortalProvider } = require('tamagui');
const config = require('./src/tamagui.config').default || require('./src/tamagui.config');
const { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } = require('@expo-google-fonts/inter');
const { NotoSansEthiopic_400Regular, NotoSansEthiopic_700Bold } = require('@expo-google-fonts/noto-sans-ethiopic');
const { NotoSerifEthiopic_400Regular, NotoSerifEthiopic_700Bold } = require('@expo-google-fonts/noto-serif-ethiopic');
const { ThemeProvider } = require('./src/context/ThemeContext');
const { LanguageProvider } = require('./src/context/LanguageContext');
const { FavoritesProvider } = require('./src/context/FavoritesContext');
const { AuthProvider, useAuth } = require('./src/context/AuthContext');
const { AudioProvider } = require('./src/context/GlobalAudioState.js');
const SplashScreen = require('expo-splash-screen');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

const { useAppTheme } = require('./src/context/ThemeContext');

// Internal component to handle dynamic status bar based on theme
const DynamicStatusBar = () => {
  const { theme } = useAppTheme();
  // If the theme background is dark (Midnight), use 'light' icons, otherwise 'dark'
  const statusBarStyle = theme.id === 'midnight' ? 'light' : 'dark';
  return <StatusBar style={statusBarStyle} />;
};

// Wrapper to pass userId to FavoritesProvider
const AppContent = ({ onLayoutRootView }) => {
  const { user, isAnonymous } = useAuth();
  
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AudioProvider>
          <FavoritesProvider userId={user?.uid} isAnonymous={isAnonymous}>
            <PortalProvider>
              <SafeAreaProvider onLayout={onLayoutRootView}>
                <DynamicStatusBar />
                <AppNavigator />
              </SafeAreaProvider>
            </PortalProvider>
          </FavoritesProvider>
        </AudioProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansEthiopic_400Regular,
    NotoSansEthiopic_700Bold,
    NotoSerifEthiopic_400Regular,
    NotoSerifEthiopic_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <AuthProvider>
        <AppContent onLayoutRootView={onLayoutRootView} />
      </AuthProvider>
    </TamaguiProvider>
  );
}

module.exports = App;
