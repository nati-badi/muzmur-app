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

const MezmurListCard = require('../components/MezmurListCard');

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [favoriteMezmurs, setFavoriteMezmurs] = useState([]);
  
  // Reuse the logic from Home or pass it down if needed, but for now simple re-implementation
  const favorites = favoriteMezmurs.map(m => String(m.id)); 
  const isFavorite = useCallback(() => true, []); // Always true on favorites screen
  
  const toggleFavorite = useCallback(async (id) => {
      // Remove from list logic
      const idStr = String(id);
      const newFavorites = favoriteMezmurs.filter(m => String(m.id) !== idStr);
      setFavoriteMezmurs(newFavorites);
      
      try {
          const stored = await AsyncStorage.getItem('favorites');
          if (stored) {
              const currentIds = JSON.parse(stored);
              const updatedIds = currentIds.filter(fid => fid !== idStr);
              await AsyncStorage.setItem('favorites', JSON.stringify(updatedIds));
          }
      } catch (e) {
          console.error(e);
      }
  }, [favoriteMezmurs]);


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
          .filter(Boolean)
          // Calc category for each
          .map(m => ({...m, category: getCategoryByLines(m.lyrics)}));
          
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

  const renderItem = useCallback(({ item }) => (
      <MezmurListCard
        item={item}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onPress={(item) => navigation.navigate('Detail', { mezmur: item })}
        getStatusColor={getStatusColor}
      />
    ), [isFavorite, toggleFavorite, navigation]);

  return (
    <YStack f={1} backgroundColor="$background" paddingTop={insets.top}>
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        paddingHorizontal="$5" 
        paddingVertical="$3"
        marginBottom="$4"
      >
        <XStack alignItems="center" space="$2" onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
           <Ionicons name="arrow-back" size={24} color="$primary" />
           <Text fontFamily="$ethiopicSerif" fontSize="$4" color="$primary" fontWeight="700">ተመለስ</Text>
        </XStack>
        <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="800" color="$primary">ተወዳጆች</Text>
        <XStack width={60} /> 
      </XStack>

      {favoriteMezmurs.length === 0 ? (
        <YStack f={1} justifyContent="center" alignItems="center" padding="$10">
          <Ionicons name="heart-dislike-outline" size={80} color="$borderColor" />
          <Text 
            fontFamily="$ethiopicSerif" 
            color="$colorSecondary" 
            fontSize="$5" 
            textAlign="center" 
            marginTop="$4"
            fontStyle="italic"
          >
            ምንም የተመረጡ መዝሙራት የሉም።
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={favoriteMezmurs}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32 }}
        />
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = FavoritesScreen;
