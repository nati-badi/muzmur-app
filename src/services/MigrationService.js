const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const UserProfileService = require('./UserProfileService');

class MigrationService {
  /**
   * Check if migration is needed (first time user logs in)
   */
  static async needsMigration(userId) {
    try {
      const migrated = await AsyncStorage.getItem(`migrated_${userId}`);
      return !migrated;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Migrate local guest favorites to user account
   */
  static async migrateFavorites(userId) {
    try {
      console.log('Migrating favorites for user:', userId);
      
      // Get guest favorites (if any) to migrate
      const guestFavorites = await AsyncStorage.getItem('favorites_guest');
      const guestFavs = guestFavorites ? JSON.parse(guestFavorites) : [];
      
      // Also check old global key for backward compatibility
      const oldFavorites = await AsyncStorage.getItem('favorites');
      const oldFavs = oldFavorites ? JSON.parse(oldFavorites) : [];
      
      // Combine guest and old favorites
      const localFavorites = [...new Set([...guestFavs, ...oldFavs])];

      if (localFavorites.length === 0) {
        console.log('No local favorites to migrate');
        // No local favorites to migrate, just mark as migrated
        await AsyncStorage.setItem(`migrated_${userId}`, 'true');
        return { success: true, migrated: 0 };
      }

      // Check if cloud has favorites already
      const cloudProfile = await UserProfileService.getProfile(userId);
      
      if (cloudProfile.success && cloudProfile.data?.favorites) {
        console.log('Merging local and cloud favorites');
        // Merge local and cloud favorites (remove duplicates)
        const mergedFavorites = [...new Set([...cloudProfile.data.favorites, ...localFavorites])];
        
        // Sync merged favorites to cloud
        await UserProfileService.syncFavorites(userId, mergedFavorites);
        
        // Update user-specific local storage with merged list
        const userKey = `favorites_${userId}`;
        await AsyncStorage.setItem(userKey, JSON.stringify(mergedFavorites));
        
        // CLEAR local guest/old data after successful migration
        await AsyncStorage.removeItem('favorites_guest');
        await AsyncStorage.removeItem('favorites');
        
        await AsyncStorage.setItem(`migrated_${userId}`, 'true');
        console.log('Migration completed and guest data cleared');
        return { success: true, migrated: localFavorites.length, merged: true };
      } else {
        console.log('Uploading local favorites to cloud');
        // No cloud favorites, just upload local ones
        await UserProfileService.syncFavorites(userId, localFavorites);
        
        // Save to user-specific storage
        const userKey = `favorites_${userId}`;
        await AsyncStorage.setItem(userKey, JSON.stringify(localFavorites));
        
        // CLEAR local guest/old data after successful migration
        await AsyncStorage.removeItem('favorites_guest');
        await AsyncStorage.removeItem('favorites');
        
        await AsyncStorage.setItem(`migrated_${userId}`, 'true');
        console.log('Migration completed and guest data cleared');
        return { success: true, migrated: localFavorites.length, merged: false };
      }
    } catch (error) {
      console.error('Error migrating favorites:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate theme preference to cloud
   */
  static async migrateTheme(userId) {
    try {
      const localTheme = await AsyncStorage.getItem('selectedTheme');
      
      if (localTheme) {
        await UserProfileService.syncTheme(userId, localTheme);
        return { success: true };
      }
      
      return { success: true, skipped: true };
    } catch (error) {
      console.error('Error migrating theme:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate language preference to cloud
   */
  static async migrateLanguage(userId) {
    try {
      const localLanguage = await AsyncStorage.getItem('selectedLanguage');
      
      if (localLanguage) {
        await UserProfileService.syncLanguage(userId, localLanguage);
        return { success: true };
      }
      
      return { success: true, skipped: true };
    } catch (error) {
      console.error('Error migrating language:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate local guest playlists to user account
   */
  static async migratePlaylists(userId) {
    try {
      console.log('Migrating playlists for user:', userId);
      
      // Get guest playlists (if any) to migrate
      const guestPlaylists = await AsyncStorage.getItem('user_playlists_guest');
      const guestPls = guestPlaylists ? JSON.parse(guestPlaylists) : [];
      
      if (guestPls.length === 0) {
        return { success: true, migrated: 0 };
      }

      // Check if cloud has playlists already
      const cloudProfile = await UserProfileService.getProfile(userId);
      
      if (cloudProfile.success && cloudProfile.data?.playlists) {
        console.log('Merging local and cloud playlists');
        // Merge - prioritizing cloud for items with same ID, or just appending new ones
        // For simplicity, we'll append local playlists that don't exist in cloud by name
        const cloudPls = cloudProfile.data.playlists;
        const mergedPlaylists = [...cloudPls];
        
        guestPls.forEach(localPl => {
          if (!cloudPls.find(cp => cp.name === localPl.name)) {
            mergedPlaylists.push({ ...localPl, id: Date.now().toString() + Math.random().toString().slice(2, 5) });
          }
        });
        
        await UserProfileService.syncPlaylists(userId, mergedPlaylists);
        await AsyncStorage.setItem(`user_playlists_${userId}`, JSON.stringify(mergedPlaylists));
      } else {
        console.log('Uploading local playlists to cloud');
        await UserProfileService.syncPlaylists(userId, guestPls);
        await AsyncStorage.setItem(`user_playlists_${userId}`, JSON.stringify(guestPls));
      }

      await AsyncStorage.removeItem('user_playlists_guest');
      return { success: true, migrated: guestPls.length };
    } catch (error) {
      console.error('Error migrating playlists:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform full migration for a user
   */
  static async performFullMigration(userId) {
    try {
      const needsMigration = await this.needsMigration(userId);
      
      if (!needsMigration) {
        console.log('User already migrated:', userId);
        return { success: true, alreadyMigrated: true };
      }

      console.log('Starting full migration for:', userId);
      // Migrate all user data
      const favoritesResult = await this.migrateFavorites(userId);
      const themeResult = await this.migrateTheme(userId);
      const languageResult = await this.migrateLanguage(userId);
      const playlistsResult = await this.migratePlaylists(userId);

      return {
        success: true,
        favorites: favoritesResult,
        theme: themeResult,
        language: languageResult,
        playlists: playlistsResult
      };
    } catch (error) {
      console.error('Error performing full migration:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pull cloud data to local storage (on login from new device)
   */
  static async pullCloudData(userId) {
    try {
      console.log('Pulling cloud data for user:', userId);
      const cloudProfile = await UserProfileService.getProfile(userId);
      
      if (!cloudProfile.success) {
        return { success: false, error: cloudProfile.error };
      }

      const data = cloudProfile.data;

      // Update user-specific local storage with cloud data
      if (data.favorites) {
        const userKey = `favorites_${userId}`;
        await AsyncStorage.setItem(userKey, JSON.stringify(data.favorites));
        console.log('Favorites pulled from cloud:', data.favorites.length);
      }
      if (data.theme) {
        await AsyncStorage.setItem('selectedTheme', data.theme);
      }
      if (data.language) {
        await AsyncStorage.setItem('selectedLanguage', data.language);
      }
      if (data.playlists) {
        const userKey = `user_playlists_${userId}`;
        await AsyncStorage.setItem(userKey, JSON.stringify(data.playlists));
        console.log('Playlists pulled from cloud:', data.playlists.length);
      }

      return { success: true, synced: true };
    } catch (error) {
      console.error('Error pulling cloud data:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MigrationService;
