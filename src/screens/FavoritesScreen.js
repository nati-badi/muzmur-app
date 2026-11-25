const React = require('react');
const { useMemo, useCallback, useState } = React;
const { useFocusEffect } = require('@react-navigation/native');
const { FlatList } = require('react-native');
const { YStack, Text } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useFavorites } = require('../context/FavoritesContext');
const { Ionicons } = require('../utils/icons');
const DataService = require('../services/DataService');
const MezmurListCard = require('../components/MezmurListCard');
const LocalAudioService = require('../services/LocalAudioService');

const ScreenHeader = require('../components/ScreenHeader');

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [audioIndexVersion, setAudioIndexVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      LocalAudioService.refreshAudioAvailability().then(() => {
        setAudioIndexVersion((v) => v + 1);
      });
    }, [])
  );

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
      hasAudio={LocalAudioService.isAudioAvailable(item.id)}
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
          extraData={audioIndexVersion}
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

module.exports = FavoritesScreen;
