const React = require('react');
const { useState, useCallback } = React;
const { FlatList, StyleSheet } = require('react-native');
const { YStack, XStack, Text, Button, Circle } = require('tamagui');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useFocusEffect } = require('@react-navigation/native');
const { COLORS, FONTS, SPACING } = require('../constants/theme');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const mezmursData = require('../data/mezmurs.json');

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
      <YStack
        backgroundColor="$background"
        padding="$4"
        borderRadius="$4"
        marginBottom="$2"
        onPress={() => navigation.navigate('Detail', { mezmur: item })}
        pressStyle={{ opacity: 0.7 }}
        elevation="$1"
      >
        <XStack alignItems="center" space="$2">
           <Circle size={10} backgroundColor={getStatusColor(calculatedCategory)} />
           <Text fontSize="$4" fontWeight="600" color="$color">{item.id}. {item.title}</Text>
        </XStack>
      </YStack>
    );
  };

  return (
    <YStack f={1} backgroundColor="$background" paddingTop={insets.top}>
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        paddingHorizontal="$4" 
        paddingVertical="$2"
        marginBottom="$2"
      >
        <XStack alignItems="center" space="$2" onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
           <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
           <Text fontSize="$4" color={COLORS.primary}>Back</Text>
        </XStack>
        <Text fontSize="$5" fontWeight="bold" color="$color">Favorites</Text>
        <XStack width={60} /> 
      </XStack>

      {favoriteMezmurs.length === 0 ? (
        <YStack f={1} justifyContent="center" alignItems="center">
          <Text color="$colorSecondary" fontSize="$4">No favorites yet.</Text>
        </YStack>
      ) : (
        <FlatList
          data={favoriteMezmurs}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        />
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = FavoritesScreen;
