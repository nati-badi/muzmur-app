const React = require('react');
const { useState } = React;
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
  const { theme, setTheme } = useAppTheme();
  const { language, changeLanguage, t } = useLanguage();
  const { isAuthenticated, logOut } = useAuth();
  const [showThemes, setShowThemes] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigation.replace('Auth');
  };

  const themeOptions = Object.values(THEMES);

  const SettingRow = ({ icon, label, sublabel, onPress, rightIcon = "chevron-forward", disabled = false }) => (
    <TouchableOpacity 
      onPress={disabled ? null : onPress} 
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={{
        backgroundColor: theme.surface || '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: theme.borderColor || 'rgba(0,0,0,0.15)',
        marginBottom: 12,
        opacity: disabled ? 0.4 : 1,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={icon} size={24} color={theme.primary} style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text 
              fontFamily="$ethiopic" 
              fontSize="$5" 
              color={theme.color} 
              fontWeight="600"
              marginBottom={sublabel ? 4 : 0}
            >
              {label}
            </Text>
            {sublabel && (
              <Text 
                fontFamily="$body" 
                fontSize="$2" 
                color={theme.colorSecondary}
                opacity={0.8}
              >
                {sublabel}
              </Text>
            )}
          </View>
          <Ionicons name={rightIcon} size={20} color={theme.primary} style={{ opacity: 0.5 }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <YStack f={1} backgroundColor={theme.background || '#F5F5F5'} paddingTop={insets.top}>
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
          {t('settings')}
        </Text>
      </XStack>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <YStack padding="$6" space="$4">
          <SettingRow 
            icon="color-palette-outline" 
            label={t('appearance')}
            sublabel={theme.name}
            onPress={() => setShowThemes(!showThemes)}
            rightIcon={showThemes ? "chevron-up" : "chevron-down"}
          />

          {showThemes && (
            <YStack 
              backgroundColor="rgba(0,0,0,0.03)" 
              padding="$4" 
              borderRadius="$4" 
              borderWidth={1} 
              borderColor={theme.borderColor || 'rgba(0,0,0,0.1)'}
              marginBottom="$3"
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {themeOptions.map((opt) => (
                  <TouchableOpacity 
                    key={opt.id}
                    onPress={() => setTheme(opt.id)}
                    activeOpacity={0.8}
                    style={{ width: '48%', marginBottom: 8 }}
                  >
                    <View style={{
                      backgroundColor: opt.primary,
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: theme.id === opt.id ? 2 : 0,
                      borderColor: opt.accent,
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text 
                          color="white" 
                          fontFamily="$ethiopic"
                          fontSize="$2" 
                          fontWeight="700" 
                        >
                          {opt.name}
                        </Text>
                        {theme.id === opt.id && (
                          <Circle size={18} backgroundColor={opt.accent}>
                            <Ionicons name="checkmark" size={12} color={opt.primary} />
                          </Circle>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </YStack>
          )}

          <SettingRow 
            icon="language-outline" 
            label={t('language')}
            sublabel={language === 'am' ? t('amharic') : t('english')}
            onPress={() => changeLanguage(language === 'am' ? 'en' : 'am')}
          />

          <SettingRow 
            icon="notifications-outline" 
            label={t('notifications')}
            onPress={() => {}}
            disabled={true}
          />

          <SettingRow 
            icon="help-circle-outline" 
            label={t('helpSupport')}
            onPress={() => {}}
            disabled={true}
          />

          {isAuthenticated && (
            <SettingRow 
              icon="log-out-outline" 
              label={t('logout')}
              onPress={handleLogout}
            />
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
};

module.exports = SettingsScreen;
