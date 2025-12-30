const React = require('react');
const { useEffect, useCallback } = React;
const { SafeAreaProvider } = require('react-native-safe-area-context');
const AppNavigator = require('./src/navigation/AppNavigator').default || require('./src/navigation/AppNavigator');
const { StatusBar } = require('expo-status-bar');
const { TamaguiProvider } = require('tamagui');
const config = require('./src/tamagui.config').default || require('./src/tamagui.config');
const { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } = require('@expo-google-fonts/inter');
const { NotoSansEthiopic_400Regular, NotoSansEthiopic_700Bold } = require('@expo-google-fonts/noto-sans-ethiopic');
const { NotoSerifEthiopic_400Regular, NotoSerifEthiopic_700Bold } = require('@expo-google-fonts/noto-serif-ethiopic');
const { ThemeProvider } = require('./src/context/ThemeContext');
const { LanguageProvider } = require('./src/context/LanguageContext');
const { FavoritesProvider } = require('./src/context/FavoritesContext');
const SplashScreen = require('expo-splash-screen');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

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
      <ThemeProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <SafeAreaProvider onLayout={onLayoutRootView}>
              <StatusBar style="dark" />
              <AppNavigator />
            </SafeAreaProvider>
          </FavoritesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}

module.exports = App;
