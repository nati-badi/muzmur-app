const React = require('react');
const { useState, useEffect, useCallback } = React;
const { ScrollView, StyleSheet, ActivityIndicator } = require('react-native');
const { YStack, XStack, Text, Button, Circle, Theme } = require('tamagui');
const { Audio } = require('expo-audio');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { Ionicons } = require('@expo/vector-icons');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { TouchableOpacity } = require('react-native');

const DetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { mezmur } = route.params;
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const getCategoryByLines = (lyrics = '') => {
    if (!lyrics) return 'አጭር';
    const lineCount = lyrics.split('\n').length;
    return lineCount > 8 ? 'ረጅም' : 'አጭር';
  };

  const getStatusColor = (category) => {
    return category === 'ረጅም' ? theme.error : theme.success;
  };

  const category = getCategoryByLines(mezmur.lyrics);
  const statusColor = getStatusColor(category);

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return '0:00';
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const playPauseAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: mezmur.audioUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
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
      }
    } catch (error) {
      console.error("Error playing audio", error);
      setIsLoading(false);
    }
  };

  const skip = async (seconds) => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        let newPosition = status.positionMillis + seconds * 1000;
        if (newPosition < 0) newPosition = 0;
        if (newPosition > status.durationMillis) newPosition = status.durationMillis;
        await sound.setPositionAsync(newPosition);
      }
    }
  };

  return (
    <YStack f={1} backgroundColor="$background" paddingTop={insets.top}>
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$4" paddingVertical="$2">
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={28} color={theme.primary} />
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

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 280 }}>
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
        
        <XStack 
          backgroundColor="$background" 
          paddingHorizontal="$4" 
          paddingVertical="$2" 
          borderRadius={20} 
          alignSelf="center" 
          borderWidth={1} 
          borderColor={theme.accent} 
          alignItems="center" 
          space="$2"
          marginBottom="$6"
        >
          <Circle size={8} backgroundColor={statusColor} />
          <Text fontFamily="$ethiopicSerif" fontSize="$2" fontWeight="bold" color={statusColor} textTransform="uppercase">
            {category}
          </Text>
        </XStack>
        
        {/* Ornamental Divider */}
        <YStack alignItems="center" marginBottom="$6">
            <Text color={theme.accent} fontSize="$4" opacity={0.6}>✤ ✤ ✤</Text>
        </YStack>
        
        <Text 
          fontFamily="$ethiopic" 
          fontSize="$5" 
          color="$color" 
          lineHeight={32} 
          textAlign="center"
        >
          {mezmur.lyrics}
        </Text>
        
        {mezmur.translation && (
          <YStack marginTop="$8">
            <YStack height={1} backgroundColor={theme.accent} width="40%" alignSelf="center" marginBottom="$6" opacity={0.3} />
            <Text 
              fontFamily="$ethiopicSerif" 
              fontSize="$5" 
              fontWeight="700" 
              color={theme.primary} 
              textAlign="center" 
              marginBottom="$4"
              fontStyle="italic"
              opacity={0.9}
            >
              {t('translation')}
            </Text>
            <Text 
              fontFamily="$ethiopicSerif" 
              fontSize="$5" 
              color="$colorSecondary" 
              lineHeight={30} 
              textAlign="center" 
              fontStyle="italic"
            >
              {mezmur.translation}
            </Text>
          </YStack>
        )}
      </ScrollView>

      {/* Premium Player UI (Image-Matched Design) */}
      <YStack 
        position="absolute" 
        bottom={0} 
        left={0} 
        right={0} 
        backgroundColor={theme.playerBackground} 
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        paddingTop="$5"
        paddingBottom={insets.bottom + 20}
        elevation="$5"
        shadowColor="black"
        shadowOffset={{ width: 0, height: -10 }}
        shadowOpacity={0.3}
        shadowRadius={15}
      >
        {/* Top Info Row */}
        <XStack paddingHorizontal="$5" alignItems="center" justifyContent="space-between" marginBottom="$4">
          <XStack space="$4" alignItems="center" f={1}>
            {/* Album Art Placeholder */}
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
                <Text color="white" fontFamily="$ethiopicSerif" fontSize="$4" fontWeight="800" numberOfLines={1}>
                    {mezmur.title}
                </Text>
                <Text color={theme.playerAccent} fontFamily="$ethiopicSerif" fontSize="$2" fontWeight="600" opacity={0.9}>
                    {mezmur.section}
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

        {/* Progress Bar Container */}
        <YStack paddingHorizontal="$5" space="$1" marginBottom="$4">
            <YStack backgroundColor="rgba(255,255,255,0.1)" height={6} borderRadius={3} overflow="hidden">
                <YStack 
                    backgroundColor={theme.playerAccent} 
                    height="100%" 
                    width={`${duration > 0 ? (position / duration) * 100 : 0}%`} 
                />
            </YStack>
            <XStack justifyContent="space-between">
                <Text color={theme.playerAccent} fontFamily="$body" fontSize="$1" fontWeight="bold">
                    {formatTime(position)}
                </Text>
                <Text color={theme.playerAccent} fontFamily="$body" fontSize="$1" fontWeight="bold">
                    {formatTime(duration || 332000)}
                </Text>
            </XStack>
        </YStack>

        {/* Control Row */}
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$6">
           <Button
              circular
              size="$3"
              backgroundColor="transparent"
              icon={<Ionicons name="shuffle" size={20} color="white" opacity={0.6} />}
              pressStyle={{ opacity: 0.6 }}
            />
            
            <XStack space="$5" alignItems="center">
                <Button
                    circular
                    size="$4"
                    backgroundColor="transparent"
                    icon={<Ionicons name="play-skip-back" size={28} color="white" />}
                    onPress={() => skip(-10)}
                    pressStyle={{ opacity: 0.6 }}
                />

                <Button
                    circular
                    size="$6"
                    backgroundColor={theme.playerAccent}
                    icon={isLoading ? <ActivityIndicator color={theme.playerBackground} /> : <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={theme.playerBackground} />}
                    onPress={playPauseAudio}
                    disabled={isLoading}
                    pressStyle={{ scale: 0.95 }}
                    elevation="$4"
                />

                <Button
                    circular
                    size="$4"
                    backgroundColor="transparent"
                    icon={<Ionicons name="play-skip-forward" size={28} color="white" />}
                    onPress={() => skip(10)}
                    pressStyle={{ opacity: 0.6 }}
                />
            </XStack>

            <Button
              circular
              size="$3"
              backgroundColor="transparent"
              icon={<Ionicons name="repeat" size={20} color="white" opacity={0.6} />}
              pressStyle={{ opacity: 0.6 }}
            />
        </XStack>
      </YStack>
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = DetailScreen;
