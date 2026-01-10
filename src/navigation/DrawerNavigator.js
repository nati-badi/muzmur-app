const React = require('react');
const { createDrawerNavigator } = require('@react-navigation/drawer');
const Sidebar = require('../components/Sidebar');
const TabNavigator = require('./TabNavigator');
const SettingsScreen = require('../screens/SettingsScreen').default || require('../screens/SettingsScreen');
const AboutScreen = require('../screens/AboutScreen').default || require('../screens/AboutScreen');

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
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
};

module.exports = DrawerNavigator;
