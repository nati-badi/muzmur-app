const React = require('react');
const { YStack, XStack, Text, Button } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');

const TodayScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  return (
    <YStack f={1} backgroundColor={theme.background || '#F5F5F5'} paddingTop={insets.top}>
      {/* Header - Identical to HomeScreen */}
      <XStack 
        paddingHorizontal="$5" 
        paddingVertical="$3"
        alignItems="center"
        justifyContent="center"
      >
        <Button 
          position="absolute"
          left="$4"
          circular 
          size="$3" 
          backgroundColor="transparent"
          icon={<Ionicons name="menu-outline" size={28} color={theme.primary} />}
          onPress={() => navigation.toggleDrawer()}
          pressStyle={{ opacity: 0.6 }}
        />
        <Text fontFamily="$ethiopicSerif" fontSize={28} fontWeight="800" color={theme.primary} letterSpacing={-0.5}>
          ቅዱስ ዜማ
        </Text>
      </XStack>

      {/* Content */}
      <YStack f={1} justifyContent="center" alignItems="center" padding="$6" space="$4">
        <Ionicons name="calendar" size={80} color={theme.primary} opacity={0.3} />
        <Text 
          fontFamily="$ethiopicSerif" 
          fontSize="$7" 
          fontWeight="800" 
          color={theme.primary}
          textAlign="center"
        >
          {t('todaysFeatured')}
        </Text>
        <Text 
          fontFamily="$ethiopic" 
          fontSize="$4" 
          color={theme.textSecondary}
          textAlign="center"
          opacity={0.7}
        >
          {t('comingSoon')}
        </Text>
        <Text 
          fontFamily="$body" 
          fontSize="$3" 
          color={theme.textSecondary}
          textAlign="center"
          opacity={0.5}
          fontStyle="italic"
        >
          Today's featured hymns coming soon.
        </Text>
      </YStack>
    </YStack>
  );
};

module.exports = TodayScreen;
