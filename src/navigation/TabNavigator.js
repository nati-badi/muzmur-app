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
        tabBarActiveTintColor: '#FFFFFF', 
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          marginHorizontal: 15, // Slightly wider for more content space
          backgroundColor: theme.primary,
          borderRadius: 25,
          height: 70, // Slightly taller for better spacing
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontFamily: '$ethiopic',
          fontSize: 11, // Increased from 10
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        }
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
        options={{ tabBarLabel: t('player') }}
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
