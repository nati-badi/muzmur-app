const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = require('firebase/firestore');
const { db } = require('../config/firebase.config');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

class UserProfileService {
  /**
   * Save profile picture as Base64 string in Firestore
   */
  static async saveProfilePictureBase64(userId, base64Data) {
    try {
      const photoURL = `data:image/jpeg;base64,${base64Data}`;

      // Update Firestore profile with the Base64 image URL
      await this.saveProfile(userId, { photoURL });

      return { success: true, downloadURL: photoURL };
    } catch (error) {
      console.error('Error saving profile picture:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getProfile(userId) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: 'Profile not found' };
      }
    } catch (error) {
      console.error('Error getting profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create or update user profile
   */
  static async saveProfile(userId, profileData) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        ...profileData,
        lastSync: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync favorites to cloud (batched for efficiency)
   */
  static async syncFavorites(userId, favorites) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        favorites,
        lastSync: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        return await this.saveProfile(userId, { favorites });
      }
      console.error('Error syncing favorites:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync theme preference to cloud
   */
  static async syncTheme(userId, themeId) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        theme: themeId,
        lastSync: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error syncing theme:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync language preference to cloud
   */
  static async syncLanguage(userId, language) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        language,
        lastSync: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error syncing language:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync playlists to cloud
   */
  static async syncPlaylists(userId, playlists) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        playlists,
        lastSync: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        return await this.saveProfile(userId, { playlists });
      }
      console.error('Error syncing playlists:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Queue for offline sync - stores pending operations
   */
  static async queueSync(operation) {
    try {
      const queue = await AsyncStorage.getItem('syncQueue');
      const syncQueue = queue ? JSON.parse(queue) : [];
      syncQueue.push({
        ...operation,
        timestamp: Date.now()
      });
      await AsyncStorage.setItem('syncQueue', JSON.stringify(syncQueue));
      return { success: true };
    } catch (error) {
      console.error('Error queuing sync:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process queued sync operations when online
   */
  static async processQueue(userId) {
    try {
      const queue = await AsyncStorage.getItem('syncQueue');
      if (!queue) return { success: true, processed: 0 };

      const syncQueue = JSON.parse(queue);
      let processed = 0;

      for (const operation of syncQueue) {
        console.log(`Processing queued operation: ${operation.type}`);
        switch (operation.type) {
          case 'favorites':
            await this.syncFavorites(userId, operation.data);
            break;
          case 'theme':
            await this.syncTheme(userId, operation.data);
            break;
          case 'language':
            await this.syncLanguage(userId, operation.data);
            break;
          case 'playlists':
            await this.syncPlaylists(userId, operation.data);
            break;
        }
        processed++;
      }
      console.log(`Successfully processed ${processed} operations.`);

      // Clear queue after successful sync
      await AsyncStorage.removeItem('syncQueue');
      return { success: true, processed };
    } catch (error) {
      console.error('Error processing queue:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = UserProfileService;
