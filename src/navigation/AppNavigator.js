const { createStackNavigator } = require('@react-navigation/stack');
const { createDrawerNavigator } = require('@react-navigation/drawer');
const { NavigationContainer } = require('@react-navigation/native');
const HomeScreen = require('../screens/HomeScreen').default || require('../screens/HomeScreen');
const DetailScreen = require('../screens/DetailScreen').default || require('../screens/DetailScreen');
const FavoritesScreen = require('../screens/FavoritesScreen').default || require('../screens/FavoritesScreen');
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
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

module.exports = AppNavigator;
