const React = require('react');
const { useState, useEffect, useCallback } = React;
const { StyleSheet, ActivityIndicator } = require('react-native');
const { YStack, XStack, Text, Button, Circle } = require('tamagui');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { useAudio } = require('../context/GlobalAudioState.js');
const { Ionicons } = require('@expo/vector-icons');

const HymnPlayerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { currentMezmur, isPlaying, isLoading, position, duration, togglePlayback, skip } = useAudio();

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
        <XStack paddingHorizontal="$5" paddingVertical="$3" alignItems="center" justifyContent="center">
           <Button 
            position="absolute"
            left="$4"
            circular 
            size="$3" 
            backgroundColor="transparent"
            icon={<Ionicons name="menu-outline" size={28} color={theme.primary} />}
            onPress={() => navigation.toggleDrawer()}
            pressStyle={{ opacity: 0.6 }}
          />
          <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="800" color={theme.primary}>
            {t('player')}
          </Text>
        </XStack>
        <YStack f={1} justifyContent="center" alignItems="center" padding="$10">
          <Ionicons name="musical-notes-outline" size={100} color={theme.primary} opacity={0.2} />
          <Text fontFamily="$ethiopicSerif" fontSize="$6" fontWeight="800" color={theme.primary} opacity={0.5} textAlign="center" marginTop="$4">
            {t('noHymnSelected')}
          </Text>
          <Text fontFamily="$ethiopic" fontSize="$4" color={theme.textSecondary} textAlign="center" marginTop="$2" opacity={0.7}>
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
      {/* Header - Identical to HomeScreen */}
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
          icon={<Ionicons name="menu-outline" size={28} color={theme.primary} />}
          onPress={() => navigation.toggleDrawer()}
          pressStyle={{ opacity: 0.6 }}
        />
        <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="800" color={theme.primary}>
          {t('player')}
        </Text>
      </XStack>

      {/* Album Art / Featured Section */}
      <YStack alignItems="center" justifyContent="center" padding="$8" space="$4" f={1}>
        <Circle size={200} backgroundColor={theme.primary} elevation="$4">
          <Ionicons name="musical-notes" size={100} color={theme.accent} />
        </Circle>
        
        <Text 
          fontFamily="$ethiopicSerif" 
          fontSize="$7" 
          fontWeight="800" 
          color={theme.primary} 
          textAlign="center"
          marginTop="$4"
        >
          {mezmur.title}
        </Text>
        
        <Text 
          fontFamily="$ethiopic" 
          fontSize="$4" 
          color={theme.textSecondary}
          opacity={0.8}
        >
          {mezmur.section}
        </Text>
      </YStack>

      {/* Player Controls */}
      <YStack 
        backgroundColor={theme.surface}
        padding="$6"
        paddingBottom={insets.bottom + 100}
        borderTopLeftRadius={30}
        borderTopRightRadius={30}
        elevation="$5"
      >
        {/* Progress Bar */}
        <YStack space="$2" marginBottom="$5">
          <YStack backgroundColor="rgba(0,0,0,0.1)" height={6} borderRadius={3} overflow="hidden">
            <YStack 
              backgroundColor={theme.accent} 
              height="100%" 
              width={`${duration > 0 ? (position / duration) * 100 : 0}%`} 
            />
          </YStack>
          <XStack justifyContent="space-between">
            <Text color={theme.textSecondary} fontFamily="$body" fontSize="$1" fontWeight="600">
              {formatTime(position)}
            </Text>
            <Text color={theme.textSecondary} fontFamily="$body" fontSize="$1" fontWeight="600">
              {formatTime(duration || 300000)}
            </Text>
          </XStack>
        </YStack>

        {/* Control Buttons */}
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$2">
          <Button
            circular
            size="$4"
            backgroundColor="transparent"
            icon={<Ionicons name="shuffle" size={24} color={theme.primary} opacity={0.6} />}
            pressStyle={{ opacity: 0.6 }}
          />
          
          <XStack space="$6" alignItems="center">
            <Button
              circular
              size="$5"
              backgroundColor="transparent"
              icon={<Ionicons name="play-skip-back" size={32} color={theme.primary} />}
              onPress={() => skip(-10)}
              pressStyle={{ opacity: 0.6 }}
            />

            <Button
              circular
              size="$8"
              backgroundColor={theme.primary}
              icon={isLoading ? <ActivityIndicator color="white" /> : <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" />}
              onPress={togglePlayback}
              disabled={isLoading}
              pressStyle={{ scale: 0.95 }}
              elevation="$4"
            />

            <Button
              circular
              size="$5"
              backgroundColor="transparent"
              icon={<Ionicons name="play-skip-forward" size={32} color={theme.primary} />}
              onPress={() => skip(10)}
              pressStyle={{ opacity: 0.6 }}
            />
          </XStack>

          <Button
            circular
            size="$4"
            backgroundColor="transparent"
            icon={<Ionicons 
              name={isFavorite(mezmur.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite(mezmur.id) ? theme.error : theme.primary}
            />}
            onPress={() => toggleFavorite(mezmur.id)}
            pressStyle={{ opacity: 0.6 }}
          />
        </XStack>
      </YStack>
    </YStack>
  );
};

module.exports = HymnPlayerScreen;
