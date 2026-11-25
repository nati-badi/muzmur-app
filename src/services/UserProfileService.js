const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

const profileKey = (userId) => `local_profile_${userId}`;

class UserProfileService {
  static async saveProfilePictureBase64(userId, base64Data) {
    try {
      const photoURL = `data:image/jpeg;base64,${base64Data}`;
      await this.saveProfile(userId, { photoURL });
      return { success: true, downloadURL: photoURL };
    } catch (error) {
      console.error('Error saving profile picture:', error);
      return { success: false, error: error.message };
    }
  }

  static async getProfile(userId) {
    try {
      const raw = await AsyncStorage.getItem(profileKey(userId));
      if (raw) {
        return { success: true, data: JSON.parse(raw) };
      }
      return { success: true, data: {} };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async saveProfile(userId, profileData) {
    try {
      const key = profileKey(userId);
      const existing = await AsyncStorage.getItem(key);
      const merged = existing ? { ...JSON.parse(existing), ...profileData } : { ...profileData };
      await AsyncStorage.setItem(key, JSON.stringify(merged));
      return { success: true };
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async syncFavorites() {
    return { success: true };
  }

  static async syncTheme() {
    return { success: true };
  }

  static async syncLanguage() {
    return { success: true };
  }

  static async syncPlaylists() {
    return { success: true };
  }

  static async queueSync() {
    return { success: true };
  }

  static async processQueue() {
    return { success: true, processed: 0 };
  }
}

module.exports = UserProfileService;