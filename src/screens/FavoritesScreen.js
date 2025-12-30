const React = require('react');
const { useMemo, useCallback } = React;
const { FlatList, StyleSheet } = require('react-native');
const { YStack, XStack, Text, Button, Circle } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { Ionicons } = require('@expo/vector-icons');
const mezmursData = require('../data/mezmurs.json');

const MezmurListCard = require('../components/MezmurListCard');

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  const favoriteMezmurs = useMemo(() => {
    return favorites
      .map(id => mezmursData.find(m => String(m.id) === String(id)))
      .filter(Boolean)
      .map(m => {
        const lineCount = (m.lyrics || '').split('\n').length;
        const category = lineCount > 8 ? 'ረጅም' : 'አጭር';
        return { ...m, category };
      });
  }, [favorites]);

  const getStatusColor = useCallback((category) => {
    return category === 'ረጅም' ? theme.error : theme.success;
  }, [theme]);

  const renderItem = useCallback(({ item }) => (
      <MezmurListCard
        item={item}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onPress={(item) => navigation.navigate('Detail', { mezmur: item })}
        getStatusColor={getStatusColor}
      />
    ), [isFavorite, toggleFavorite, navigation, getStatusColor]);

  return (
    <YStack f={1} backgroundColor={theme.background || "$background"} paddingTop={insets.top}>
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        paddingHorizontal="$5" 
        paddingVertical="$3"
        marginBottom="$4"
      >
        <XStack alignItems="center" space="$2" onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
           <Ionicons name="arrow-back" size={24} color={theme.primary} />
           <Text fontFamily="$ethiopicSerif" fontSize="$4" color={theme.primary} fontWeight="700">{t('back')}</Text>
        </XStack>
        <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="800" color={theme.primary}>{t('favorites')}</Text>
        <XStack width={60} /> 
      </XStack>

      {favoriteMezmurs.length === 0 ? (
        <YStack f={1} justifyContent="center" alignItems="center" padding="$10">
          <Ionicons name="heart-dislike-outline" size={80} color="$borderColor" opacity={0.3} />
          <Text 
            fontFamily="$ethiopicSerif" 
            color="$colorSecondary" 
            fontSize="$5" 
            textAlign="center" 
            marginTop="$4"
            fontStyle="italic"
            opacity={0.6}
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
