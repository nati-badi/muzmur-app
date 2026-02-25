const React = require('react');
const { memo } = React;
const { YStack, XStack, Text, Button, Circle, Theme } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { useAudio, useAudioProgress } = require('../context/GlobalAudioState.js');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { TouchableOpacity, ActivityIndicator, Animated, PanResponder, Dimensions } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MiniProgressBar = memo(({ theme }) => {
  const { position, duration } = useAudioProgress();
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <YStack height={3} backgroundColor="rgba(255,255,255,0.1)">
      <YStack
        height="100%"
        width={`${progress}%`}
        backgroundColor={theme.playerAccent}
      />
    </YStack>
  );
});

const MiniPlayer = ({ onPlayerPress, isVisible = true, hasTabs = false }) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const {
    currentMezmur, isPlaying, isLoading,
    togglePlayback, stopPlayback
  } = useAudio();

  const translateX = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(isVisible ? (hasTabs ? -80 : 0) : 100)).current;
  const opacity = React.useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const scale = React.useRef(new Animated.Value(isVisible ? 1 : 0.98)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only take over if horizontal movement is significant
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // Subtle "lift" effect when grabbed
        Animated.spring(scale, {
          toValue: 0.98,
          useNativeDriver: true,
          tension: 100,
          friction: 10
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
          // Faster fade out
          const newOpacity = 1 - (gestureState.dx / (SCREEN_WIDTH * 0.7));
          opacity.setValue(Math.max(0, newOpacity));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;

        // Dismiss if swiped far enough OR if swiped quickly (flick)
        if (dx > SCREEN_WIDTH * 0.4 || vx > 0.5) {
          // Dismiss with a nice spring-loaded throw
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: SCREEN_WIDTH,
              velocity: vx,
              useNativeDriver: true,
              bounciness: 0
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 0.9,
              useNativeDriver: true,
            })
          ]).start(() => {
            stopPlayback();
          });
        } else {
          // Snap back with organic spring
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 8
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 80,
              friction: 8
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 10
            })
          ]).start();
        }
      },
    })
  ).current;

  // Handle visibility and offset transitions natively
  React.useEffect(() => {
    // Determine the base Y-offset depending on whether we have tabs or not
    // We keep bottom: 15 constant and use translateY to "lift" it above tabs
    const targetY = isVisible ? (hasTabs ? -80 : 0) : 100;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: targetY,
        useNativeDriver: true,
        tension: 60,
        friction: 10
      }),
      Animated.timing(opacity, {
        toValue: isVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: isVisible ? 1 : 0.98,
        useNativeDriver: true,
        tension: 60,
        friction: 10
      })
    ]).start();
  }, [isVisible, hasTabs]);

  // Reset animation values when the song changes
  React.useEffect(() => {
    if (currentMezmur?.id && isVisible) {
      translateX.setValue(0);
      // translateY is handled by the visibility effect
      opacity.setValue(1);
      scale.setValue(1);
    }
  }, [currentMezmur?.id]);

  if (!currentMezmur) return null;

  return (
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        bottom: insets.bottom + 15, // Fixed base position
        left: 15,
        right: 15,
        zIndex: 2000,
        transform: [
          { translateX },
          { translateY },
          { scale }
        ],
        opacity,
      }}
      {...panResponder.panHandlers}
    >
      <YStack
        backgroundColor={theme.playerBackground}
        borderRadius={16}
        elevation={8}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.3}
        shadowRadius={8}
        overflow="hidden"
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPlayerPress(currentMezmur)}
          style={{ padding: 10 }}
        >
          <XStack alignItems="center" space="$3">
            {/* Album Art Icon */}
            <Circle
              size={40}
              backgroundColor={theme.playerAccent}
              elevation="$2"
            >
              <Ionicons name="musical-note" size={20} color={theme.playerBackground} />
            </Circle>

            {/* Title & Section */}
            <YStack flex={1} space="$0.5">
              <Text
                color={theme.playerText}
                fontFamily="$ethiopicSerif"
                fontSize={14}
                fontWeight="800"
                numberOfLines={1}
              >
                {currentMezmur.title}
              </Text>
              <Text
                color={theme.playerAccent}
                fontFamily="$ethiopic"
                fontSize={11}
                fontWeight="700"
                numberOfLines={1}
              >
                {t(currentMezmur.section)}
              </Text>
            </YStack>

            {/* Control Button */}
            <Button
              circular
              size="$4"
              backgroundColor="transparent"
              onPress={(e) => {
                e.stopPropagation();
                togglePlayback();
              }}
              icon={isLoading ? <ActivityIndicator color="white" size="small" /> : <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />}
              pressStyle={{ scale: 0.9 }}
            />
          </XStack>
        </TouchableOpacity>

        {/* Mini Progress Bar */}
        <MiniProgressBar theme={theme} />
      </YStack>
    </Animated.View>
  );
};

module.exports = memo(MiniPlayer);
