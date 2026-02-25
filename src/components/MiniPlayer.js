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

const MiniPlayer = ({ onPlayerPress, bottomOffset = 0 }) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const {
    currentMezmur, isPlaying, isLoading,
    togglePlayback, stopPlayback
  } = useAudio();
  const { position, duration } = useAudioProgress();

  const translateX = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
          // Optional: fade out as we swipe
          const newOpacity = 1 - (gestureState.dx / (SCREEN_WIDTH * 0.8));
          opacity.setValue(Math.max(0, newOpacity));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SCREEN_WIDTH * 0.4) {
          // Dismiss
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start(() => {
            stopPlayback();
            translateX.setValue(0);
            opacity.setValue(1);
          });
        } else {
          // Snap back
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              friction: 5
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true
            })
          ]).start();
        }
      },
    })
  ).current;

  if (!currentMezmur) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: bottomOffset > 0 ? bottomOffset : insets.bottom + 15,
        left: 15,
        right: 15,
        zIndex: 2000,
        transform: [{ translateX }],
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
        <YStack height={3} backgroundColor="rgba(255,255,255,0.1)">
          <YStack
            height="100%"
            width={`${progress}%`}
            backgroundColor={theme.playerAccent}
          />
        </YStack>
      </YStack>
    </Animated.View>
  );
};

module.exports = memo(MiniPlayer);
