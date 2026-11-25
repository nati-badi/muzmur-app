const React = require('react');
const { useEffect } = React;
const { createStackNavigator } = require('@react-navigation/stack');
const { NavigationContainer } = require('@react-navigation/native');
const { ActivityIndicator, View } = require('react-native');
const HomeScreen = require('../screens/HomeScreen').default || require('../screens/HomeScreen');
const DetailScreen = require('../screens/DetailScreen').default || require('../screens/DetailScreen');
const FavoritesScreen = require('../screens/FavoritesScreen').default || require('../screens/FavoritesScreen');
const SettingsScreen = require('../screens/SettingsScreen').default || require('../screens/SettingsScreen');
const WelcomeScreen = require('../screens/WelcomeScreen').default || require('../screens/WelcomeScreen');
const HymnPlayerScreen = require('../screens/HymnPlayerScreen').default || require('../screens/HymnPlayerScreen');
const { useAuth } = require('../context/AuthContext');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useAppTheme } = require('../context/ThemeContext');

const DrawerNavigator = require('./DrawerNavigator').default || require('./DrawerNavigator');

const Stack = createStackNavigator();

const NavigationService = require('../services/NavigationService');
const { navigationRef } = NavigationService;
const MiniPlayer = require('../components/MiniPlayer').default || require('../components/MiniPlayer');
const MiniPlayerManager = require('../components/MiniPlayerManager').default || require('../components/MiniPlayerManager');

const AppNavigator = () => {
  const { loading } = useAuth();
  const { theme, isLoaded: themeLoaded } = useAppTheme();
  const [hasSeenWelcome, setHasSeenWelcome] = React.useState(null);

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      const seen = await AsyncStorage.getItem('hasSeenWelcome');
      setHasSeenWelcome(!!seen);
    };
    checkWelcomeStatus();
  }, []);

  const isInitializing = loading || hasSeenWelcome === null || !themeLoaded;

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={hasSeenWelcome ? 'Drawer' : 'Welcome'}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
          <Stack.Screen name="MezmurList" component={HomeScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="HymnPlayer" component={HymnPlayerScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <MiniPlayerManager>
        {({ isVisible, hasBottomTabs }) => (
          <MiniPlayer
            onPlayerPress={(mezmur) => NavigationService.navigateToRoot('Detail', { mezmur })}
            isVisible={isVisible}
            hasTabs={hasBottomTabs}
          />
        )}
      </MiniPlayerManager>
    </View>
  );
};

module.exports = AppNavigator;