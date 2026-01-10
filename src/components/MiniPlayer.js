const React = require('react');
const { memo } = React;
const { YStack, XStack, Text, Button, Circle, Theme } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { useAudio, useAudioProgress } = require('../context/GlobalAudioState.js');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { TouchableOpacity, ActivityIndicator } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');

const MiniPlayer = ({ onPlayerPress }) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { 
    currentMezmur, isPlaying, isLoading, 
    togglePlayback 
  } = useAudio();
  const { position, duration } = useAudioProgress();

  if (!currentMezmur) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <YStack
      position="absolute"
      bottom={insets.bottom + 85} // Positioned above the CustomBottomPill
      left={15}
      right={15}
      backgroundColor={theme.playerBackground}
      borderRadius={16}
      elevation={8}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.3}
      shadowRadius={8}
      overflow="hidden"
      zIndex={2000}
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
  );
};

module.exports = memo(MiniPlayer);
