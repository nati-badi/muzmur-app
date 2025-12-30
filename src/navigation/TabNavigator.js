const React = require('react');
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
const { Ionicons } = require('@expo/vector-icons');
const { useTheme } = require('tamagui');
const { Platform } = require('react-native');

const HomeScreen = require('../screens/HomeScreen').default || require('../screens/HomeScreen');
const TodayScreen = require('../screens/TodayScreen').default || require('../screens/TodayScreen');
const ProfileScreen = require('../screens/ProfileScreen').default || require('../screens/ProfileScreen');
const HymnPlayerScreen = require('../screens/HymnPlayerScreen').default || require('../screens/HymnPlayerScreen');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Mezmurs') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else if (route.name === 'Today') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'HymnPlayer') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.accent, 
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          marginHorizontal: 20,
          backgroundColor: theme.primary,
          borderRadius: 25,
          height: 65,
          paddingBottom: Platform.OS === 'ios' ? 15 : 8,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontFamily: '$ethiopic',
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Mezmurs" 
        component={HomeScreen} 
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen 
        name="Today" 
        component={TodayScreen} 
        options={{ tabBarLabel: t('today') }}
      />
      <Tab.Screen 
        name="HymnPlayer" 
        component={HymnPlayerScreen} 
        options={{ tabBarLabel: 'ማጫወቻ' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
};

module.exports = TabNavigator;
