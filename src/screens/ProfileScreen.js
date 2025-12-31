const React = require('react');
const { useState } = React;
const { YStack, XStack, Text, Circle, ScrollView } = require('tamagui');
const { TouchableOpacity, View, Image, ActivityIndicator, Alert } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const ImagePicker = require('expo-image-picker');
const UserProfileService = require('../services/UserProfileService');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { useAuth } = require('../context/AuthContext');
const mezmursData = require('../data/mezmurs.json');

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { favoritesCount } = useFavorites();
  const { user, profileData, isAuthenticated, isAnonymous, logOut, updateProfilePicture } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleSignOut = async () => {
    await logOut();
    navigation.replace('Auth');
  };

  const pickImage = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to upload a profile picture.');
      return;
    }

    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Pick image
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        handleUpload(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async (base64) => {
    setUploading(true);
    try {
      // 1. Save to Firestore as Base64
      const result = await UserProfileService.saveProfilePictureBase64(user.uid, base64);
      
      if (result.success) {
        // 2. Update Auth Profile
        await updateProfilePicture(result.downloadURL);
      } else {
        Alert.alert('Upload Failed', result.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

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
          <XStack alignItems="center" space="$1">
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </XStack>
        </TouchableOpacity>
        <Text fontFamily="$ethiopicSerif" fontSize="$7" fontWeight="800" color={theme.primary}>
          {t('profile')}
        </Text>
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card */}
        <YStack padding="$5" alignItems="center">
          <YStack position="relative">
            <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.8}>
              <Circle 
                size={120} 
                backgroundColor={theme.surface} 
                elevation="$4"
                borderWidth={4}
                borderColor={theme.background}
                overflow="hidden"
                justifyContent="center"
                alignItems="center"
              >
                {uploading ? (
                  <ActivityIndicator size="large" color={theme.primary} />
                ) : (profileData?.photoURL || user?.photoURL) ? (
                  <Image source={{ uri: profileData?.photoURL || user?.photoURL }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Ionicons name="person" size={60} color={theme.borderColor} />
                )}
              </Circle>
              
              {/* Edit Icon Overlay */}
              {isAuthenticated && (
                <Circle 
                  size={36} 
                  backgroundColor={theme.primary} 
                  position="absolute" 
                  bottom={4} 
                  right={4}
                  elevation="$2"
                  borderWidth={3}
                  borderColor={theme.background}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons name="camera" size={18} color="white" />
                </Circle>
              )}
            </TouchableOpacity>
          </YStack>

          <YStack alignItems="center" marginTop="$4" space="$1">
            <Text fontFamily="$ethiopic" fontSize="$6" fontWeight="700" color={theme.text}>
              {isAuthenticated ? (user.displayName || 'User') : isAnonymous ? 'Guest User' : t('user')}
            </Text>
            {isAuthenticated && (
              <Text fontFamily="$body" fontSize="$2" color={theme.textSecondary} opacity={0.7}>
                {user.email}
              </Text>
            )}
          </YStack>
        </YStack>

        {/* Stats Row */}
        <XStack paddingHorizontal="$5" justifyContent="space-around" marginBottom="$6">
          <YStack alignItems="center">
            <Text fontFamily="$body" fontSize="$8" fontWeight="800" color={theme.primary}>
              {favoritesCount}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color={theme.textSecondary} textTransform="uppercase" letterSpacing={1}>
              {t('favorites')}
            </Text>
          </YStack>
          <YStack width={1} backgroundColor={theme.borderColor} height="60%" alignSelf="center" opacity={0.3} />
          <YStack alignItems="center" opacity={0.35}>
            <Text fontFamily="$body" fontSize="$8" fontWeight="800" color={theme.primary}>
              -
            </Text>
            <Text fontFamily="$body" fontSize="$1" color={theme.textSecondary} textTransform="uppercase" letterSpacing={1}>
              {t('playlists')}
            </Text>
          </YStack>
          <YStack width={1} backgroundColor={theme.borderColor} height="60%" alignSelf="center" opacity={0.3} />
          <YStack alignItems="center" opacity={0.35}>
            <Text fontFamily="$body" fontSize="$8" fontWeight="800" color={theme.primary}>
              -
            </Text>
            <Text fontFamily="$body" fontSize="$1" color={theme.textSecondary} textTransform="uppercase" letterSpacing={1}>
              {t('recent')}
            </Text>
          </YStack>
        </XStack>

        {/* Action List */}
        <YStack paddingHorizontal="$5" space="$3">
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Favorites')}
          >
            <View style={{
              backgroundColor: theme.surface,
              padding: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}>
              <Circle size={40} backgroundColor={`${theme.primary}15`} marginRight={16}>
                <Ionicons name="heart" size={20} color={theme.primary} />
              </Circle>
              <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="600" color={theme.text} f={1}>
                {t('favorites')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} opacity={0.3} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={{
              backgroundColor: theme.surface,
              padding: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}>
              <Circle size={40} backgroundColor={`${theme.primary}15`} marginRight={16}>
                <Ionicons name="settings" size={20} color={theme.primary} />
              </Circle>
              <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="600" color={theme.text} f={1}>
                {t('settings')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} opacity={0.3} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={1}
            disabled={true}
            style={{ opacity: 0.35 }}
          >
            <View style={{
              backgroundColor: theme.surface,
              padding: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}>
              <Circle size={40} backgroundColor={`${theme.primary}15`} marginRight={16}>
                <Ionicons name="help-circle" size={20} color={theme.primary} />
              </Circle>
              <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="600" color={theme.text} f={1}>
                {t('helpSupport')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} opacity={0.3} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={isAuthenticated ? handleSignOut : () => navigation.replace('Auth')}
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
              <Ionicons name={isAuthenticated ? "log-out" : "log-in"} size={20} color={theme.error} style={{ marginRight: 12 }} />
              <Text 
                fontFamily="$ethiopic" 
                fontSize="$4" 
                fontWeight="600" 
                color={theme.error}
              >
                {isAuthenticated ? t('logout') : 'Sign In'}
              </Text>
            </View>
          </TouchableOpacity>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

module.exports = ProfileScreen;
