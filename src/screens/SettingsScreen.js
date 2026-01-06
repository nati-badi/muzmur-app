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
                      height: 70,
                      borderRadius: 12,
                      borderWidth: themeMode === opt.id ? 3 : 1.5,
                      borderColor: themeMode === opt.id ? theme.accent : theme.borderColor,
                      overflow: 'hidden',
                      elevation: 3,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}>
                      {/* Color Display - Split view showing primary and accent */}
                      {opt.isSystem ? (
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1, backgroundColor: '#F9F9F7' }} />
                          <View style={{ flex: 1, backgroundColor: '#222831' }} />
                        </View>
                      ) : (
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 0.6, backgroundColor: opt.primary }} />
                          <View style={{ flex: 0.4, backgroundColor: opt.accent }} />
                        </View>
                      )}

                      {/* Label overlay at bottom */}
                      <View style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        backgroundColor: 'rgba(0,0,0,0.75)', 
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Text 
                          color="#FFFFFF" 
                          fontFamily="$ethiopic" 
                          fontSize={12} 
                          fontWeight="800"
                        >
                          {opt.name}
                        </Text>
                        {themeMode === opt.id && (
                          <Circle size={16} backgroundColor="#FFFFFF">
                            <Ionicons name="checkmark" size={10} color="#000000" />
                          </Circle>
                        )}
                      </View>
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
