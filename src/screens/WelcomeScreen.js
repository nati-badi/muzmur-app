const React = require('react');
const { YStack, XStack, Text, Button } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const WelcomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.replace('Auth');
  };

  const handleContinueWithoutAccount = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.replace('Drawer');
  };

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* Header */}
      <YStack f={1} alignItems="center" justifyContent="center" space="$6" paddingHorizontal="$8">
        <Ionicons name="musical-notes" size={120} color={theme.primary} opacity={0.9} />
        
        <YStack space="$2" alignItems="center">
          <Text fontFamily="$ethiopicSerif" fontSize="$10" fontWeight="800" color={theme.primary} textAlign="center">
            ቅዱስ ዜማ
          </Text>
          <Text fontFamily="$ethiopicSerif" fontSize="$5" color={theme.textSecondary} opacity={0.8} textAlign="center">
            Ethiopian Orthodox Hymns
          </Text>
        </YStack>

        <YStack space="$3" alignItems="center" marginTop="$4">
          <XStack space="$2" alignItems="center">
            <Ionicons name="cloud-upload-outline" size={20} color={theme.accent} />
            <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text}>
              Sync across devices
            </Text>
          </XStack>
          <XStack space="$2" alignItems="center">
            <Ionicons name="heart-outline" size={20} color={theme.accent} />
            <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text}>
              Save your favorites
            </Text>
          </XStack>
          <XStack space="$2" alignItems="center">
            <Ionicons name="person-circle-outline" size={20} color={theme.accent} />
            <Text fontFamily="$ethiopic" fontSize="$3" color={theme.text}>
              Personalized experience
            </Text>
          </XStack>
        </YStack>
      </YStack>

      {/* Action Buttons */}
      <YStack paddingHorizontal="$6" paddingVertical="$6" space="$3" marginBottom={insets.bottom}>
        <Button
          size="$5"
          backgroundColor={theme.primary}
          onPress={handleGetStarted}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          elevation="$4"
        >
          <Text fontFamily="$ethiopicSerif" fontSize="$5" fontWeight="800" color="white">
            Get Started
          </Text>
        </Button>

        <Button
          size="$4"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor={theme.borderColor}
          onPress={handleContinueWithoutAccount}
          pressStyle={{ opacity: 0.8 }}
        >
          <XStack space="$2" alignItems="center">
            <Ionicons name="play-circle-outline" size={20} color={theme.textSecondary} />
            <Text fontFamily="$ethiopic" fontSize="$3" color={theme.textSecondary}>
              Continue without account
            </Text>
          </XStack>
        </Button>
      </YStack>
    </YStack>
  );
};

module.exports = WelcomeScreen;
