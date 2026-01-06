const React = require('react');
const { useState, useEffect, useCallback, useMemo, memo } = React;
const { FlatList, Modal, ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions, Share, Alert, TouchableWithoutFeedback, View, Image: RNImage } = require('react-native');
const { YStack, XStack, Text, Input, Button, Circle, Theme, Separator } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useFocusEffect } = require('@react-navigation/native');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { getAllSections } = require('../constants/sections');
const mezmursData = require('../data/mezmurs.json');
const { COLORS } = require('../constants/theme');
const SearchBar = require('../components/SearchBar');
const { useFavorites } = require('../context/FavoritesContext');
const { useAuth } = require('../context/AuthContext');
const MezmurListCard = require('../components/MezmurListCard');
const { normalizeAmharic } = require('../utils/textUtils');

// Constants
const FILTER_IDS = {
  ALL: 'ALL_FILTER',
  LONG: 'LONG_FILTER',
  SHORT: 'SHORT_FILTER'
};

const SECTION_ALL_ID = 'ALL_SECTIONS';
const LOAD_INCREMENT = 10;

// Pre-calculate data metadata for high performance filtering
// This runs once on module load, removing O(N) string splitting from the render path
const PROCESSED_DATA = mezmursData.map(item => {
  let lengthType = FILTER_IDS.SHORT;
  if (item.lyrics) {
     const count = item.lyrics.split('\n').length;
     if (count > 8) lengthType = FILTER_IDS.LONG;
  }
  // Add searchable text string for faster search - now normalized for Amharic namesake chars
  const rawSearchText = (item.title + ' ' + (item.lyrics || '') + ' ' + item.id).toLowerCase();
  const searchText = normalizeAmharic(rawSearchText);
  
  return { ...item, lengthType, searchText };
});

// Skeleton loader for a premium feel during "fetching"
const SkeletonCard = memo(() => {
  const { theme } = useAppTheme();
  return (
    <YStack 
      backgroundColor={theme.cardBackground}
    padding="$4"
    borderRadius="$4"
    marginBottom="$3"
    opacity={0.5}
  >
    <XStack space="$3" alignItems="center">
      <Circle size={10} backgroundColor={theme.borderColor} />
      <YStack backgroundColor={theme.borderColor} height={16} width="60%" borderRadius="$2" opacity={0.3} />
    </XStack>
  </YStack>
  );
});

// Memoized filter component to prevent list renders from blocking button clicks
const FilterToggles = memo(({ options, activeId, onSelect, theme }) => {
  return (
    <XStack space="$3" justifyContent="center">
      {options.map(option => {
        const isActive = activeId === option.id;
        return (
          <Button
            key={option.id}
            size="$3"
            borderRadius="$10"
            backgroundColor={isActive ? theme.primary : 'transparent'}
            borderColor={theme.primary}
            borderWidth={isActive ? 0 : 1}
            onPress={() => onSelect(option.id)}
            pressStyle={{ opacity: 0.8, scale: 0.95 }}
            paddingHorizontal="$4"
            elevation={isActive ? "$2" : "$0"}
            height={40}
            minWidth={80}
          >
            <Text 
              fontFamily="$ethiopic"
              fontSize="$3" 
              fontWeight={isActive ? "700" : "600"}
              color={isActive ? "white" : theme.primary}
            >
              {option.label}
            </Text>
          </Button>
        );
      })}
    </XStack>
  );
});

const HomeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { profileData } = useAuth();
  
  // Drill-down support
  const initialSectionId = route.params?.sectionId || SECTION_ALL_ID;
  const initialSectionTitle = route.params?.sectionTitle;
  const initialSearchQuery = route.params?.searchQuery || '';
  const isDrillDown = !!route.params?.sectionId || !!route.params?.searchQuery;

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearchQuery);
  
  // State uses IDs for stable logic
  const [selectedFilterId, setSelectedFilterId] = useState(FILTER_IDS.ALL);
  const [appliedFilterId, setAppliedFilterId] = useState(FILTER_IDS.ALL); // For deferred filtering
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId); 
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Debounce search query to prevent excessive filtering during typing
  // Debounce search query to prevent excessive filtering during typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms delay is standard for good UX
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Deferred effect to update filter without blocking UI
  useEffect(() => {
    if (selectedFilterId !== appliedFilterId) {
       // A longer delay here ensures the UI color swap is COMPLETELY finished
       // and the user sees the button change before the heavy list filtering starts.
       const timer = setTimeout(() => {
         setAppliedFilterId(selectedFilterId);
       }, 100); 
       return () => clearTimeout(timer);
    }
  }, [selectedFilterId, appliedFilterId]);
  
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
      ...uniqueSections.map(s => ({ id: s, label: t(s) || s }))
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
  }, [searchQuery, appliedFilterId, selectedSectionId, calculatedInitialCount]);

  const getStatusColor = useCallback((lengthType) => {
    return lengthType === FILTER_IDS.LONG ? theme.error : theme.success;
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

  const handleShare = async () => {
    setIsMenuOpen(false);
    try {
      await Share.share({
        message: `${t('appTitle')}: ${t('shareMessage')}`,
        url: 'https://muzmur-app.web.app',
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFeedback = () => {
    setIsMenuOpen(false);
    Alert.alert(
      t('feedbackAlertTitle'),
      t('feedbackAlertMessage'),
      [{ text: t('ok') }]
    );
  };

  const handleCheckUpdate = () => {
    setIsMenuOpen(false);
    Alert.alert(
      t('updatesAlertTitle'),
      t('updatesAlertMessage'),
      [{ text: t('great') }]
    );
  };

  const handleShowMenu = () => {
    Alert.alert(
      t('moreOptions'),
      t('chooseAction'),
      [
        { text: t('shareApp'), onPress: handleShare },
        { text: t('feedback'), onPress: handleFeedback },
        { text: t('checkUpdates'), onPress: handleCheckUpdate },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  const filteredMezmurs = useMemo(() => {
    let result = PROCESSED_DATA;

    // 1. Filter by Section
    if (selectedSectionId !== SECTION_ALL_ID) {
      result = result.filter(item => item.section === selectedSectionId);
    }

    // 2. Filter by Length (optimized with pre-calculated field)
    if (appliedFilterId !== FILTER_IDS.ALL) {
      result = result.filter(item => item.lengthType === appliedFilterId);
    }

    // 3. Search (using pre-calculated and normalized searchText)
    if (debouncedQuery) {
      const normalizedQuery = normalizeAmharic(debouncedQuery.toLowerCase());
      result = result.filter(item => item.searchText.includes(normalizedQuery));
    }

    return result;
  }, [debouncedQuery, appliedFilterId, selectedSectionId]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    return filteredMezmurs.slice(0, visibleCount);
  }, [filteredMezmurs, visibleCount]);

  const renderItem = useCallback(({ item }) => (
    <MezmurListCard
      item={item}
      isFavorite={isFavorite(item.id)}
      onToggleFavorite={toggleFavorite}
      onPress={handlePress}
      getStatusColor={() => getStatusColor(item.lengthType)}
      theme={theme}
    />
  ), [isFavorite, toggleFavorite, handlePress, getStatusColor, theme]);

  const getItemLayout = useCallback((data, index) => (
    { length: 140, offset: 140 * index, index }
  ), []);

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <XStack 
        paddingHorizontal="$5" 
        paddingVertical="$3"
        alignItems="center"
        justifyContent="center"
        zIndex={100}
      >
        <Button 
          position="absolute"
          left="$4"
          circular 
          size="$3" 
          backgroundColor="transparent"
          icon={<Ionicons name={isDrillDown ? "chevron-back" : "menu-outline"} size={28} color={theme.primary} />}
          onPress={() => isDrillDown ? navigation.goBack() : navigation.toggleDrawer()}
          pressStyle={{ opacity: 0.6 }}
        />
        <Text 
          fontFamily="$ethiopicSerif" 
          fontSize={isDrillDown ? "$6" : "$8"} 
          fontWeight="800" 
          color={theme.primary} 
          letterSpacing={-0.5}
          numberOfLines={1}
          maxWidth="70%"
        >
          {initialSearchQuery ? t('searchResults') : (isDrillDown ? initialSectionTitle : t('appTitle'))}
        </Text>
        <Button 
          position="absolute"
          right="$4"
          circular 
          size="$3" 
          backgroundColor="transparent"
          onPress={() => setIsMenuOpen(!isMenuOpen)}
          pressStyle={{ opacity: 0.6 }}
          padding="$0"
        >
          {profileData?.photoURL ? (
            <RNImage 
              source={{ uri: profileData.photoURL }} 
              style={{ width: 34, height: 34, borderRadius: 17 }} 
            />
          ) : (
            <Ionicons name="ellipsis-vertical" size={24} color={theme.primary} />
          )}
        </Button>

        {/* Modal-based Modern Dropdown Menu for reliable dismiss-on-tap-outside */}
        <Modal
          visible={isMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
               <YStack
                position="absolute"
                top={insets.top + 10} // Positioned right below the three-dots button
                right={16}
                width={200}
                backgroundColor={theme.surface}
                borderRadius="$4"
                padding="$2"
                elevation="$5"
                zIndex={100}
                borderWidth={1}
                borderColor={theme.borderColor}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.2}
                shadowRadius={8}
              >
                <Button
                  size="$4"
                  chromeless
                  justifyContent="flex-start"
                  onPress={handleShare}
                  icon={<Ionicons name="share-social-outline" size={20} color={theme.primary} />}
                  pressStyle={{ backgroundColor: `${theme.primary}15` }}
                >
                  <Text fontFamily="$body" color={theme.text} fontSize="$3">{t('shareApp')}</Text>
                </Button>
                <Button
                  size="$4"
                  chromeless
                  justifyContent="flex-start"
                  onPress={handleFeedback}
                  icon={<Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.primary} />}
                  pressStyle={{ backgroundColor: `${theme.primary}15` }}
                >
                  <Text fontFamily="$body" color={theme.text} fontSize="$3">{t('feedback')}</Text>
                </Button>
                <Separator borderColor={theme.borderColor} opacity={0.5} marginVertical="$1" />
                <Button
                  size="$4"
                  chromeless
                  justifyContent="flex-start"
                  onPress={handleCheckUpdate}
                  icon={<Ionicons name="cloud-download-outline" size={20} color={theme.primary} />}
                  pressStyle={{ backgroundColor: `${theme.primary}15` }}
                >
                  <Text fontFamily="$body" color={theme.text} fontSize="$3">{t('checkUpdates')}</Text>
                </Button>
              </YStack>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </XStack>

      <FlatList
        data={isLoadingData ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : paginatedData}
        keyExtractor={(item, index) => isLoadingData ? `skeleton-${index}` : String(item.id)}
        renderItem={isLoadingData ? () => <SkeletonCard /> : renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        initialNumToRender={calculatedInitialCount}
        maxToRenderPerBatch={5}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListFooterComponent={
           !isLoadingData && filteredMezmurs.length > visibleCount && (
             <YStack alignItems="center" marginTop="$4" marginBottom="$6">
                <Button
                  size="$4"
                  theme="active"
                  backgroundColor="transparent"
                  borderColor={theme.primary}
                  borderWidth={1.5}
                  borderRadius="$10"
                  onPress={handleLoadMore}
                  disabled={isLoadingMore}
                  opacity={isLoadingMore ? 0.6 : 1}
                  icon={isLoadingMore ? <ActivityIndicator color={theme.primary} size="small" /> : undefined}
                >
                  <Text fontFamily="$ethiopicSerif" color={theme.primary} fontWeight="700">
                     {t('loadMore')}
                  </Text>
                </Button>
               <Text fontFamily="$body" fontSize="$1" color={theme.textSecondary} marginTop="$2" opacity={0.6}>
                 {visibleCount} / {filteredMezmurs.length}
               </Text>
             </YStack>
           )
        }
        ListHeaderComponent={
          <YStack paddingBottom="$5" space="$4">
            <SearchBar 
               value={searchQuery}
               onChangeText={setSearchQuery}
               onClear={() => setSearchQuery('')}
               placeholder={t('searchPlaceholder')}
            />

            <FilterToggles 
              options={[
                { id: FILTER_IDS.ALL, label: t('all') },
                { id: FILTER_IDS.LONG, label: t('long') },
                { id: FILTER_IDS.SHORT, label: t('short') }
              ]}
              activeId={selectedFilterId}
              onSelect={setSelectedFilterId}
              theme={theme}
            />

            {!isDrillDown && (
              <YStack space="$2">
                 <Text fontFamily="$ethiopicSerif" fontSize="$3" color={theme.textSecondary} opacity={0.7} marginLeft="$2">
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
            )}
          </YStack>
        }
        ListEmptyComponent={
          !isLoadingData && (
            <YStack py="$10" ai="center" jc="center" space="$4">
              <Ionicons name="musical-notes-outline" size={64} color={theme.textSecondary} opacity={0.3} />
              <Text fontFamily="$ethiopicSerif" color={theme.textSecondary} fontSize="$5" textAlign="center" fontStyle="italic">
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
