const { Audio, InterruptionModeIOS, InterruptionModeAndroid } = require('expo-av');
// --- HYBRID MODULE LOADER ---
let ExpoAudio = null;
let USE_MODERN_AUDIO = false;

try {
  // Attempt to require the new native module
  ExpoAudio = require('expo-audio');
  
  // Basic check to see if native properties exist (avoids "prototype of undefined" later)
  if (ExpoAudio && ExpoAudio.AudioPlayer) {
      USE_MODERN_AUDIO = true;
      console.log('[AudioService] Using Modern Native Engine (expo-audio) 🚀');
  }
} catch (_e) {
  console.log('[AudioService] Native module missing. Falling back to Legacy (expo-av) 🛡️');
}

class AudioService {
  constructor() {
    this.sound = null;          // For Legacy (expo-av)
    this.player = null;         // For Modern (expo-audio)
    this.currentHymnId = null;
    this.onStatusUpdate = null;
    this.statusInterval = null;

    // Bind listeners
    if (USE_MODERN_AUDIO) {
        this._boundStatusListener = this._handleNativeStatus.bind(this);
    }
  }

  async init() {
    try {
      // Always init Audio Mode for background support (Legacy & Modern both need permission)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      if (USE_MODERN_AUDIO && ExpoAudio) {
           // Modern init if needed
      }
    } catch (error) {
      console.error('Failed to init audio mode:', error);
    }
  }

  async setIsLooping(enabled) {
    if (USE_MODERN_AUDIO && this.player) {
      this.player.loop = enabled;
    } else if (this.sound) {
      await this.sound.setIsLoopingAsync(enabled);
    }
  }

  // --- UNIVERSAL PLAY METHOD ---
  async playHymn(hymn, urls, onStatusUpdate) {
    if (USE_MODERN_AUDIO) {
        return this._playModern(hymn, urls, onStatusUpdate);
    } else {
        return this._playLegacy(hymn, urls, onStatusUpdate);
    }
  }

  // --- MODERN IMPLEMENTATION (expo-audio) ---
  async _playModern(hymn, urls, onStatusUpdate) {
    try {
      this.onStatusUpdate = onStatusUpdate;
      if (this.statusInterval) clearInterval(this.statusInterval);

      // Stop previous
      await this.stop({ resetHymn: false });

      this.currentHymnId = hymn.id;
      const urlList = Array.isArray(urls) ? urls : [urls];
      if (!urlList.length) {
        throw new Error('LOCAL_AUDIO_MISSING');
      }

      let lastError = null;
      let started = false;
      for (const sourceUri of urlList) {
        try {
          this.player = new ExpoAudio.AudioPlayer(sourceUri);
          started = true;
          break;
        } catch (err) {
          lastError = err;
          this.player = null;
        }
      }
      if (!started) {
        throw lastError || new Error('LOCAL_AUDIO_MISSING');
      }
      
      // Lock Screen Config
      this.player.staysActiveInBackground = true;
      this.player.setAudioMode(ExpoAudio.AudioMode.PLAYBACK);

      // Listeners
      this.player.addListener('statusChange', this._boundStatusListener);

      // Polling
      this.statusInterval = setInterval(() => {
        if (this.player) this._emitModernStatus();
      }, 250);

      this.player.play();

    } catch (error) {
       console.error('[Modern Player Error]', error);
       // Fallback to legacy if modern fails unexpectedly at runtime
       console.log('Falling back to Legacy implementation...');
       USE_MODERN_AUDIO = false;
       return this._playLegacy(hymn, urls, onStatusUpdate);
    }
  }

  _emitModernStatus() {
     if (!this.player || !this.onStatusUpdate) return;
     
     const status = {
       isLoaded: true,
       isPlaying: this.player.playing,
       positionMillis: this.player.currentTime * 1000,
       durationMillis: this.player.duration * 1000,
       didJustFinish: false
     };

     if (this.player.duration > 0 && this.player.currentTime >= this.player.duration - 0.2) {
       if (!this.player.loop) {
          status.didJustFinish = true;
          status.isPlaying = false;
       }
     }
     this.onStatusUpdate(status);
  }

  _handleNativeStatus(status) {
      this._emitModernStatus();
  }


  // --- LEGACY IMPLEMENTATION (expo-av) ---
  async _playLegacy(hymn, urls, onStatusUpdate) {
     try {
      this.onStatusUpdate = onStatusUpdate;
      const urlList = Array.isArray(urls) ? urls : [urls];

      if (this.currentHymnId === hymn.id && this.sound) {
        const playbackStatus = await this.sound.getStatusAsync();
        if (playbackStatus.isLoaded && !playbackStatus.isPlaying) {
          await this.sound.playAsync();
          return;
        }
      }

      await this.stop({ resetHymn: false });
      this.currentHymnId = hymn.id;

      if (!urlList.length) {
        throw new Error('LOCAL_AUDIO_MISSING');
      }

      let lastError = null;

      const tryPlay = async (uri) => {
         const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true, progressUpdateIntervalMillis: 100 },
            (status) => {
                this.status = status;
                if (this.onStatusUpdate) this.onStatusUpdate(status);
            }
         );

         // --- METADATA PUBLISHING (Legacy) ---
         // expo-av does NOT support setMetadataAsync. Removed to fix crash.
         // Lock screen controls will appear with default info if supported by OS/AudioMode.
         
         this.sound = sound;
         return true;
      };

      let played = false;
      for (const url of urlList) {
        try {
          await tryPlay(url);
          played = true;
          break;
        } catch (e) {
          lastError = e;
        }
      }
      if (!played) {
        throw lastError || new Error('LOCAL_AUDIO_MISSING');
      }

    } catch (error) {
      console.error('[Legacy Player Error]', error);
      this.currentHymnId = null;
      throw error;
    }
  }


  // --- SHARED METHODS ---
  async pause() {
    if (this.player) this.player.pause();
    if (this.sound) await this.sound.pauseAsync();
  }

  async resume() {
    if (this.player) this.player.play();
    if (this.sound) {
        const s = await this.sound.getStatusAsync();
        if (s.isLoaded && !s.isPlaying) await this.sound.playAsync();
    }
  }

  async stop({ resetHymn = true } = {}) {
    if (this.statusInterval) clearInterval(this.statusInterval);
    
    // Modern Cleanup
    if (this.player) {
      try { this.player.pause(); this.player = null; } catch (_e) {}
    }
    
    // Metadata Cleanup (Fix: Stop ghost sessions)
    if (this.metadataSound) {
        try { 
            await this.metadataSound.unloadAsync(); 
        } catch (_e) {}
        this.metadataSound = null;
    }

    // Legacy Cleanup
    if (this.sound) {
       try { 
           await this.sound.setOnPlaybackStatusUpdate(null);
           await this.sound.unloadAsync(); 
       } catch (_e) {}
       this.sound = null;
    }

    if (resetHymn) this.currentHymnId = null;
  }

  async seek(millis) {
    if (this.player) this.player.seekTo(millis / 1000);
    if (this.sound) await this.sound.setPositionAsync(millis);
  }

  async getLocalUri(hymnId) {
    const LocalAudioService = require('./LocalAudioService');
    const uris = await LocalAudioService.resolvePlaybackUris({ id: hymnId });
    if (uris.length) {
      const uri = uris[0];
      const ext = uri.split('.').pop();
      return { uri, ext };
    }
    return null;
  }
}

const audioService = new AudioService();
module.exports = audioService;
