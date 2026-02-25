const React = require('react');
const { useMemo, useCallback } = React;
const { FlatList, StyleSheet } = require('react-native');
const { YStack, XStack, Text, Button, Circle } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { Ionicons } = require('@expo/vector-icons');
const DataService = require('../services/DataService');
const { TouchableOpacity } = require('react-native');
const MezmurListCard = require('../components/MezmurListCard');

const ScreenHeader = require('../components/ScreenHeader');

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const favoriteMezmurs = useMemo(() => {
    return favorites
      .map(id => DataService.getAll().find(m => String(m.id) === String(id)))
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
      isFavorite={isFavorite(item.id)}
      onToggleFavorite={toggleFavorite}
      onPress={(item) => navigation.navigate('Detail', { mezmur: item })}
      getStatusColor={getStatusColor}
      theme={theme}
    />
  ), [isFavorite, toggleFavorite, navigation, getStatusColor, theme]);

  const getItemLayout = useCallback((data, index) => (
    { length: 140, offset: 140 * index, index }
  ), []);

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <ScreenHeader
        title={t('favorites')}
        onBack={() => navigation.goBack()}
        theme={theme}
      />

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
            {t('noFavorites')}
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={favoriteMezmurs}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
        />
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = FavoritesScreen;
