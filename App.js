const React = require('react');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const AppNavigator = require('./src/navigation/AppNavigator').default || require('./src/navigation/AppNavigator');
const { StatusBar } = require('expo-status-bar');
const { TamaguiProvider } = require('tamagui');
const config = require('./src/tamagui.config').default || require('./src/tamagui.config');

function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}

module.exports = App;
