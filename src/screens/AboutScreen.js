const React = require('react');
const { YStack, Text, XStack, ScrollView, View, Separator, Button } = require('tamagui');
const { TouchableOpacity, Linking, Image } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');

const AboutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  const InfoSection = ({ title, children }) => (
    <YStack marginBottom="$6" space="$3">
      <Text 
        fontFamily="$ethiopic" 
        fontSize="$5" 
        fontWeight="700" 
        color={theme.primary}
        opacity={0.8}
        letterSpacing={0.5}
      >
        {title}
      </Text>
      <YStack 
        backgroundColor={theme.surface} 
        padding="$4" 
        borderRadius="$4" 
        borderWidth={1} 
        borderColor={theme.borderColor}
      >
        {children}
      </YStack>
    </YStack>
  );

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* Header */}
      <XStack 
        paddingHorizontal="$5" 
        paddingVertical="$3"
        alignItems="center"
        justifyContent="center"
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 16 }}
        >
          <XStack alignItems="center" space="$1">
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </XStack>
        </TouchableOpacity>
        <Text fontFamily="$ethiopicSerif" fontSize="$7" fontWeight="800" color={theme.primary}>
          {t('aboutUs')}
        </Text>
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        
        {/* App Logo/Branding */}
        <YStack alignItems="center" marginBottom="$8">
           <View 
             width={100} 
             height={100} 
             borderRadius={50} 
             backgroundColor={theme.primary} 
             alignItems="center" 
             justifyContent="center"
             elevation={4}
             shadowColor={theme.shadowColor}
             shadowOpacity={0.3}
             marginBottom="$4"
           >
             <Ionicons name="musical-notes" size={50} color={theme.accent} />
           </View>
           <Text fontFamily="$ethiopicSerif" fontSize="$8" fontWeight="900" color={theme.text} textAlign="center">
             {t('appTitle')}
           </Text>
           <Text fontFamily="$body" fontSize="$3" color={theme.textSecondary} textAlign="center" opacity={0.7} marginTop="$2">
             {t('appTagline')}
           </Text>
           <Text fontFamily="$body" fontSize="$2" color={theme.primary} textAlign="center" fontWeight="700" marginTop="$2" opacity={0.5} letterSpacing={1}>
             {t('version').toUpperCase()} 1.0.0
           </Text>
        </YStack>

        {/* Mission Statement */}
        <InfoSection title={t('ourMission')}>
          <Text fontFamily="$body" fontSize="$4" lineHeight={24} color={theme.text} opacity={0.8}>
            {t('missionStatement')}
          </Text>
        </InfoSection>

        {/* Developer Info */}
        <InfoSection title={t('developerLabel')}>
           <XStack alignItems="center" space="$3" marginBottom="$2">
              <Ionicons name="code-slash" size={20} color={theme.primary} />
              <Text fontFamily="$body" fontSize="$4" fontWeight="600" color={theme.text}>
                 Badi Build
              </Text>
           </XStack>
           <Separator borderColor={theme.borderColor} marginVertical="$2" opacity={0.5} />
           <Button 
             chromeless 
             onPress={() => openLink('mailto:natibadideb@gmail.com')}
             justifyContent="flex-start"
             paddingLeft={0}
             pressStyle={{ opacity: 0.6 }}
           >
              <XStack alignItems="center" space="$2">
                <Ionicons name="mail-outline" size={18} color={theme.primary} />
                <Text fontFamily="$body" fontSize="$3" color={theme.primary}>
                  natibadideb@gmail.com
                </Text>
              </XStack>
           </Button>
        </InfoSection>

        <YStack alignItems="center" marginTop="$4" opacity={0.4}>
          <Text fontFamily="$body" fontSize="$2" color={theme.textSecondary}>
            © 2025 {t('appTitle')}. All rights reserved.
          </Text>
        </YStack>

      </ScrollView>
    </YStack>
  );
};

module.exports = AboutScreen;
