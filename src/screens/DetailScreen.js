const React = require('react');
const { useState, useEffect, memo, useMemo } = React;
const { ScrollView, ActivityIndicator, TouchableOpacity, Alert } = require('react-native');
const { YStack, XStack, Text, Button, Circle } = require('tamagui');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { useAudio, useAudioProgress } = require('../context/GlobalAudioState.js');
const { Ionicons } = require('../utils/icons');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const SmoothSlider = require('../components/SmoothSlider');
const LocalAudioService = require('../services/LocalAudioService');

const DetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { mezmur } = route.params;
  const [hasAudio, setHasAudio] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    currentMezmur, isPlaying, isLoading,
    isLooping, isShuffle,
    playMezmur, togglePlayback, toggleLoop, toggleShuffle, handleSkip, handleSeek,
    error, clearError,
  } = useAudio();

  const isCurrentPlaying = currentMezmur?.id === mezmur.id;

  useEffect(() => {
    if (!error) return;
    const message = error === 'LOCAL_AUDIO_MISSING' ? t('audioNotOnDevice') : t('audioPlaybackFailed');
    Alert.alert(t('error'), message, [{ text: t('ok'), onPress: clearError }]);
  }, [error, t, clearError]);

  useEffect(() => {
    let cancelled = false;
    LocalAudioService.hasLocalAudio(mezmur).then((ok) => {
      if (!cancelled) setHasAudio(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [mezmur]);

  const handlePlayPause = () => {
    if (isCurrentPlaying) {
      togglePlayback();
    } else {
      playMezmur(mezmur);
    }
  };

  const categoryLabel = useMemo(() => {
    const lyrics = mezmur.lyrics || '';
    if (!lyrics) return t('short');
    return lyrics.split('\n').length > 8 ? t('long') : t('short');
  }, [mezmur.lyrics, t]);
  const statusColor = categoryLabel === t('long') ? theme.error : theme.success;

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <XStack
        paddingHorizontal="$5"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 4 }}
        >
          <XStack alignItems="center" space="$1">
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </XStack>
        </TouchableOpacity>
        <Button
          circular
          size="$4"
          backgroundColor="transparent"
          icon={<Ionicons
            name={isFavorite(mezmur.id) ? "heart" : "heart-outline"}
            size={28}
            color={isFavorite(mezmur.id) ? theme.error : theme.primary}
          />}
          onPress={() => toggleFavorite(mezmur.id)}
          pressStyle={{ opacity: 0.7 }}
        />
      </XStack>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 340 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          fontFamily="$ethiopicSerif"
          fontSize="$8"
          fontWeight="800"
          color={theme.primary}
          textAlign="center"
          marginBottom="$3"
          lineHeight={36}
        >
          {mezmur.title}
        </Text>

        <XStack space="$2" alignSelf="center" marginBottom="$6">
          <XStack
            backgroundColor={theme.cardBackground}
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius={20}
            borderWidth={1}
            borderColor={theme.borderColor}
            alignItems="center"
            space="$2"
          >
            <Circle size={8} backgroundColor={statusColor} />
            <Text fontFamily="$ethiopicSerif" fontSize="$2" fontWeight="bold" color={statusColor} textTransform="uppercase">
              {categoryLabel}
            </Text>
          </XStack>
          {hasAudio !== null && (
            <XStack
              backgroundColor={hasAudio ? `${theme.success}22` : `${theme.textSecondary}22`}
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius={20}
              alignItems="center"
              space="$1"
            >
              <Ionicons name={hasAudio ? 'volume-high' : 'document-text'} size={14} color={hasAudio ? theme.success : theme.textSecondary} />
              <Text fontSize="$1" fontWeight="700" color={hasAudio ? theme.success : theme.textSecondary}>
                {hasAudio ? t('audioAvailable') : t('lyricsOnly')}
              </Text>
            </XStack>
          )}
        </XStack>

        <YStack alignItems="center" marginBottom="$6">
          <Text color={theme.accent} fontSize="$4" opacity={0.6}>✤ ✤ ✤</Text>
        </YStack>

        <Text
          fontFamily="$ethiopic"
          fontSize="$5"
          color={theme.text}
          lineHeight={32}
          textAlign="center"
          fontWeight="500"
        >
          {mezmur.lyrics}
        </Text>

        {mezmur.translation && (
          <YStack marginTop="$8">
            <YStack height={1} backgroundColor={theme.borderColor} width="40%" alignSelf="center" marginBottom="$6" opacity={0.5} />
            <Text
              fontFamily="$ethiopicSerif"
              fontSize="$5"
              fontWeight="700"
              color={theme.primary}
              textAlign="center"
              marginBottom="$4"
              fontStyle="italic"
            >
              {t('translation')}
            </Text>
            <Text
              fontFamily="$ethiopicSerif"
              fontSize="$5"
              color={theme.text}
              lineHeight={30}
              textAlign="center"
              fontStyle="italic"
              opacity={0.8}
            >
              {mezmur.translation}
            </Text>
          </YStack>
        )}
      </ScrollView>

      {/* Premium Player UI - Isolated subcomponent */}
      <DetailPlayerControls
        mezmur={mezmur}
        currentMezmur={currentMezmur}
        isPlaying={isPlaying}
        isLoading={isLoading}
        isLooping={isLooping}
        isShuffle={isShuffle}
        togglePlayback={togglePlayback}
        toggleLoop={toggleLoop}
        toggleShuffle={toggleShuffle}
        handleSkip={handleSkip}
        handleSeek={handleSeek}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        handlePlayPause={handlePlayPause}
        hasAudio={hasAudio}
        theme={theme}
        t={t}
        insets={insets}
      />
    </YStack>
  );
};

// Isolated high-frequency updates component
const DetailPlayerControls = memo(({
  mezmur, currentMezmur, isPlaying, isLoading,
  isLooping, isShuffle,
  togglePlayback, toggleLoop, toggleShuffle, handleSkip, handleSeek,
  isFavorite, toggleFavorite, handlePlayPause, hasAudio,
  theme, t, insets
}) => {
  const { position, duration } = useAudioProgress();
  const isCurrentPlaying = currentMezmur?.id === mezmur.id;

  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor={theme.playerBackground}
      borderTopLeftRadius={24}
      borderTopRightRadius={24}
      paddingTop="$2"
      paddingBottom={insets.bottom + 20}
      elevation="$5"
      shadowColor="black"
      shadowOffset={{ width: 0, height: -10 }}
      shadowOpacity={0.3}
      shadowRadius={15}
    >
      <YStack
        width={40}
        height={4}
        backgroundColor={theme.playerAccent}
        borderRadius={2}
        alignSelf="center"
        marginVertical="$3"
        opacity={0.4}
      />
      <XStack paddingHorizontal="$5" alignItems="center" justifyContent="space-between" marginBottom="$4">
        <XStack space="$4" alignItems="center" f={1}>
          <YStack
            backgroundColor={theme.playerAccent}
            width={50}
            height={50}
            borderRadius={12}
            alignItems="center"
            justifyContent="center"
            elevation="$2"
          >
            <Ionicons name="musical-notes" size={24} color={theme.playerBackground} />
          </YStack>
          <YStack space="$1" f={1}>
            <Text color={theme.playerText} fontFamily="$ethiopicSerif" fontSize="$4" fontWeight="800" numberOfLines={1}>
              {mezmur.title}
            </Text>
            <Text color={theme.playerAccent} fontFamily="$ethiopicSerif" fontSize="$2" fontWeight="700" opacity={0.9}>
              {t(mezmur.section)}
            </Text>
          </YStack>
        </XStack>
        <Button
          circular
          size="$3"
          backgroundColor="transparent"
          icon={<Ionicons
            name={isFavorite(mezmur.id) ? "heart" : "heart-outline"}
            size={24}
            color="white"
          />}
          onPress={() => toggleFavorite(mezmur.id)}
        />
      </XStack>

      <YStack paddingHorizontal="$5" marginBottom="$4">
        <SmoothSlider
          position={isCurrentPlaying ? position : 0}
          duration={isCurrentPlaying ? duration : 0}
          onSeek={handleSeek}
          theme={theme}
        />
      </YStack>

      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$6">
        <Button
          circular
          size="$3"
          backgroundColor={isShuffle ? "rgba(255,255,255,0.15)" : "transparent"}
          icon={<Ionicons name="shuffle" size={20} color={isShuffle ? theme.playerAccent : "white"} opacity={isShuffle ? 1 : 0.85} />}
          onPress={toggleShuffle}
          pressStyle={{ opacity: 0.6 }}
        />

        <XStack space="$5" alignItems="center">
          <Button
            circular
            size="$4"
            backgroundColor="transparent"
            icon={<Ionicons name="play-back" size={28} color="white" />}
            onPress={() => isCurrentPlaying && handleSkip(-5)}
            pressStyle={{ opacity: 0.6 }}
          />

          <Button
            circular
            size="$6"
            backgroundColor={hasAudio === false ? theme.textSecondary : theme.playerAccent}
            icon={(isLoading && isCurrentPlaying) ? <ActivityIndicator color={theme.playerBackground} /> : <Ionicons name={(isPlaying && isCurrentPlaying) ? "pause" : "play"} size={32} color={theme.playerBackground} />}
            onPress={hasAudio === false ? undefined : handlePlayPause}
            disabled={isLoading || hasAudio === false}
            opacity={hasAudio === false ? 0.5 : 1}
            pressStyle={{ scale: 0.95 }}
            elevation="$4"
          />

          <Button
            circular
            size="$4"
            backgroundColor="transparent"
            icon={<Ionicons name="play-forward" size={28} color="white" />}
            onPress={() => isCurrentPlaying && handleSkip(5)}
            pressStyle={{ opacity: 0.6 }}
          />
        </XStack>

        <Button
          circular
          size="$3"
          backgroundColor={isLooping ? "rgba(255,255,255,0.15)" : "transparent"}
          icon={<Ionicons name={isLooping ? "repeat" : "repeat-outline"} size={20} color={isLooping ? theme.playerAccent : "white"} opacity={isLooping ? 1 : 0.85} />}
          onPress={toggleLoop}
          pressStyle={{ opacity: 0.6 }}
        />
      </XStack>
    </YStack>
  );
});
DetailPlayerControls.displayName = 'DetailPlayerControls';

module.exports = DetailScreen;
