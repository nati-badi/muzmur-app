const { Audio } = require('expo-av');
const FileSystem = require('expo-file-system');

class AudioService {
  constructor() {
    this.sound = null;
    this.status = null;
    this.onStatusUpdate = null;
    this.currentHymnId = null;
  }

  /**
   * Initialize audio mode for the app
   */
  async init() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to init audio mode:', error);
    }
  }

  /**
   * Set looping mode
   */
  async setIsLooping(enabled) {
    if (this.sound) {
      await this.sound.setIsLoopingAsync(enabled);
    }
  }

  /**
   * Play or Resume a hymn with automatic caching and multi-format fallback
   * @param {Object} hymn - The hymn object from mezmurs.json
   * @param {Array|String} urls - Single URL or Array of candidate URLs
   */
  async playHymn(hymn, urls, onStatusUpdate) {
    try {
      this.onStatusUpdate = onStatusUpdate;
      const urlList = Array.isArray(urls) ? urls : [urls];

      // 1. Check if same hymn is already playing/paused
      if (this.currentHymnId === hymn.id && this.sound) {
        const playbackStatus = await this.sound.getStatusAsync();
        if (playbackStatus.isLoaded && !playbackStatus.isPlaying) {
          await this.sound.playAsync();
          return;
        }
      }

      // 2. Stop current sound
      await this.stop();
      this.currentHymnId = hymn.id;

      // 3. Logic: Check Cache first (any format)
      const localResult = await this.getLocalUri(hymn.id);
      if (localResult) {
        // console.log(`[AudioService] Playing from cache: ${localResult.uri}`);
        const { sound } = await Audio.Sound.createAsync(
          { uri: localResult.uri },
          { 
            shouldPlay: true,
            progressUpdateIntervalMillis: 100 // Update UI twice a second for smooth slider
          },
          this._handleStatusUpdate.bind(this)
        );
        this.sound = sound;
        return;
      }

      // 4. Try streaming candidate URLs until one works
      let lastError = null;
      for (const url of urlList) {
        try {
          // console.log(`[AudioService] Attempting to stream: ${url}`);
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { 
              shouldPlay: true,
              progressUpdateIntervalMillis: 100
            },
            this._handleStatusUpdate.bind(this)
          );
          
          this.sound = sound;
          
          // 5. Background Cache: Download the successful format
          const ext = url.split('.').pop() || 'm4a';
          this._cacheFile(hymn.id, url, ext);
          
          return; // Success!
        } catch (e) {
          lastError = e;
          // console.warn(`[AudioService] Failed to load ${url}:`, e.message);
        }
      }

      if (lastError) throw lastError;
    } catch (error) {
      console.error('Error playing hymn:', error);
      throw error;
    }
  }

  /**
   * Background Cache Helper
   */
  async _cacheFile(hymnId, remoteUrl, extension) {
    try {
      const dir = `${FileSystem.documentDirectory}mezmurs/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const fileUri = `${dir}${hymnId}.${extension}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        await FileSystem.downloadAsync(remoteUrl, fileUri);
      }
    } catch (error) {
      // Quietly fail background caching
    }
  }

  _handleStatusUpdate(status) {
    this.status = status;
    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async resume() {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async stop() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (e) {}
      this.sound = null;
      this.currentHymnId = null;
    }
  }

  async seek(millis) {
    if (this.sound) {
      await this.sound.setPositionAsync(millis);
    }
  }

  /**
   * Check if file exists in local storage for any supported format
   * Returns { uri, ext }
   */
  async getLocalUri(hymnId) {
    const extensions = ['m4a', 'mp3'];
    for (const ext of extensions) {
      try {
        const uri = `${FileSystem.documentDirectory}mezmurs/${hymnId}.${ext}`;
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) return { uri, ext };
      } catch (e) {}
    }
    return null;
  }
}

const audioService = new AudioService();
module.exports = audioService;
