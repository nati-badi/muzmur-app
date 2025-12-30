const React = require('react');
const { useState, useEffect, useCallback, useMemo, memo } = React;
const { FlatList, Modal, ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions } = require('react-native');
const { YStack, XStack, Text, Input, Button, Circle, Theme } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useFocusEffect } = require('@react-navigation/native');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { getAllSections } = require('../constants/sections');
const mezmursData = require('../data/mezmurs.json');
const { COLORS } = require('../constants/theme');
const MezmurListCard = require('../components/MezmurListCard');
const { useFavorites } = require('../context/FavoritesContext');

// Constants
const FILTER_IDS = {
  ALL: 'ALL_FILTER',
  LONG: 'LONG_FILTER',
  SHORT: 'SHORT_FILTER'
};

const SECTION_ALL_ID = 'ALL_SECTIONS';
const LOAD_INCREMENT = 10;

// Skeleton loader for a premium feel during "fetching"
const SkeletonCard = memo(() => (
  <YStack 
    backgroundColor="$background"
    padding="$4"
    borderRadius="$4"
    marginBottom="$3"
    borderWidth={1}
    borderColor="$borderColor"
    opacity={0.5}
  >
    <XStack space="$3" alignItems="center">
      <Circle size={10} backgroundColor="$borderColor" />
      <YStack backgroundColor="$borderColor" height={16} width="60%" borderRadius="$2" />
    </XStack>
  </YStack>
));

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  
  // State uses IDs for stable logic
  const [selectedFilterId, setSelectedFilterId] = useState(FILTER_IDS.ALL); 
  const [selectedSectionId, setSelectedSectionId] = useState(SECTION_ALL_ID); 
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  
  // Estimate how many cards fit the screen initially
  const calculatedInitialCount = useMemo(() => {
    return Math.max(2, Math.floor((height - 280 - insets.top) / 140));
  }, [height, insets.top]);

  const [visibleCount, setVisibleCount] = useState(calculatedInitialCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Memoized Options for UI display
  const filterOptions = useMemo(() => [
    { id: FILTER_IDS.ALL, label: t('all') },
    { id: FILTER_IDS.LONG, label: t('long') },
    { id: FILTER_IDS.SHORT, label: t('short') }
  ], [t]);

  const sectionOptions = useMemo(() => {
    const uniqueSections = [...new Set(mezmursData.map(item => item.section))].filter(Boolean);
    return [
      { id: SECTION_ALL_ID, label: t('all') },
      ...uniqueSections.map(s => ({ id: s, label: s }))
    ];
  }, [t]);

  useEffect(() => {
    setTimeout(() => setIsLoadingData(false), 800); 
  }, []);

  // Update visibleCount if screen height changes
  useEffect(() => {
    if (visibleCount < calculatedInitialCount) {
        setVisibleCount(calculatedInitialCount);
    }
  }, [calculatedInitialCount]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(calculatedInitialCount);
  }, [searchQuery, selectedFilterId, selectedSectionId, calculatedInitialCount]);

  const getStatusColor = useCallback((category) => {
    return category === 'ረጅም' ? theme.error : theme.success;
  }, [theme]);

  const handlePress = useCallback((item) => {
    navigation.navigate('Detail', { mezmur: item });
  }, [navigation]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + LOAD_INCREMENT);
      setIsLoadingMore(false);
    }, 500);
  };

  const filteredMezmurs = useMemo(() => {
    let result = mezmursData;

    // 1. Filter by Section
    if (selectedSectionId !== SECTION_ALL_ID) {
      result = result.filter(item => item.section === selectedSectionId);
    }

    // 2. Filter by Length
    if (selectedFilterId !== FILTER_IDS.ALL) {
      const determineLengthId = (lyrics) => {
         if (!lyrics) return FILTER_IDS.SHORT;
         const lineCount = lyrics.split('\n').length;
         return lineCount > 8 ? FILTER_IDS.LONG : FILTER_IDS.SHORT;
      };
      
      result = result.filter(item => {
        const lengthId = determineLengthId(item.lyrics);
        return lengthId === selectedFilterId;
      });
    }

    // 3. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
        (item.lyrics && item.lyrics.toLowerCase().includes(lowerQuery)) ||
        String(item.id).includes(lowerQuery)
      );
    }

    return result;
  }, [searchQuery, selectedFilterId, selectedSectionId]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    return filteredMezmurs.slice(0, visibleCount);
  }, [filteredMezmurs, visibleCount]);

  const renderItem = useCallback(({ item }) => (
    <MezmurListCard
      item={item}
      isFavorite={isFavorite}
      onToggleFavorite={toggleFavorite}
      onPress={handlePress}
      getStatusColor={getStatusColor}
    />
  ), [isFavorite, toggleFavorite, handlePress, getStatusColor]);

  const getItemLayout = useCallback((data, index) => (
    { length: 140, offset: 140 * index, index }
  ), []);

  return (
    <YStack f={1} backgroundColor={theme.background || '#F5F5F5'} paddingTop={insets.top}>
      <XStack 
        paddingHorizontal="$5" 
        paddingVertical="$3"
        alignItems="center"
        justifyContent="center"
      >
        <Button 
          position="absolute"
          left="$4"
          circular 
          size="$3" 
          backgroundColor="transparent"
          icon={<Ionicons name="menu-outline" size={28} color={theme.primary} />}
          onPress={() => navigation.toggleDrawer()}
          pressStyle={{ opacity: 0.6 }}
        />
        <Text fontFamily="$ethiopicSerif" fontSize="$8" fontWeight="800" color={theme.primary} letterSpacing={-0.5}>
          ቅዱስ ዜማ
        </Text>
        <Button 
          position="absolute"
          right="$4"
          circular 
          size="$3" 
          backgroundColor={theme.accent}
          icon={<Ionicons name="person" size={20} color="white" />}
          onPress={() => navigation.navigate('Tabs', { screen: 'Profile' })}
          pressStyle={{ opacity: 0.8 }}
          elevation="$2"
        />
      </XStack>

      <FlatList
        data={isLoadingData ? [1, 2, 3, 4, 5, 6] : paginatedData}
        keyExtractor={(item, index) => isLoadingData ? `skeleton-${index}` : String(item.id)}
        renderItem={isLoadingData ? () => <SkeletonCard /> : renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={21}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListFooterComponent={
           !isLoadingData && filteredMezmurs.length > visibleCount && (
             <YStack alignItems="center" marginTop="$4" marginBottom="$6">
               <Button
                 size="$4"
                 theme="active"
                 backgroundColor="transparent"
                 borderColor="$primary"
                 borderWidth={1}
                 borderRadius="$10"
                 onPress={handleLoadMore}
                 disabled={isLoadingMore}
                 opacity={isLoadingMore ? 0.6 : 1}
                 icon={isLoadingMore ? <ActivityIndicator color={theme.primary} size="small" /> : undefined}
               >
                 <Text fontFamily="$ethiopicSerif" color="$primary" fontWeight="700">
                   {t('loadMore')}
                 </Text>
               </Button>
               <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" marginTop="$2" opacity={0.6}>
                 {visibleCount} / {filteredMezmurs.length}
               </Text>
             </YStack>
           )
        }
        ListHeaderComponent={
          <YStack paddingBottom="$5" space="$4">
            <Input
              size="$5"
              fontFamily="$ethiopicSerif"
              backgroundColor="transparent"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="$colorSecondary"
              borderWidth={0}
              borderBottomWidth={2}
              borderColor={theme.primary}
              borderRadius={0}
              paddingHorizontal={0}
              focusStyle={{ borderColor: theme.accent, borderBottomWidth: 3 }}
              opacity={0.8}
            />

            <XStack space="$3" justifyContent="center">
              {filterOptions.map(option => (
                <Button
                  key={option.id}
                  size="$3"
                  borderRadius="$10"
                  backgroundColor={selectedFilterId === option.id ? theme.primary : "transparent"}
                  borderColor={theme.primary}
                  borderWidth={1}
                  onPress={() => setSelectedFilterId(option.id)}
                  pressStyle={{ opacity: 0.8 }}
                  paddingHorizontal="$4"
                  elevation={selectedFilterId === option.id ? "$2" : "$0"}
                >
                  <Text 
                    fontFamily="$ethiopic"
                    fontSize="$3" 
                    fontWeight={selectedFilterId === option.id ? "800" : "600"}
                    color={selectedFilterId === option.id ? "white" : theme.primary}
                  >
                    {option.label}
                  </Text>
                </Button>
              ))}
            </XStack>

            <YStack space="$2">
               <Text fontFamily="$ethiopicSerif" fontSize="$3" color="$colorSecondary" opacity={0.7} marginLeft="$2">
                 {t('sections')}
               </Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                  {sectionOptions.map((option) => (
                    <YStack
                      key={option.id}
                      onPress={() => setSelectedSectionId(option.id)}
                      marginRight="$3"
                      paddingVertical="$2"
                      paddingHorizontal="$3"
                      borderBottomWidth={selectedSectionId === option.id ? 3 : 0}
                      borderColor={theme.accent}
                      opacity={selectedSectionId === option.id ? 1 : 0.6}
                      pressStyle={{ opacity: 0.8 }}
                    >
                      <Text 
                        fontFamily="$ethiopicSerif" 
                        fontSize="$4" 
                        color={selectedSectionId === option.id ? theme.primary : theme.text} 
                        fontWeight={selectedSectionId === option.id ? "800" : "500"} 
                      >
                        {option.label}
                      </Text>
                    </YStack>
                  ))}
               </ScrollView>
               <YStack height={1} backgroundColor="$borderColor" opacity={0.5} marginTop="$-2" zIndex={-1} />
            </YStack>
          </YStack>
        }
        ListEmptyComponent={
          !isLoadingData && (
            <YStack py="$10" ai="center" jc="center" space="$4">
              <Ionicons name="musical-notes-outline" size={64} color="$colorSecondary" opacity={0.3} />
              <Text fontFamily="$ethiopicSerif" color="$colorSecondary" fontSize="$5" textAlign="center" fontStyle="italic">
                {t('noResults')}
              </Text>
            </YStack>
          )
        }
      />
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = HomeScreen;
