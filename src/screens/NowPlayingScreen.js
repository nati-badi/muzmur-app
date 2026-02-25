const React = require('react');
const { useState, useEffect, useCallback, memo } = React;
const { StyleSheet, ActivityIndicator } = require('react-native');
const { YStack, XStack, Text, Button, Circle } = require('tamagui');
const Slider = require('@react-native-community/slider').default || require('@react-native-community/slider');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { useAudio, useAudioProgress } = require('../context/GlobalAudioState.js');
const { Ionicons } = require('@expo/vector-icons');
const ScreenHeader = require('../components/ScreenHeader');
const SmoothSlider = require('../components/SmoothSlider');

const HymnPlayerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    currentMezmur, isPlaying, isLoading, error, clearError,
    isLooping, isShuffle,
    togglePlayback, toggleLoop, toggleShuffle, handleSkip, handleSeek
  } = useAudio();

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return '0:00';
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentMezmur) {
    return (
      <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
        <ScreenHeader
          title={t('player')}
          onBack={() => navigation.goBack()}
          theme={theme}
        />
        <YStack f={1} justifyContent="center" alignItems="center" padding="$10">
          <Ionicons name="musical-notes-outline" size={100} color={theme.primary} opacity={0.3} />
          <Text fontFamily="$ethiopicSerif" fontSize="$6" fontWeight="800" color={theme.primary} opacity={0.6} textAlign="center" marginTop="$4">
            {t('noHymnSelected')}
          </Text>
          <Text fontFamily="$ethiopic" fontSize="$4" color={theme.textSecondary} textAlign="center" marginTop="$2" opacity={0.8}>
            {t('selectHymnDetail')}
          </Text>
          <Button
            marginTop="$6"
            backgroundColor={theme.primary}
            onPress={() => navigation.navigate('Mezmurs')}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontWeight="BOLD">{t('browseMezmurs')}</Text>
          </Button>
        </YStack>
      </YStack>
    );
  }

  const mezmur = currentMezmur;

  return (
    <YStack f={1} backgroundColor={theme.background || '#F5F5F5'} paddingTop={insets.top}>
      {/* Header */}
      <XStack
        paddingHorizontal="$5"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="center"
      >
        <Button
          position="absolute"
          left="$4"
          circular
          size="$3"
          backgroundColor="transparent"
          icon={<Ionicons name="chevron-back" size={32} color={theme.primary} />}
          onPress={() => navigation.goBack()}
          pressStyle={{ opacity: 0.6 }}
        />
        <YStack flex={1} alignItems="center">
          <Text fontFamily="$ethiopicSerif" fontSize={22} fontWeight="800" color={theme.primary} textAlign="center">
            {t('player')}
          </Text>
        </YStack>
      </XStack>

      {/* Album Art Section */}
      <YStack alignItems="center" justifyContent="center" padding="$8" space="$4" f={1}>
        <Circle size={220} backgroundColor={theme.primary} elevation="$4" shadowColor="black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.2} shadowRadius={10}>
          <Ionicons name="musical-notes" size={120} color={theme.accent} />
        </Circle>

        <Text
          fontFamily="$ethiopicSerif"
          fontSize="$8"
          fontWeight="800"
          color={theme.primary}
          textAlign="center"
          marginTop="$6"
        >
          {mezmur.title}
        </Text>

        <Text
          fontFamily="$ethiopic"
          fontSize="$5"
          color={theme.text}
          opacity={0.9}
          fontWeight="600"
        >
          {t(mezmur.section)}
        </Text>
      </YStack>

      {/* Progress & Controls Section (Isolated) */}
      <FullPlayerControls
        position={undefined} // Will be handled inside
        duration={undefined} // Will be handled inside
        isPlaying={isPlaying}
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        isLooping={isLooping}
        isShuffle={isShuffle}
        togglePlayback={togglePlayback}
        toggleLoop={toggleLoop}
        toggleShuffle={toggleShuffle}
        handleSkip={handleSkip}
        handleSeek={handleSeek}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        mezmur={mezmur}
        theme={theme}
        t={t}
        insets={insets}
      />
    </YStack>
    </YStack >
  );
};

const FullPlayerControls = memo(({
  mezmur, isPlaying, isLoading, error, clearError,
  isLooping, isShuffle,
  togglePlayback, toggleLoop, toggleShuffle, handleSkip, handleSeek,
  isFavorite, toggleFavorite,
  theme, t, insets
}) => {
  const { position, duration } = useAudioProgress();

  return (
    <YStack
      backgroundColor={theme.cardBackground}
      padding="$4"
      paddingBottom={insets.bottom + 20}
      borderTopLeftRadius={40}
      borderTopRightRadius={40}
      elevation="$5"
    >
      {/* Style Handle */}
      <YStack
        width={40}
        height={4}
        backgroundColor={theme.playerAccent}
        borderRadius={2}
        alignSelf="center"
        marginVertical="$3"
        opacity={0.4}
      />

      {/* Error Message */}
      {error && (
        <YStack
          backgroundColor={theme.error + '20'}
          padding="$3"
          borderRadius="$3"
          marginBottom="$4"
          borderWidth={1}
          borderColor={theme.error + '40'}
          alignItems="center"
        >
          <XStack alignItems="center" space="$2" marginBottom="$1">
            <Ionicons name="alert-circle" size={20} color={theme.error} />
            <Text color={theme.error} fontWeight="700">{t('error')}</Text>
          </XStack>
          <Text color={theme.error} fontSize="$2" textAlign="center" marginBottom="$2">
            {error}
          </Text>
          <Button
            size="$2"
            backgroundColor={theme.error}
            onPress={clearError}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontSize="$2">{t('dismiss')}</Text>
          </Button>
        </YStack>
      )}
      {/* Progress Slider */}
      <YStack paddingHorizontal="$2" marginBottom="$4">
        <SmoothSlider
          position={position}
          duration={duration}
          onSeek={handleSeek}
          theme={theme}
          isCurrentPlaying={true}
        />
      </YStack>

      {/* Control Buttons row */}
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$2">
        <Button
          circular
          size="$4"
          backgroundColor={isShuffle ? "rgba(0,0,0,0.05)" : "transparent"}
          icon={<Ionicons name="shuffle" size={26} color={isShuffle ? theme.accent : theme.primary} opacity={isShuffle ? 1 : 0.85} />}
          onPress={toggleShuffle}
          pressStyle={{ opacity: 0.6 }}
        />

        <XStack space="$5" alignItems="center">
          <Button
            circular
            size="$5"
            backgroundColor="transparent"
            icon={<Ionicons name="play-back" size={34} color={theme.primary} />}
            onPress={() => handleSkip(-5)}
            pressStyle={{ opacity: 0.6 }}
          />

          <Button
            circular
            size="$8"
            backgroundColor={theme.primary}
            icon={isLoading ? <ActivityIndicator color={theme.background} /> : <Ionicons name={isPlaying ? "pause" : "play"} size={42} color={theme.background} />}
            onPress={togglePlayback}
            disabled={isLoading}
            pressStyle={{ scale: 0.9 }}
            elevation="$4"
          />

          <Button
            circular
            size="$5"
            backgroundColor="transparent"
            icon={<Ionicons name="play-forward" size={34} color={theme.primary} />}
            onPress={() => handleSkip(5)}
            pressStyle={{ opacity: 0.6 }}
          />
        </XStack>

        <Button
          circular
          size="$4"
          backgroundColor={isLooping ? "rgba(0,0,0,0.05)" : "transparent"}
          icon={<Ionicons
            name={isLooping ? "repeat" : "repeat-outline"}
            size={26}
            color={isLooping ? theme.accent : theme.primary}
            opacity={isLooping ? 1 : 0.85}
          />}
          onPress={toggleLoop}
          pressStyle={{ opacity: 0.6 }}
        />
      </XStack>

      {/* Favorite Section */}
      <XStack justifyContent="center" marginTop="$6">
        <Button
          circular
          size="$5"
          backgroundColor="transparent"
          icon={<Ionicons
            name={isFavorite(mezmur.id) ? "heart" : "heart-outline"}
            size={30}
            color={isFavorite(mezmur.id) ? theme.error : theme.primary}
          />}
          onPress={() => toggleFavorite(mezmur.id)}
          pressStyle={{ scale: 1.2 }}
        />
      </XStack>
    </YStack>
  );
});

module.exports = HymnPlayerScreen;
