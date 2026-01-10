const React = require('react');
const { useMemo, memo, useCallback } = React;
const { YStack, XStack, Text, Circle, Button, Separator } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { DrawerContentScrollView } = require('@react-navigation/drawer');
const { useNavigationState, getFocusedRouteNameFromRoute, TabActions } = require('@react-navigation/native');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAuth } = require('../context/AuthContext');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Image } = require('react-native');
const NavigationService = require('../services/NavigationService');

// Constants
const SEPARATOR_OPACITY = 0.5;
const WATERMARK_OPACITY = 0.06;

// Menu items
const MENU_ITEMS = [
  { id: 1, labelKey: 'home', icon: 'home-outline', activeIcon: 'home', screen: 'Home', navigator: 'Tabs' },
  { id: 3, labelKey: 'calendar', icon: 'calendar-outline', activeIcon: 'calendar', screen: 'Calendar', navigator: 'Tabs' },
  { id: 4, labelKey: 'favorites', icon: 'heart-outline', activeIcon: 'heart', screen: 'Favorites', navigator: 'Root' },
];

const SECONDARY_ITEMS = [
  { id: 6, labelKey: 'settings', icon: 'settings-outline', activeIcon: 'settings', screen: 'Settings', navigator: 'Drawer' },
  { id: 7, labelKey: 'aboutUs', icon: 'information-circle-outline', activeIcon: 'information-circle', screen: 'About', navigator: 'Drawer' },
];

// Components
const BackgroundWatermark = memo(({ primaryColor }) => (
  <YStack position="absolute" bottom={40} right={-40} opacity={WATERMARK_OPACITY} pointerEvents="none">
    <Ionicons name="musical-notes" size={300} color={primaryColor} />
  </YStack>
));

const SidebarHeader = memo(({ t, primary, text, accent }) => (
  <YStack paddingHorizontal="$6" paddingTop="$2" paddingBottom="$4">
    <XStack alignItems="center" space="$3">
      <Circle size={48} backgroundColor={primary} elevation="$3">
         <Ionicons name="musical-notes" size={24} color={accent} />
      </Circle>
      <YStack>
        <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="900" color={text} letterSpacing={-0.5}>
          {t('appTitle')}
        </Text>
        <Text fontFamily="$body" fontSize={11} color={primary} opacity={0.8} letterSpacing={2} fontWeight="700">
          {t('appTagline')}
        </Text>
      </YStack>
    </XStack>
  </YStack>
));

const SidebarFooter = memo(({ t, userInfo, profileData, user, surface, borderColor, background, accent, text, primary, textSecondary, insets, onNavigate }) => (
  <YStack padding="$4" paddingBottom={insets.bottom + 10} backgroundColor={surface} borderTopWidth={1} borderTopColor={borderColor} minHeight={90} justifyContent="center">
    <Button
      backgroundColor="transparent"
      padding={0}
      accessibilityRole="button"
      accessibilityLabel={t('viewProfile')}
      onPress={onNavigate}
      pressStyle={{ opacity: 0.6 }}
    >
      <XStack alignItems="center" space="$3">
        <Circle size={46} backgroundColor={accent} borderWidth={2} borderColor={background} overflow="hidden">
          {(profileData?.photoURL || user?.photoURL) ? (
            <Image source={{ uri: profileData?.photoURL || user?.photoURL }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Ionicons name="person" size={24} color="white" />
          )}
        </Circle>
        <YStack f={1} space="$1">
          <Text fontFamily="$ethiopic" fontSize={16} fontWeight="700" color={text} numberOfLines={1}>
            {userInfo.name}
          </Text>
          <Text fontFamily="$body" fontSize={11} color={primary} opacity={0.8} fontWeight="600" numberOfLines={1}>
            {userInfo.subtitle}
          </Text>
        </YStack>
        <Circle size={36} backgroundColor={background} borderWidth={1} borderColor={borderColor}>
          <Ionicons name="chevron-forward" size={18} color={textSecondary} />
        </Circle>
      </XStack>
    </Button>
  </YStack>
));

const MenuItem = memo(({ item, t, navigation, isActive, primaryColor, textColor, textSecondaryColor }) => {
  const isDisabled = !item.screen;
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
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        if (isDisabled) return;

        if (item.navigator === 'Tabs') {
          NavigationService.jumpToTab(item.screen);
        } else if (item.navigator === 'Drawer') {
          NavigationService.navigateInDrawer(item.screen);
        } else {
          NavigationService.navigateToRoot(item.screen);
        }
        
        requestAnimationFrame(() => navigation.closeDrawer());
      }}
      pressStyle={isDisabled ? {} : { backgroundColor: `${primaryColor}08`, scale: 0.98 }}
      group
    >
      <XStack alignItems="center" space="$4">
        <Circle size={42} backgroundColor={`${textColor}05`} alignItems="center" justifyContent="center">
          <Ionicons name={isActive ? item.activeIcon : item.icon} size={22} color={isActive ? primaryColor : textSecondaryColor} />
        </Circle>
        <Text fontFamily="$ethiopic" fontSize={16} fontWeight={isActive ? "700" : "500"} color={isActive ? primaryColor : textColor} letterSpacing={0.5}>
          {label}
        </Text>
      </XStack>
    </Button>
  );
});

// Sidebar Component
const Sidebar = (props) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { user, profileData, isAuthenticated, isAnonymous } = useAuth();
  const rawInsets = useSafeAreaInsets();
  const navigation = props.navigation;

  const { primary, text, textSecondary, background, borderColor, accent, surface } = theme;

  const insets = useMemo(() => ({
    top: Math.max(rawInsets.top, 20),
    bottom: Math.max(rawInsets.bottom, 20)
  }), [rawInsets.top, rawInsets.bottom]);

  // Track active route for menu highlighting
  const activeRoute = useNavigationState(state => {
    const route = state.routes[state.index];
    return getFocusedRouteNameFromRoute(route) || route.name;
  });

  const userInfo = useMemo(() => {
    if (isAuthenticated && (user?.displayName || profileData?.displayName)) {
      return { name: profileData?.displayName || user.displayName, subtitle: user.email || t('viewProfile') };
    } else if (isAnonymous) {
      return { name: t('guestUser'), subtitle: t('signInToSync') };
    } else {
      return { name: t('user'), subtitle: t('viewProfile') };
    }
  }, [isAuthenticated, user?.displayName, profileData?.displayName, isAnonymous, t]);

  const renderItem = useCallback(item => {
    const isActive = activeRoute === item.screen;

    return (
      <MenuItem
        key={item.id}
        item={item}
        t={t}
        navigation={navigation}
        isActive={isActive}
        primaryColor={primary}
        textColor={text}
        textSecondaryColor={textSecondary}
      />
    );
  }, [activeRoute, t, navigation, primary, text, textSecondary]);

  const handleFooterPress = useCallback(() => {
    NavigationService.jumpToTab('Profile');
    requestAnimationFrame(() => navigation.closeDrawer());
  }, [navigation]);

  return (
    <YStack f={1} backgroundColor={background} paddingTop={insets.top} overflow="hidden">
      <BackgroundWatermark primaryColor={primary} />
      <SidebarHeader t={t} primary={primary} text={text} accent={accent} />
      <Separator borderColor={borderColor} marginHorizontal="$6" opacity={SEPARATOR_OPACITY} marginBottom="$4" />

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10, paddingBottom: 0 }}>
        <YStack paddingHorizontal="$4" space="$1">
          <Text fontFamily="$body" fontSize={11} color={textSecondary} opacity={0.7} marginBottom="$2" fontWeight="700" textTransform="uppercase" letterSpacing={1.5} marginLeft="$4">
            {t('menu')}
          </Text>
          {MENU_ITEMS.map(renderItem)}
        </YStack>

        <YStack height={70} justifyContent="center" marginTop="$8">
          <Separator marginHorizontal="$10" borderColor={text} opacity={0.12} />
        </YStack>

        <YStack paddingHorizontal="$4" space="$1">
          <Text fontFamily="$body" fontSize={11} color={textSecondary} opacity={0.7} marginBottom="$2" fontWeight="700" textTransform="uppercase" letterSpacing={1.5} marginLeft="$4">
            {t('preferences')}
          </Text>
          {SECONDARY_ITEMS.map(renderItem)}
        </YStack>
      </DrawerContentScrollView>

      <SidebarFooter
        t={t}
        userInfo={userInfo}
        profileData={profileData}
        user={user}
        surface={surface}
        borderColor={borderColor}
        background={background}
        accent={accent}
        text={text}
        primary={primary}
        textSecondary={textSecondary}
        insets={insets}
        onNavigate={handleFooterPress}
      />
    </YStack>
  );
};

module.exports = Sidebar;
