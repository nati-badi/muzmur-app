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
        marginBottom="$3"
        onPress={() => navigation.navigate('Detail', { mezmur: item })}
        pressStyle={{ opacity: 0.7 }}
        elevation="$1"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <XStack alignItems="center" space="$3">
           <Circle size={10} backgroundColor={getStatusColor(calculatedCategory)} />
           <Text 
             fontFamily="$ethiopic" 
             fontSize="$5" 
             fontWeight="700" 
             color="$color" 
             numberOfLines={1}
           >
             {item.id}. {item.title}
           </Text>
        </XStack>
      </YStack>
    );
  };

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
           <Text fontFamily="$body" fontSize="$4" color="$primary" fontWeight="600">ተመለስ</Text>
        </XStack>
        <Text fontFamily="$heading" fontSize={24} fontWeight="700" color="$color">ተወዳጆች</Text>
        <XStack width={60} /> 
      </XStack>

      {favoriteMezmurs.length === 0 ? (
        <YStack f={1} justifyContent="center" alignItems="center" padding="$10">
          <Ionicons name="heart-dislike-outline" size={80} color="$borderColor" />
          <Text 
            fontFamily="$body" 
            color="$colorSecondary" 
            fontSize="$5" 
            textAlign="center" 
            marginTop="$4"
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
