const { createStackNavigator } = require('@react-navigation/stack');
const { NavigationContainer } = require('@react-navigation/native');
const HomeScreen = require('../screens/HomeScreen').default || require('../screens/HomeScreen');
const DetailScreen = require('../screens/DetailScreen').default || require('../screens/DetailScreen');
const FavoritesScreen = require('../screens/FavoritesScreen').default || require('../screens/FavoritesScreen');

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

module.exports = AppNavigator;
