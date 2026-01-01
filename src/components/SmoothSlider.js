const React = require('react');
const { useState, useEffect, memo } = React;
const { XStack, YStack, Text } = require('tamagui');
const Slider = require('@react-native-community/slider').default || require('@react-native-community/slider');
const { useAudio } = require('../context/GlobalAudioState.js');

/**
 * A highly optimized slider that decouples its state from the main screen
 * to prevent heavy re-renders and jitter.
 */
const SmoothSlider = memo(({ position, duration, onSeek, theme, isCurrentPlaying }) => {
  const [localValue, setLocalValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  // Sync with global position only when NOT sliding
  useEffect(() => {
    if (!isSliding) {
      setLocalValue(position);
    }
  }, [position, isSliding]);

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return '0:00';
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <YStack space="$1" width="100%">
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={duration || 100}
        value={localValue}
        minimumTrackTintColor={theme.accent || theme.playerAccent || theme.primary}
        maximumTrackTintColor="rgba(255,255,255,0.35)"
        thumbTintColor="white"
        onSlidingStart={() => setIsSliding(true)}
        onValueChange={(val) => setLocalValue(val)}
        onSlidingComplete={async (val) => {
          await onSeek(val);
          setIsSliding(false);
        }}
      />
      <XStack justifyContent="space-between" paddingHorizontal="$2">
        <Text color={theme.textSecondary || theme.playerAccent || "white"} fontFamily="$body" fontSize="$1" fontWeight="600" opacity={0.9}>
          {formatTime(isSliding ? localValue : position)}
        </Text>
        <Text color={theme.textSecondary || theme.playerAccent || "white"} fontFamily="$body" fontSize="$1" fontWeight="600" opacity={0.9}>
          {formatTime(duration)}
        </Text>
      </XStack>
    </YStack>
  );
});

module.exports = SmoothSlider;
