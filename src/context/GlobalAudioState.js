const React = require('react');
const { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const audioService = require('../services/audioService');
const DataService = require('../services/DataService');

const AudioContext = createContext();
const AudioProgressContext = createContext();

const RECENTLY_PLAYED_KEY = 'recently_played_hymns';

const AudioProvider = ({ children }) => {
  const [currentMezmur, setCurrentMezmur] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  const [error, setError] = useState(null);

  // Use a Ref for the status handler to provide a perfectly stable reference to the engine
  const statusHandlerRef = useRef(null);

  // Keep loop state updated in a ref for the handler to access without being recreated
  const loopRef = useRef(isLooping);

  useEffect(() => {
    loopRef.current = isLooping;
  }, [isLooping]);

  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);

  useEffect(() => {
    queueRef.current = queue;
    queueIndexRef.current = queueIndex;
  }, [queue, queueIndex]);

  useEffect(() => {
    audioService.init();
    loadRecentlyPlayed();

    // Define the actual logic once
    statusHandlerRef.current = async (status) => {
      if (status.isLoaded) {
        // Always set position and duration
        setDuration(status.durationMillis || 0);
        setPosition(status.positionMillis);
        setIsPlaying(status.isPlaying);
        setError(null); // Clear error on successful status update

        if (status.didJustFinish) {
          if (loopRef.current) {
            // Already handled by audioService if set
          } else if (queueRef.current.length > 0 && queueIndexRef.current < queueRef.current.length - 1) {
            playNext();
          } else {
            setIsPlaying(false);
            await audioService.pause();
            await audioService.seek(0);
          }
        }
      } else if (status.error) {
        console.error('Player status error:', status.error);
        // Don't set global error here to avoid flickering, let the play action handle main errors
      }
    };

    return () => {
      audioService.stop();
    };
  }, []);

  const loadRecentlyPlayed = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENTLY_PLAYED_KEY);
      if (stored) {
        setRecentlyPlayed(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recently played', e);
    }
  };

  const addToRecentlyPlayed = async (mezmur) => {
    try {
      const newList = [
        mezmur,
        ...recentlyPlayed.filter(m => m.id !== mezmur.id)
      ].slice(0, 10);

      setRecentlyPlayed(newList);
      await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save recently played', e);
    }
  };

  // This is the stable callback passed to audio engine
  const onStatusUpdate = useCallback((status) => {
    if (statusHandlerRef.current) {
      statusHandlerRef.current(status);
    }
  }, []);

  const seek = useCallback(async (millis) => {
    await audioService.seek(millis);
  }, []);

  const skip = useCallback(async (seconds) => {
    const newPosition = position + seconds * 1000;
    const clampedPosition = Math.max(0, Math.min(newPosition, duration));
    await audioService.seek(clampedPosition);
  }, [position, duration]);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      await audioService.pause();
    } else {
      setIsPlaying(true);
      await audioService.resume();
    }
  }, [isPlaying]);

  const toggleLoop = useCallback(async () => {
    const newState = !isLooping;
    setIsLooping(newState);
    await audioService.setIsLooping(newState);
  }, [isLooping]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const playMezmur = useCallback(async (mezmur) => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const urls = [
        `https://cdn.jsdelivr.net/gh/nati-badi/muzmur-assets@main/${mezmur.id}.m4a`,
        `https://cdn.jsdelivr.net/gh/nati-badi/muzmur-assets@main/${mezmur.id}.mp3`
      ];

      await audioService.playHymn(mezmur, urls, onStatusUpdate);

      if (isLooping) {
        await audioService.setIsLooping(true);
      }

      setCurrentMezmur(mezmur);
      addToRecentlyPlayed(mezmur);
      setIsLoading(false);
    } catch (error) {
      console.error("Error playing audio", error);
      setIsLoading(false);

      // User-friendly error mapping
      let message = 'Unable to play audio.';
      if (error.message && error.message.includes('404')) {
        message = 'Audio file not found on server.';
      } else if (error.message && error.message.includes('Network')) {
        message = 'Network error. Please check your connection.';
      }
      setError(message);
    }
  }, [isLooping, onStatusUpdate]);

  const playPlaylist = useCallback(async (playlist, startIndex = 0) => {
    if (!playlist.items || playlist.items.length === 0) return;

    // Convert IDs to Mezmur objects
    const hymns = playlist.items
      .map(id => DataService.getAll().find(m => String(m.id) === String(id)))
      .filter(Boolean);

    if (hymns.length === 0) return;

    setQueue(hymns);
    setQueueIndex(startIndex);
    await playMezmur(hymns[startIndex]);
  }, [playMezmur]);

  const playNext = useCallback(async () => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      await playMezmur(queue[nextIndex]);
    }
  }, [queue, queueIndex, playMezmur]);

  const playPrevious = useCallback(async () => {
    if (queue.length > 0 && queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      await playMezmur(queue[prevIndex]);
    } else {
      await seek(0);
    }
  }, [queue, queueIndex, playMezmur, seek]);

  const stopPlayback = useCallback(async () => {
    setIsPlaying(false);
    await audioService.stop({ resetHymn: true });
    setCurrentMezmur(null);
  }, []);

  // Context 1: Control & Metadata (STABLE)
  const controlValue = useMemo(() => ({
    currentMezmur,
    isPlaying,
    isLoading,
    error,
    isLooping,
    isShuffle,
    recentlyPlayed,
    queue,
    queueIndex,
    playMezmur,
    playPlaylist,
    playNext,
    playPrevious,
    togglePlayback,
    toggleLoop,
    toggleShuffle,
    stopPlayback,
    handleSkip: skip, // Renamed to avoid confusion
    handleSeek: seek,  // Renamed to avoid confusion
    clearError: () => setError(null)
  }), [
    currentMezmur, isPlaying, isLoading, error, isLooping, isShuffle, recentlyPlayed,
    queue, queueIndex, playMezmur, playPlaylist, playNext, playPrevious,
    togglePlayback, toggleLoop, toggleShuffle, stopPlayback, skip, seek
  ]);

  // Context 2: Progress (HIGH-FREQUENCY)
  const progressValue = useMemo(() => ({
    position,
    duration,
    isSeeking,
    setIsSeeking
  }), [position, duration, isSeeking]);

  return (
    <AudioContext.Provider value={controlValue}>
      <AudioProgressContext.Provider value={progressValue}>
        {children}
      </AudioProgressContext.Provider>
    </AudioContext.Provider>
  );
};

const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

const useAudioProgress = () => {
  const context = useContext(AudioProgressContext);
  if (!context) {
    throw new Error('useAudioProgress must be used within an AudioProvider');
  }
  return context;
};

module.exports = {
  AudioProvider,
  useAudio,
  useAudioProgress
};
