import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import mezmursData from '../data/mezmurs.json';

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [favoriteMezmurs, setFavoriteMezmurs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const getCategoryByLines = (lyrics = '') => {
    if (!lyrics) return 'አጭር';
    const lineCount = lyrics.split('\n').length;
    return lineCount > 8 ? 'ረጅም' : 'አጭር';
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        const favoriteIds = JSON.parse(stored);
        const mappedMezmurs = favoriteIds
          .map(id => mezmursData.find(m => String(m.id) === String(id)))
          .filter(Boolean);
        setFavoriteMezmurs(mappedMezmurs);
      } else {
        setFavoriteMezmurs([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (category) => {
    return category === 'ረጅም' ? COLORS.error : COLORS.success;
  };

  const renderItem = ({ item }) => {
    const calculatedCategory = getCategoryByLines(item.lyrics);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('Detail', { mezmur: item })}
      >
        <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
                 <View style={[styles.statusDot, { backgroundColor: getStatusColor(calculatedCategory) }]} />
                 <Text style={styles.cardTitle}>{item.id}. {item.title}</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
           <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 60 }} /> 
      </View>

      {favoriteMezmurs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No favorites yet.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteMezmurs}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    marginBottom: SPACING.m,
  },
  headerTitle: {
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
    color: COLORS.primary,
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
  listContent: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderRadius: 12,
    marginBottom: SPACING.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: SPACING.s,
  },
  cardTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
  },
});

export default FavoritesScreen;
