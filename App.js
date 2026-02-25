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
const { PlaylistProvider } = require('./src/context/PlaylistContext');
const SplashScreen = require('expo-splash-screen');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => { });

const { useAppTheme } = require('./src/context/ThemeContext');

// Internal component to handle dynamic status bar based on theme
const DynamicStatusBar = () => {
  const { theme } = useAppTheme();
  // If the theme background is dark (Midnight), use 'light' icons, otherwise 'dark'
  const statusBarStyle = theme.id === 'midnight' ? 'light' : 'dark';
  return <StatusBar style={statusBarStyle} />;
};

const SyncService = require('./src/services/SyncService');
const OfflineStatusHeader = require('./src/components/OfflineStatusHeader');

// Wrapper to pass theme and other providers to AppNavigator
const AppContent = ({ onLayoutRootView }) => {
  const { user, isAnonymous } = useAuth();
  const { theme, isLoaded: themeLoaded } = useAppTheme();

  useEffect(() => {
    SyncService.start();
    return () => SyncService.stop();
  }, []);

  return (
    <TamaguiProvider config={config} theme={theme.id === 'midnight' ? 'dark' : 'light'}>
      <PortalProvider>
        <LanguageProvider>
          <AudioProvider>
            <FavoritesProvider userId={user?.uid} isAnonymous={isAnonymous}>
              <PlaylistProvider userId={user?.uid} isAnonymous={isAnonymous}>
                <SafeAreaProvider onLayout={onLayoutRootView}>
                  <DynamicStatusBar />
                  <OfflineStatusHeader />
                  <AppNavigator />
                </SafeAreaProvider>
              </PlaylistProvider>
            </FavoritesProvider>
          </AudioProvider>
        </LanguageProvider>
      </PortalProvider>
    </TamaguiProvider>
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

  // Use a ref to track if theme is ready
  const themeReadyRef = React.useRef(false);

  const onLayoutRootView = useCallback(async () => {
    // We only hide splash when fonts are ready AND the component layout fires
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent onLayoutRootView={onLayoutRootView} />
      </ThemeProvider>
    </AuthProvider>
  );
}

module.exports = App;
