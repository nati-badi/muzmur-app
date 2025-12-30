const React = require('react');
const { YStack, XStack, Text, Circle, Button, Separator } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { DrawerContentScrollView } = require('@react-navigation/drawer');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { View } = require('react-native');

const Sidebar = (props) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  // Determine active route to style the selected item
  const activeRoute = props.state.routeNames[props.state.index];
  const activeParams = props.state.routes[props.state.index].params;
  
  const menuItems = [
    { id: 1, label: t('home'), icon: 'home-outline', activeIcon: 'home', screen: 'Tabs', params: { screen: 'Mezmurs' } },
    { id: 2, label: t('favorites'), icon: 'heart-outline', activeIcon: 'heart', screen: 'Favorites' },
    { id: 3, label: t('today'), icon: 'calendar-outline', activeIcon: 'calendar', screen: 'Tabs', params: { screen: 'Today' } },
  ];

  const secondaryItems = [
    { id: 4, label: t('settings'), icon: 'settings-outline', activeIcon: 'settings', screen: 'Settings' },
    { id: 5, label: t('helpSupport'), icon: 'help-circle-outline', activeIcon: 'help-circle', screen: null }, // Placeholder
  ];

  const MenuItem = ({ item }) => {
    return (
      <Button
        backgroundColor="transparent"
        paddingVertical="$4"
        paddingHorizontal="$4"
        minHeight={60}
        borderRadius="$4"
        justifyContent="flex-start"
        onPress={() => {
          if (item.params) {
            props.navigation.navigate(item.screen, item.params);
          } else {
            props.navigation.navigate(item.screen);
          }
           setTimeout(() => props.navigation.closeDrawer(), 100);
        }}
        pressStyle={{ backgroundColor: `${theme.primary}08`, scale: 0.98 }}
        group 
      >
        <XStack alignItems="center" space="$4">
          <Circle 
            size={42} 
            backgroundColor={`${theme.text}05`} 
            alignItems="center" 
            justifyContent="center"
          >
            <Ionicons name={item.icon} size={22} color={theme.textSecondary} />
          </Circle>
          <Text 
            fontFamily="$ethiopic" 
            fontSize={16} 
            fontWeight="500" 
            color={theme.text}
            letterSpacing={0.5}
          >
            {item.label}
          </Text>
        </XStack>
      </Button>
    );
  };

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top} overflow="hidden">
      
      {/* Cool Themed Background Effect - Giant Watermark */}
      <View 
        position="absolute" 
        bottom={-50} 
        right={-50} 
        opacity={0.05} 
        pointerEvents="none"
      >
        <Ionicons name="musical-notes" size={300} color={theme.primary} />
      </View>

      {/* 1. Header: Clean & Bold */}
      <YStack paddingHorizontal="$6" paddingTop="$6" paddingBottom="$4">
        <XStack alignItems="center" space="$3">
          <Circle size={48} backgroundColor={theme.primary} elevation="$3">
             <Ionicons name="musical-notes" size={24} color={theme.accent} />
          </Circle>
          <YStack>
            <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="900" color={theme.text} letterSpacing={-0.5}>
              ቅዱስ ዜማ
            </Text>
            <Text fontFamily="$body" fontSize={11} color={theme.primary} opacity={0.8} letterSpacing={2} fontWeight="700">
              ORTHODOX HYMNS
            </Text>
          </YStack>
        </XStack>
      </YStack>

      <Separator borderColor={theme.borderColor} marginHorizontal="$6" opacity={0.5} marginBottom="$4" />

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}>
        
        {/* 2. Main Navigation */}
        <YStack paddingHorizontal="$4" space="$1">
          <Text 
            fontFamily="$body" 
            fontSize={11} 
            color={theme.textSecondary} 
            opacity={0.5} 
            marginBottom="$2" 
            fontWeight="700" 
            textTransform="uppercase"
            letterSpacing={1.5}
            marginLeft="$4"
          >
            Menu
          </Text>
          {menuItems.map((item) => <MenuItem key={item.id} item={item} />)}
        </YStack>

        <YStack height={60} />

        {/* 3. Secondary Navigation */}
        <YStack paddingHorizontal="$4" space="$1">
          <Text 
            fontFamily="$body" 
            fontSize={11} 
            color={theme.textSecondary} 
            opacity={0.5} 
            marginBottom="$2" 
            fontWeight="700" 
            textTransform="uppercase"
            letterSpacing={1.5}
            marginLeft="$4"
          >
            Preferences
          </Text>
          {secondaryItems.map((item) => <MenuItem key={item.id} item={item} />)}
        </YStack>

      </DrawerContentScrollView>

      {/* 4. Footer: Clean Docked User Profile */}
      <YStack 
        padding="$5" 
        paddingBottom={insets.bottom + 20}
        backgroundColor={theme.surface}
        borderTopWidth={1}
        borderTopColor={theme.borderColor}
      >
        <Button
          backgroundColor="transparent"
          padding={0}
          onPress={() => {
            props.navigation.navigate('Profile');
            props.navigation.closeDrawer();
          }}
          pressStyle={{ opacity: 0.6 }}
        >
          <XStack alignItems="center" space="$3">
            <Circle size={46} backgroundColor={theme.accent} borderWidth={2} borderColor={theme.background}>
              <Ionicons name="person" size={24} color="white" />
            </Circle>
            <YStack f={1} space="$1">
              <Text fontFamily="$ethiopic" fontSize={16} fontWeight="700" color={theme.text}>
                {t('user')}
              </Text>
              <Text fontFamily="$body" fontSize={11} color={theme.primary} opacity={0.8} fontWeight="600">
                View Profile
              </Text>
            </YStack>
            <Circle size={36} backgroundColor={theme.background} borderWidth={1} borderColor={theme.borderColor}>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Circle>
          </XStack>
        </Button>
      </YStack>
      
    </YStack>
  );
};

module.exports = Sidebar;
