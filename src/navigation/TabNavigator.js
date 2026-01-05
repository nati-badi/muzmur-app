const React = require('react');
const { createMaterialTopTabNavigator } = require('@react-navigation/material-top-tabs');
const { Ionicons } = require('@expo/vector-icons');
const { Text, XStack, YStack } = require('tamagui');

const TodayScreen = require('../screens/TodayScreen').default || require('../screens/TodayScreen');
const ProfileScreen = require('../screens/ProfileScreen').default || require('../screens/ProfileScreen');
const CalendarScreen = require('../screens/CalendarScreen').default || require('../screens/CalendarScreen');
const SectionListScreen = require('../screens/SectionListScreen').default || require('../screens/SectionListScreen');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');

const TopTab = createMaterialTopTabNavigator();

const CustomBottomPill = ({ state, descriptors, navigation, theme, t }) => {
  return (
    <XStack
      position="absolute"
      bottom={20}
      left={15}
      right={15}
      backgroundColor={theme.primary}
      borderRadius={25}
      height={65}
      elevation={10}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.4}
      shadowRadius={10}
      paddingHorizontal={10}
      alignItems="center"
      justifyContent="space-around"
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
        
        let iconName;
        if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'Mezmurs') iconName = isFocused ? 'musical-notes' : 'musical-notes-outline';
        else if (route.name === 'Calendar') iconName = isFocused ? 'calendar-number' : 'calendar-number-outline';
        else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

        return (
          <YStack
            key={route.key}
            flex={1}
            alignItems="center"
            justifyContent="center"
            onPress={onPress}
            pressStyle={{ opacity: 0.7 }}
          >
            <Ionicons name={iconName} size={22} color={color} />
            <Text
              fontFamily="$ethiopic"
              fontSize={10}
              fontWeight="700"
              color={color}
              marginTop={2}
              numberOfLines={1}
            >
              {label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
};

const TabNavigator = () => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  const renderTabBar = React.useCallback(
    (props) => <CustomBottomPill {...props} theme={theme} t={t} />,
    [theme, t]
  );

  return (
    <TopTab.Navigator
      tabBarPosition="bottom"
      tabBar={renderTabBar}
      initialRouteName="Home"
      screenOptions={{
        swipeEnabled: true,
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
  );
};

module.exports = TabNavigator;
