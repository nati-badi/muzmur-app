import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const toggleFavorite = async () => {
    try {
      const id = String(mezmur.id);
      const newFavorites = isFavorite(id)
        ? favorites.filter(fid => fid !== id)
        : [...favorites, id];
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryByLines = (lyrics = '') => {
    if (!lyrics) return 'Short';
    const lineCount = lyrics.split('\n').length;
    return lineCount > 8 ? 'Long' : 'Short';
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favButton}>
          <Ionicons 
            name={isFavorite(mezmur.id) ? "heart" : "heart-outline"} 
            size={28} 
            color={isFavorite(mezmur.id) ? COLORS.error : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{mezmur.title}</Text>
        <Text style={styles.category}>{getCategoryByLines(mezmur.lyrics)}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.lyrics}>{mezmur.lyrics}</Text>
        <Text style={styles.lyrics}>{mezmur.translation ? ('\n ትርጉም:- ' + mezmur.translation) : ''}</Text>
      </ScrollView>

      <View style={[styles.playerContainer, { paddingBottom: insets.bottom + SPACING.m }]}>
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={() => skip(-30)} style={styles.skipButton}>
            <Ionicons name="play-back-circle-outline" size={40} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton} 
            onPress={playPauseAudio}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.surface} size="large" />
            ) : (
              <Ionicons name={isPlaying ? "pause" : "play"} size={40} color={COLORS.surface} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => skip(30)} style={styles.skipButton}>
            <Ionicons name="play-forward-circle-outline" size={40} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.durationText}>{mezmur.duration}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: FONTS.size.medium,
    color: COLORS.primary,
    marginLeft: 4,
  },
  favButton: {
    padding: SPACING.s,
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 200, 
  },
  title: {
    fontSize: FONTS.size.xxlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.s,
  },
  category: {
    fontSize: FONTS.size.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.l,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '60%',
    alignSelf: 'center',
    marginBottom: SPACING.l,
  },
  lyrics: {
    fontSize: FONTS.size.large,
    color: COLORS.text,
    lineHeight: 32,
    textAlign: 'center',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: SPACING.s,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xl,
  },
  skipButton: {
    padding: SPACING.s,
  },
  durationText: {
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default DetailScreen;
