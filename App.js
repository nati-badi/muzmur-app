const React = require('react');
const { useCallback } = React;
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
const { AuthProvider } = require('./src/context/AuthContext');
const { AudioProvider } = require('./src/context/GlobalAudioState.js');
const { PlaylistProvider } = require('./src/context/PlaylistContext');
const SplashScreen = require('expo-splash-screen');

SplashScreen.preventAutoHideAsync().catch(() => { });

const { useAppTheme } = require('./src/context/ThemeContext');

const DynamicStatusBar = () => {
  const { theme } = useAppTheme();
  const statusBarStyle = theme.id === 'midnight' ? 'light' : 'dark';
  return <StatusBar style={statusBarStyle} />;
};

const AppContent = ({ onLayoutRootView }) => {
  const { theme } = useAppTheme();

  return (
    <TamaguiProvider config={config} theme={theme.id === 'midnight' ? 'dark' : 'light'}>
      <PortalProvider>
        <LanguageProvider>
          <AudioProvider>
            <FavoritesProvider>
              <PlaylistProvider>
                <SafeAreaProvider onLayout={onLayoutRootView}>
                  <DynamicStatusBar />
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

  const onLayoutRootView = useCallback(async () => {
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