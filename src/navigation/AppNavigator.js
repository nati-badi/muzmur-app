const React = require('react');
const { useEffect, useMemo } = React;
const { createStackNavigator } = require('@react-navigation/stack');
const { createDrawerNavigator } = require('@react-navigation/drawer');
const { NavigationContainer } = require('@react-navigation/native');
const { ActivityIndicator, View } = require('react-native');
const HomeScreen = require('../screens/HomeScreen').default || require('../screens/HomeScreen');
const DetailScreen = require('../screens/DetailScreen').default || require('../screens/DetailScreen');
const FavoritesScreen = require('../screens/FavoritesScreen').default || require('../screens/FavoritesScreen');
const ProfileScreen = require('../screens/ProfileScreen').default || require('../screens/ProfileScreen');
const SettingsScreen = require('../screens/SettingsScreen').default || require('../screens/SettingsScreen');
const WelcomeScreen = require('../screens/WelcomeScreen').default || require('../screens/WelcomeScreen');
const AuthScreen = require('../screens/AuthScreen').default || require('../screens/AuthScreen');
const AboutScreen = require('../screens/AboutScreen').default || require('../screens/AboutScreen');
const CalendarScreen = require('../screens/CalendarScreen').default || require('../screens/CalendarScreen');
const TabNavigator = require('./TabNavigator').default || require('./TabNavigator');
const Sidebar = require('../components/Sidebar').default || require('../components/Sidebar');
const { useAuth } = require('../context/AuthContext');
const { useFavorites } = require('../context/FavoritesContext');
const MigrationService = require('../services/MigrationService');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useAppTheme } = require('../context/ThemeContext');

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: '75%',
        },
      }}
    >
      <Drawer.Screen name="Main" component={TabNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const hasRunMigration = React.useRef(null);
  const { setFavoritesFromCloud } = useFavorites();
  const [hasSeenWelcome, setHasSeenWelcome] = React.useState(null);

  // Check if user has seen welcome screen
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      const seen = await AsyncStorage.getItem('hasSeenWelcome');
      setHasSeenWelcome(!!seen);
    };
    checkWelcomeStatus();
  }, []);

  // Handle migration when user logs in
  useEffect(() => {
    const handleUserLogin = async () => {
      if (user && !user.isAnonymous && hasRunMigration.current !== user.uid) {
        hasRunMigration.current = user.uid; // Set immediately to prevent race
        console.log('User logged in, starting migration for:', user.uid);
        
        // Perform migration
        const migrationResult = await MigrationService.performFullMigration(user.uid);
        
        if (migrationResult.success) {
          console.log('Migration successful');
          // Pull latest cloud data if it exists
          const cloudData = await MigrationService.pullCloudData(user.uid);
          
          if (cloudData.success && cloudData.synced) {
            console.log('Cloud data pulled successfully');
            // Reload favorites from user-specific storage
            const userStorageKey = `favorites_${user.uid}`;
            const storedFavorites = await AsyncStorage.getItem(userStorageKey);
            if (storedFavorites) {
              setFavoritesFromCloud(JSON.parse(storedFavorites));
            }
          }
        }
      }
    };

    handleUserLogin();
  }, [user, setFavoritesFromCloud]);

  // Show loading spinner while auth is initializing or welcome status unknown
  const isInitializing = loading || hasSeenWelcome === null;

  if (isInitializing) {
    const { theme } = useAppTheme();
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={!hasSeenWelcome ? "Welcome" : (user ? "Root" : "Auth")}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ gestureEnabled: false }}
        />
        
        {/* Main App Flow */}
        <Stack.Screen 
          name="Root" 
          component={DrawerNavigator}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

module.exports = AppNavigator;
