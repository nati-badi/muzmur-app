const React = require('react');
const { YStack, XStack, Text, Circle, ScrollView } = require('tamagui');
const { TouchableOpacity, View } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  return (
    <YStack f={1} backgroundColor={theme.background || '#F5F5F5'} paddingTop={insets.top}>
      {/* Minimal Header */}
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
          <Circle size={40} backgroundColor="transparent">
            <Ionicons name="arrow-back" size={28} color={theme.primary} />
          </Circle>
        </TouchableOpacity>
        <Text fontFamily="$ethiopicSerif" fontSize={28} fontWeight="800" color={theme.primary} letterSpacing={-0.5}>
          {t('profile')}
        </Text>
      </XStack>

      <ScrollView f={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <YStack padding="$6" space="$5">
          
          {/* Compact User Info Card */}
          <View style={{
            backgroundColor: theme.surface,
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.borderColor,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Circle size={70} backgroundColor={theme.accent} elevation="$2">
                <Ionicons name="person" size={40} color="white" />
              </Circle>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ 
                  fontFamily: 'NotoSerifEthiopic_700Bold', 
                  fontSize: 20, 
                  fontWeight: '800', 
                  color: theme.primary,
                  marginBottom: 4
                }}>
                  {t('user')}
                </Text>
                <Text style={{ 
                  fontFamily: 'Inter_400Regular', 
                  fontSize: 13, 
                  color: theme.textSecondary,
                  opacity: 0.7
                }}>
                  user@example.com
                </Text>
              </View>
            </View>
          </View>

          {/* Inline Stats */}
          <XStack space="$3">
            <View style={{
              flex: 1,
              backgroundColor: theme.surface,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}>
              <Text style={{ 
                fontFamily: 'NotoSansEthiopic_400Regular', 
                fontSize: 28, 
                fontWeight: '800', 
                color: theme.error,
                marginBottom: 4
              }}>
                12
              </Text>
              <Text style={{ 
                fontFamily: 'Inter_400Regular', 
                fontSize: 11, 
                color: theme.textSecondary,
                opacity: 0.7,
                textTransform: 'uppercase'
              }}>
                {t('favorites')}
              </Text>
            </View>

            <View style={{
              flex: 1,
              backgroundColor: theme.surface,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}>
              <Text style={{ 
                fontFamily: 'NotoSansEthiopic_400Regular', 
                fontSize: 28, 
                fontWeight: '800', 
                color: theme.accent,
                marginBottom: 4
              }}>
                247
              </Text>
              <Text style={{ 
                fontFamily: 'Inter_400Regular', 
                fontSize: 11, 
                color: theme.textSecondary,
                opacity: 0.7,
                textTransform: 'uppercase'
              }}>
                Hymns
              </Text>
            </View>
          </XStack>

          {/* Action Buttons - List Style */}
          <YStack space="$3" marginTop="$3">
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Favorites')}
              activeOpacity={0.7}
            >
              <View style={{
                backgroundColor: theme.surface,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.borderColor,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Circle size={40} backgroundColor={`${theme.error}15`}>
                  <Ionicons name="heart" size={20} color={theme.error} />
                </Circle>
                <Text style={{ 
                  fontFamily: 'NotoSansEthiopic_400Regular', 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: theme.text,
                  flex: 1,
                  marginLeft: 16
                }}>
                  My {t('favorites')}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} style={{ opacity: 0.3 }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <View style={{
                backgroundColor: theme.surface,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.borderColor,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Circle size={40} backgroundColor={`${theme.primary}15`}>
                  <Ionicons name="settings" size={20} color={theme.primary} />
                </Circle>
                <Text style={{ 
                  fontFamily: 'NotoSansEthiopic_400Regular', 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: theme.text,
                  flex: 1,
                  marginLeft: 16
                }}>
                  {t('settings')}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} style={{ opacity: 0.3 }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
            >
              <View style={{
                backgroundColor: theme.surface,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.borderColor,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Circle size={40} backgroundColor={`${theme.accent}15`}>
                  <Ionicons name="help-circle" size={20} color={theme.accent} />
                </Circle>
                <Text style={{ 
                  fontFamily: 'NotoSansEthiopic_400Regular', 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: theme.text,
                  flex: 1,
                  marginLeft: 16
                }}>
                  {t('helpSupport')}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} style={{ opacity: 0.3 }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
            >
              <View style={{
                backgroundColor: 'transparent',
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.error,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="log-out" size={20} color={theme.error} style={{ marginRight: 12 }} />
                <Text style={{ 
                  fontFamily: 'NotoSansEthiopic_400Regular', 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: theme.error
                }}>
                  {t('logout')}
                </Text>
              </View>
            </TouchableOpacity>

          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

module.exports = ProfileScreen;
