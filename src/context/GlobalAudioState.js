const React = require('react');
const { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const audioService = require('../services/audioService');

const AudioContext = createContext();

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

  // Use a Ref for the status handler to provide a perfectly stable reference to the engine
  const statusHandlerRef = useRef(null);
  
  // Keep loop state updated in a ref for the handler to access without being recreated
  const loopRef = useRef(isLooping);

  useEffect(() => {
    loopRef.current = isLooping;
  }, [isLooping]);

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
        
        if (status.didJustFinish) {
          if (!loopRef.current) {
            setIsPlaying(false);
            await audioService.pause();
            await audioService.seek(0);
          }
        }
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

  const playMezmur = useCallback(async (mezmur) => {
    try {
      setIsLoading(true);
      
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
    }
  }, [isLooping, onStatusUpdate]);

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

  const skip = useCallback(async (seconds) => {
    const newPosition = position + seconds * 1000;
    const clampedPosition = Math.max(0, Math.min(newPosition, duration));
    await audioService.seek(clampedPosition);
  }, [position, duration]);

  const seek = useCallback(async (millis) => {
    await audioService.seek(millis);
  }, []);

  // Memoize the context value to prevent re-renders of all consumers on every position update
  // unless they specifically use the updated values.
  const contextValue = useMemo(() => ({
    currentMezmur,
    isPlaying,
    isLoading,
    position,
    duration,
    isLooping,
    isShuffle,
    recentlyPlayed,
    playMezmur,
    togglePlayback,
    toggleLoop,
    toggleShuffle,
    skip,
    seek
  }), [
    currentMezmur, isPlaying, isLoading, position, duration, 
    isLooping, isShuffle, recentlyPlayed, playMezmur, togglePlayback, 
    toggleLoop, toggleShuffle, skip, seek
  ]);

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
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

module.exports = {
  AudioProvider,
  useAudio
};
