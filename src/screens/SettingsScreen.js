const React = require('react');
const { useState, useMemo } = React;
const { useColorScheme } = require('react-native');
const { YStack, Text, XStack, Circle, ScrollView, Button, View } = require('tamagui');
const { TouchableOpacity } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { THEMES } = require('../constants/theme');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAuth } = require('../context/AuthContext');

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, themeMode, setTheme } = useAppTheme();
  const { language, changeLanguage, t } = useLanguage();
  const systemColorScheme = useColorScheme();
  const { isAuthenticated, logOut } = useAuth();
  const [showThemes, setShowThemes] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigation.replace('Auth');
  };

  const themeOptions = useMemo(() => {
    return [
      { 
        id: 'system', 
        name: t('system'), 
        background: '#888', // Placeholder for split view
        text: '#FFFFFF',
        isSystem: true 
      },
      ...Object.values(THEMES).map(tOpt => ({
        ...tOpt,
        name: t(tOpt.id)
      }))
    ];
  }, [t]);

  const languages = [
    { id: 'am', label: t('amharic') },
    { id: 'en', label: t('english') },
    { id: 'ti', label: t('tigrigna') },
    { id: 'om', label: t('afanOromo') },
  ];

  const SettingRow = ({ icon, label, sublabel, onPress, rightIcon = "chevron-forward", disabled = false, isActive = false, isDanger = false }) => (
    <TouchableOpacity 
      onPress={disabled ? null : onPress} 
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={{
        backgroundColor: isActive ? `${theme.primary}10` : theme.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: isActive ? theme.accent : theme.borderColor,
        marginBottom: 12,
        opacity: disabled ? 0.4 : 1,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={icon} size={24} color={isDanger ? theme.error : theme.primary} style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text 
              fontFamily="$ethiopic" 
              fontSize="$5" 
              color={isDanger ? theme.error : theme.text} 
              fontWeight="600"
              marginBottom={sublabel ? 4 : 0}
            >
              {label}
            </Text>
            {sublabel && (
              <Text 
                fontFamily="$body" 
                fontSize="$2" 
                color={theme.textSecondary}
                opacity={0.8}
              >
                {sublabel}
              </Text>
            )}
          </View>
          <Ionicons name={rightIcon} size={20} color={isDanger ? theme.error : theme.primary} style={{ opacity: 0.5 }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* Header */}
      <XStack paddingHorizontal="$5" paddingVertical="$3" alignItems="center" justifyContent="center">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 16 }}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text fontFamily="$ethiopicSerif" fontSize="$7" fontWeight="800" color={theme.primary}>
          {t('settings')}
        </Text>
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <YStack padding="$6" space="$4">
          
          {/* Appearance Section */}
          <SettingRow 
            icon="color-palette-outline" 
            label={t('appearance')}
            sublabel={themeMode === 'system' ? t('system') : t(theme.id)}
            onPress={() => setShowThemes(!showThemes)}
            rightIcon={showThemes ? "chevron-up" : "chevron-down"}
          />

          {showThemes && (
            <YStack backgroundColor={theme.surface} padding="$4" borderRadius="$4" borderWidth={1} borderColor={theme.borderColor} marginBottom="$3" elevation="$1">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {themeOptions.map((opt) => (
                  <TouchableOpacity key={opt.id} onPress={() => setTheme(opt.id)} style={{ width: '48%', marginBottom: 12 }}>
                    <View style={{
                      backgroundColor: opt.isSystem ? '#F0F0F0' : opt.background,
                      height: 60, // Slightly taller for swatches
                      borderRadius: 12,
                      borderWidth: themeMode === opt.id ? 2 : 1.5,
                      borderColor: themeMode === opt.id ? theme.accent : theme.borderColor,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      elevation: 3, // Make them pop
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}>
                      {/* Background Visuals */}
                      {opt.isSystem ? (
                        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', backgroundColor: '#1A1A1A' }} />
                      ) : (
                        <XStack position="absolute" right={8} top={8} space="$1">
                          <Circle size={8} backgroundColor={opt.primary} borderWidth={1} borderColor="rgba(255,255,255,0.2)" />
                          <Circle size={8} backgroundColor={opt.accent} borderWidth={1} borderColor="rgba(255,255,255,0.2)" />
                        </XStack>
                      )}

                      {/* Label with dark backdrop for guaranteed visibility */}
                      <YStack px="$2.5" py="$1" backgroundColor="rgba(0,0,0,0.6)" borderRadius={20} alignSelf="center" zIndex={10}>
                        <Text 
                          color="#FFFFFF" 
                          fontFamily="$ethiopic" 
                          fontSize={11} 
                          fontWeight="800"
                          textAlign="center"
                        >
                          {opt.name.toUpperCase()}
                        </Text>
                      </YStack>

                      {/* Selection Indicator */}
                      {themeMode === opt.id && (
                        <View style={{ position: 'absolute', right: 6, bottom: 6 }}>
                          <Circle size={18} backgroundColor={theme.accent}>
                            <Ionicons name="checkmark" size={12} color="white" />
                          </Circle>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </YStack>
          )}

          {/* Language Section Dropdown */}
          <SettingRow 
            icon="language-outline" 
            label={t('language')}
            sublabel={languages.find(l => l.id === language)?.label}
            onPress={() => setShowLanguages(!showLanguages)}
            rightIcon={showLanguages ? "chevron-up" : "chevron-down"}
          />

          {showLanguages && (
            <YStack backgroundColor={theme.surface} padding="$3" borderRadius="$4" borderWidth={1} borderColor={theme.borderColor} marginBottom="$3" space="$2" elevation="$1">
              {languages.map((lang) => (
                <TouchableOpacity 
                  key={lang.id} 
                  onPress={() => {
                    changeLanguage(lang.id);
                    setShowLanguages(false);
                  }}
                >
                  <XStack padding="$3" backgroundColor={language === lang.id ? `${theme.primary}10` : 'transparent'} borderRadius="$3" justifyContent="space-between" alignItems="center">
                    <Text fontFamily="$ethiopic" fontSize="$4" color={theme.text} fontWeight={language === lang.id ? "700" : "400"}>
                      {lang.label}
                    </Text>
                    {language === lang.id && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                  </XStack>
                </TouchableOpacity>
              ))}
            </YStack>
          )}

          <SettingRow icon="notifications-outline" label={t('notifications')} disabled={true} />
          <SettingRow icon="help-circle-outline" label={t('helpSupport')} disabled={true} />

          <YStack alignItems="center" marginTop="$8" opacity={0.3}>
            <Text fontFamily="$body" fontSize="$1" color={theme.textSecondary}>
              {t('madeWithLove')}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

module.exports = SettingsScreen;
