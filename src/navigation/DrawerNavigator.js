const React = require('react');
const { createDrawerNavigator } = require('@react-navigation/drawer');
const Sidebar = require('../components/Sidebar');
const TabNavigator = require('./TabNavigator');
const SettingsScreen = require('../screens/SettingsScreen').default || require('../screens/SettingsScreen');
const AboutScreen = require('../screens/AboutScreen').default || require('../screens/AboutScreen');
const FavoritesScreen = require('../screens/FavoritesScreen').default || require('../screens/FavoritesScreen');
const PlaylistListScreen = require('../screens/PlaylistListScreen').default || require('../screens/PlaylistListScreen');

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
      <Drawer.Screen name="Favorites" component={FavoritesScreen} />
      <Drawer.Screen name="PlaylistList" component={PlaylistListScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="Admin" component={require('./AdminNavigator').default || require('./AdminNavigator')} />
    </Drawer.Navigator>
  );
};

module.exports = DrawerNavigator;
