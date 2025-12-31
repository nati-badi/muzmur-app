const React = require('react');
const { createContext, useState, useContext, useEffect, useRef } = React;
const { Audio } = require('expo-av');

const AudioContext = createContext();

const AudioProvider = ({ children }) => {
  const [currentMezmur, setCurrentMezmur] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playMezmur = async (mezmur) => {
    try {
      // If same mezmur and already loaded, just play/pause
      if (currentMezmur?.id === mezmur.id && soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Different mezmur or first time
      setIsLoading(true);
      
      // Stop and unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: mezmur.audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = newSound;
      setCurrentMezmur(mezmur);
      setIsPlaying(true);
      setIsLoading(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
            newSound.setPositionAsync(0);
          }
        }
      });
    } catch (error) {
      console.error("Error playing audio", error);
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (soundRef.current) {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const skip = async (seconds) => {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        let newPosition = status.positionMillis + seconds * 1000;
        if (newPosition < 0) newPosition = 0;
        if (newPosition > (status.durationMillis || 0)) newPosition = status.durationMillis || 0;
        await soundRef.current.setPositionAsync(newPosition);
      }
    }
  };

  return (
    <AudioContext.Provider value={{
      currentMezmur,
      isPlaying,
      isLoading,
      position,
      duration,
      playMezmur,
      togglePlayback,
      skip
    }}>
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
