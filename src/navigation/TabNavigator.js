const React = require('react');
const { createMaterialTopTabNavigator } = require('@react-navigation/material-top-tabs');
const { Ionicons } = require('@expo/vector-icons');
const { Text, XStack, YStack } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');

const TodayScreen = require('../screens/TodayScreen').default || require('../screens/TodayScreen');
const ProfileScreen = require('../screens/ProfileScreen').default || require('../screens/ProfileScreen');
const CalendarScreen = require('../screens/CalendarScreen').default || require('../screens/CalendarScreen');
const SectionListScreen = require('../screens/SectionListScreen').default || require('../screens/SectionListScreen');
const FavoritesScreen = require('../screens/FavoritesScreen').default || require('../screens/FavoritesScreen');
const MiniPlayer = require('../components/MiniPlayer').default || require('../components/MiniPlayer');
const NavigationService = require('../services/NavigationService');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');

const CustomBottomPill = require('../components/CustomBottomPill').default || require('../components/CustomBottomPill');

const TopTab = createMaterialTopTabNavigator();

const TabNavigator = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  const renderTabBar = React.useCallback(
    (props) => {
      // Register this specific tab navigator's ref with the central service
      // props.navigation here is the actual internal navigator reference
      NavigationService.registerTabRef(props.navigation);
      return <CustomBottomPill {...props} theme={theme} t={t} />;
    },
    [theme, t]
  );

  return (
    <YStack flex={1}>
      <TopTab.Navigator
        id="MainTabs"
        tabBarPosition="bottom"
        tabBar={renderTabBar}
        initialRouteName="Home"
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: false, // Prevents "stuck between tabs" glitch on some Android/iOS devices
          lazy: true,              // Only render tabs when focused for better performance
        }}
      >
        <TopTab.Screen 
          name="Home" 
          component={TodayScreen} 
          options={{ tabBarLabel: t('home') }}
        />
        <TopTab.Screen 
          name="Mezmurs" 
          component={SectionListScreen} 
          options={{ tabBarLabel: t('mezmurs') }}
        />
        <TopTab.Screen 
          name="Calendar" 
          component={CalendarScreen} 
          options={{ tabBarLabel: t('calendar') }}
        />

        <TopTab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarLabel: t('profile') }}
        />
      </TopTab.Navigator>
      <MiniPlayer onPlayerPress={(mezmur) => NavigationService.navigateToRoot('Detail', { mezmur })} />
    </YStack>
  );
};

module.exports = TabNavigator;

