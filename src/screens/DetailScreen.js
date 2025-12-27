const React = require('react');
const { useState, useEffect, useCallback } = React;
const { ScrollView, StyleSheet, ActivityIndicator } = require('react-native');
const { YStack, XStack, Text, Button, Circle, Theme } = require('tamagui');
const { Audio } = require('expo-av');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { COLORS, FONTS, SPACING } = require('../constants/theme');
const { Ionicons } = require('@expo/vector-icons');
const { useSafeAreaInsets } = require('react-native-safe-area-context');

const DetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { mezmur } = route.params;
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sanitized = parsed.map(String).filter(id => id && id !== 'undefined');
        setFavorites(sanitized);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isFavorite = (id) => favorites.includes(String(id));

  const toggleFavorite = useCallback(() => {
    setFavorites(prevFavorites => {
      const id = String(mezmur.id);
      const updatedFavorites = prevFavorites.includes(id)
        ? prevFavorites.filter(fid => fid !== id)
        : [...prevFavorites, id];

      AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, [mezmur.id]);

  const getCategoryByLines = (lyrics = '') => {
    if (!lyrics) return 'አጭር';
    const lineCount = lyrics.split('\n').length;
    return lineCount > 8 ? 'ረጅም' : 'አጭር';
  };

  const getStatusColor = (category) => {
    return category === 'ረጅም' ? COLORS.error : COLORS.success;
  };

  const category = getCategoryByLines(mezmur.lyrics);
  const statusColor = getStatusColor(category);

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
            if (status.didJustFinish) {
                setIsPlaying(false);
                newSound.setPositionAsync(0);
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
        <XStack alignItems="center" space="$2" onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
          <Ionicons name="arrow-back" size={24} color="$primary" />
          <Text fontFamily="$body" fontSize="$4" color="$primary" fontWeight="600">ተመለስ</Text>
        </XStack>
        <Button
          circular
          size="$4"
          backgroundColor="transparent"
          icon={<Ionicons 
            name={isFavorite(mezmur.id) ? "heart" : "heart-outline"} 
            size={28} 
            color={isFavorite(mezmur.id) ? COLORS.error : "$primary"} 
          />}
          onPress={toggleFavorite}
          pressStyle={{ opacity: 0.7 }}
        />
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 220 }}>
        <Text 
          fontFamily="$heading" 
          fontSize="$9" 
          fontWeight="700" 
          color="$color" 
          textAlign="center" 
          marginBottom="$3"
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
          borderColor="$borderColor" 
          alignItems="center" 
          space="$2"
          marginBottom="$6"
        >
          <Circle size={8} backgroundColor={statusColor} />
          <Text fontFamily="$body" fontSize="$2" fontWeight="bold" color={statusColor} textTransform="uppercase">
            {category}
          </Text>
        </XStack>
        
        <YStack height={1} backgroundColor="$borderColor" width="60%" alignSelf="center" marginBottom="$6" />
        
        <Text 
          fontFamily="$ethiopic" 
          fontSize="$6" 
          color="$color" 
          lineHeight={36} 
          textAlign="center"
        >
          {mezmur.lyrics}
        </Text>
        
        {mezmur.translation && (
          <YStack marginTop="$8">
            <Text 
              fontFamily="$ethiopicSerif" 
              fontSize="$5" 
              fontWeight="700" 
              color="$primary" 
              textAlign="center" 
              marginBottom="$4"
              fontStyle="italic"
            >
              ትርጉም
            </Text>
            <Text 
              fontFamily="$ethiopicSerif" 
              fontSize="$6" 
              color="$colorSecondary" 
              lineHeight={34} 
              textAlign="center" 
              fontStyle="italic"
            >
              {mezmur.translation}
            </Text>
          </YStack>
        )}
      </ScrollView>

      <YStack 
        position="absolute" 
        bottom={0} 
        left={0} 
        right={0} 
        backgroundColor="rgba(255,255,255,0.98)" 
        padding="$5" 
        borderTopWidth={1} 
        borderTopColor="$borderColor" 
        alignItems="center" 
        paddingBottom={insets.bottom + 20}
        elevation="$5"
      >
        <XStack space="$8" alignItems="center" marginBottom="$4">
          <Button
            circular
            backgroundColor="transparent"
            icon={<Ionicons name="play-back-circle-outline" size={44} color="$colorSecondary" />}
            onPress={() => skip(-30)}
            pressStyle={{ opacity: 0.7 }}
          />

          <Button
            circular
            size="$6"
            backgroundColor="$primary"
            icon={isLoading ? <ActivityIndicator color="white" /> : <Ionicons name={isPlaying ? "pause" : "play"} size={44} color="white" />}
            onPress={playPauseAudio}
            disabled={isLoading}
            pressStyle={{ opacity: 0.8 }}
            elevation="$3"
          />

          <Button
            circular
            backgroundColor="transparent"
            icon={<Ionicons name="play-forward-circle-outline" size={44} color="$colorSecondary" />}
            onPress={() => skip(30)}
            pressStyle={{ opacity: 0.7 }}
          />
        </XStack>
        <XStack space="$2" alignItems="center">
          <Ionicons name="time-outline" size={16} color="$colorSecondary" />
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" fontWeight="600">
            {mezmur.duration}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = DetailScreen;
