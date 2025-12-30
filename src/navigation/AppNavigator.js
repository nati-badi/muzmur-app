const { createStackNavigator } = require('@react-navigation/stack');
const { createDrawerNavigator } = require('@react-navigation/drawer');
const { NavigationContainer } = require('@react-navigation/native');
const HomeScreen = require('../screens/HomeScreen').default || require('../screens/HomeScreen');
const DetailScreen = require('../screens/DetailScreen').default || require('../screens/DetailScreen');
const FavoritesScreen = require('../screens/FavoritesScreen').default || require('../screens/FavoritesScreen');
const ProfileScreen = require('../screens/ProfileScreen').default || require('../screens/ProfileScreen');
const SettingsScreen = require('../screens/SettingsScreen').default || require('../screens/SettingsScreen');
const TabNavigator = require('./TabNavigator').default || require('./TabNavigator');
const Sidebar = require('../components/Sidebar').default || require('../components/Sidebar');

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
      <Drawer.Screen name="Tabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Drawer"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

module.exports = AppNavigator;
