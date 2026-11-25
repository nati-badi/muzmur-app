const React = require('react');
const { YStack, XStack, Text, Button } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('../utils/icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const WelcomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  const handleContinue = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.replace('Drawer');
  };

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <YStack f={1} alignItems="center" justifyContent="center" space="$6" paddingHorizontal="$8">
        <Ionicons name="musical-notes" size={120} color={theme.primary} opacity={0.9} />

        <YStack space="$2" alignItems="center">
          <Text fontFamily="$ethiopicSerif" fontSize="$10" fontWeight="800" color={theme.primary} textAlign="center">
            {t('appTitle')}
          </Text>
          <Text fontFamily="$ethiopicSerif" fontSize="$5" color={theme.textSecondary} opacity={0.8} textAlign="center">
            {t('appTagline')}
          </Text>
        </YStack>

        <YStack space="$3" alignItems="center" marginTop="$4">
          <XStack space="$2" alignItems="center">
            <Ionicons name="book-outline" size={20} color={theme.accent} />
            <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text}>
              {t('offlineFeatureLyrics')}
            </Text>
          </XStack>
          <XStack space="$2" alignItems="center">
            <Ionicons name="heart-outline" size={20} color={theme.accent} />
            <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text}>
              {t('offlineFeatureFavorites')}
            </Text>
          </XStack>
          <XStack space="$2" alignItems="center">
            <Ionicons name="phone-portrait-outline" size={20} color={theme.accent} />
            <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text} textAlign="center">
              {t('offlineFeatureNoAccount')}
            </Text>
          </XStack>
        </YStack>
      </YStack>

      <YStack paddingHorizontal="$6" paddingVertical="$6" marginBottom={insets.bottom}>
        <Button
          size="$5"
          backgroundColor={theme.primary}
          onPress={handleContinue}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          elevation="$4"
        >
          <Text fontFamily="$ethiopicSerif" fontSize="$5" fontWeight="800" color="white">
            {t('continue')}
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
};

module.exports = WelcomeScreen;