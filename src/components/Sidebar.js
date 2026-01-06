const React = require('react');
const { YStack, XStack, Text, Circle, Button, Separator } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { DrawerContentScrollView } = require('@react-navigation/drawer');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAuth } = require('../context/AuthContext');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { View, Image } = require('react-native');

// Lift static data outside component to prevent recreation on every render
const MENU_ITEMS = [
  { id: 1, labelKey: 'home', icon: 'home-outline', activeIcon: 'home', screen: 'Main', params: { screen: 'Home' } },
  { id: 2, labelKey: 'favorites', icon: 'heart-outline', activeIcon: 'heart', screen: 'Main', params: { screen: 'Favorites' } },
  { id: 5, labelKey: 'calendar', icon: 'calendar-number-outline', activeIcon: 'calendar-number', screen: 'Main', params: { screen: 'Calendar' } },
];

const SECONDARY_ITEMS = [
  { id: 4, labelKey: 'settings', icon: 'settings-outline', activeIcon: 'settings', screen: 'Settings' },
  { id: 6, labelKey: 'aboutUs', icon: 'information-circle-outline', activeIcon: 'information-circle', screen: 'About' },
];

const MenuItem = React.memo(({ item, t, theme, navigation, language }) => {
  const isDisabled = !item.screen;
  // Handle localized labels or translation keys
  const label = t(item.labelKey);
  
  return (
    <Button
      backgroundColor="transparent"
      paddingVertical="$4"
      paddingHorizontal="$4"
      minHeight={60}
      borderRadius="$4"
      justifyContent="flex-start"
      opacity={isDisabled ? 0.4 : 1}
      onPress={() => {
        if (isDisabled) return;
        
        if (item.params) {
          navigation.navigate(item.screen, item.params);
        } else {
          navigation.navigate(item.screen);
        }
        
        setTimeout(() => navigation.closeDrawer(), 100);
      }}
      pressStyle={isDisabled ? {} : { backgroundColor: `${theme.primary}08`, scale: 0.98 }}
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
          {label}
        </Text>
      </XStack>
    </Button>
  );
});

const Sidebar = (props) => {
  const { theme } = useAppTheme();
  const { t, language } = useLanguage();
  const { user, profileData, isAuthenticated, isAnonymous } = useAuth();
  const rawInsets = useSafeAreaInsets();
  
  // Stabilize insets to prevent jumping on mount
  const insets = {
    top: Math.max(rawInsets.top, 20),
    bottom: Math.max(rawInsets.bottom, 20)
  };
  
  // Get user display name and subtitle
  const userInfo = React.useMemo(() => {
    if (isAuthenticated && (user?.displayName || profileData?.displayName)) {
      return {
        name: profileData?.displayName || user.displayName,
        subtitle: user.email || t('viewProfile')
      };
    } else if (isAnonymous) {
      return {
        name: t('guestUser'),
        subtitle: t('signInToSync')
      };
    } else {
      return {
        name: t('user'),
        subtitle: t('viewProfile')
      };
    }
  }, [isAuthenticated, user?.displayName, profileData?.displayName, isAnonymous, t]);


  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top} overflow="hidden">
      
      {/* Cool Themed Background Effect - Giant Watermark */}
      <View 
        position="absolute" 
        bottom={40} 
        right={-40} 
        opacity={0.06} 
        pointerEvents="none"
      >
        <Ionicons name="musical-notes" size={300} color={theme.primary} />
      </View>

      {/* 1. Header: Clean & Bold */}
      <YStack paddingHorizontal="$6" paddingTop="$2" paddingBottom="$4">
        <XStack alignItems="center" space="$3">
          <Circle size={48} backgroundColor={theme.primary} elevation="$3">
             <Ionicons name="musical-notes" size={24} color={theme.accent} />
          </Circle>
          <YStack>
            <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="900" color={theme.text} letterSpacing={-0.5}>
              {t('appTitle')}
            </Text>
            <Text fontFamily="$body" fontSize={11} color={theme.primary} opacity={0.8} letterSpacing={2} fontWeight="700">
              {t('appTagline')}
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
            opacity={0.7} 
            marginBottom="$2" 
            fontWeight="700" 
            textTransform="uppercase"
            letterSpacing={1.5}
            marginLeft="$4"
          >
            {t('menu')}
          </Text>
          {MENU_ITEMS.map((item) => (
            <MenuItem 
              key={item.id} 
              item={item} 
              t={t} 
              theme={theme} 
              navigation={props.navigation} 
              language={language} 
            />
          ))}
        </YStack>

        {/* Premium Section Divider with Spacious Gap */}
        <YStack height={70} justifyContent="center" marginTop="$8">
          <Separator marginHorizontal="$10" borderColor={theme.text} opacity={0.12} />
        </YStack>

        {/* 3. Secondary Navigation */}
        <YStack paddingHorizontal="$4" space="$1">
          
          <Text 
            fontFamily="$body" 
            fontSize={11} 
            color={theme.textSecondary} 
            opacity={0.7} 
            marginBottom="$2" 
            fontWeight="700" 
            textTransform="uppercase" 
            letterSpacing={1.5}
            marginLeft="$4"
          >
            {t('preferences')}
          </Text>
          {SECONDARY_ITEMS.map((item) => (
            <MenuItem 
              key={item.id} 
              item={item} 
              t={t} 
              theme={theme} 
              navigation={props.navigation} 
              language={language} 
            />
          ))}
        </YStack>

      </DrawerContentScrollView>

      {/* 4. Footer: Clean Docked User Profile - Stabilized Height */}
      <YStack 
        padding="$4" 
        paddingBottom={insets.bottom + 10}
        backgroundColor={theme.surface}
        borderTopWidth={1}
        borderTopColor={theme.borderColor}
        minHeight={90}
        justifyContent="center"
      >
        <Button
          backgroundColor="transparent"
          padding={0}
          onPress={() => {
            props.navigation.navigate('Main', { screen: 'Profile' });
            setTimeout(() => props.navigation.closeDrawer(), 100);
          }}
          pressStyle={{ opacity: 0.6 }}
        >
          <XStack alignItems="center" space="$3">
            <Circle size={46} backgroundColor={theme.accent} borderWidth={2} borderColor={theme.background} overflow="hidden">
              {(profileData?.photoURL || user?.photoURL) ? (
                <Image source={{ uri: profileData?.photoURL || user?.photoURL }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="person" size={24} color="white" />
              )}
            </Circle>
            <YStack f={1} space="$1">
              <Text fontFamily="$ethiopic" fontSize={16} fontWeight="700" color={theme.text} numberOfLines={1}>
                {userInfo.name}
              </Text>
              <Text fontFamily="$body" fontSize={11} color={theme.primary} opacity={0.8} fontWeight="600" numberOfLines={1}>
                {userInfo.subtitle}
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
