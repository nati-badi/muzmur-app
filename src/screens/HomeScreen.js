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

// Skeleton loader for a premium feel during "fetching"
const SkeletonCard = () => (
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
);

// Memoized list item component to prevent unnecessary re-renders
const MezmurListCard = require('../components/MezmurListCard');

const LOAD_INCREMENT = 10;

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estimate how many cards fit the screen initially
  // Header + Search + Tabs + Spacing = ~280px
  // Card height = 140px
  const calculatedInitialCount = useMemo(() => {
    return Math.max(2, Math.floor((height - 280 - insets.top) / 140));
  }, [height, insets.top]);

  const [selectedFilter, setSelectedFilter] = useState('All'); 
  const [selectedSection, setSelectedSection] = useState('All'); 
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(calculatedInitialCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filters = [t('all'), t('long'), t('short')];
  const sections = [t('all'), ...new Set(mezmursData.map(item => item.section))];

  useEffect(() => {
    loadFavorites();
    setTimeout(() => setIsLoadingData(false), 800); 
  }, []);

  // Update visibleCount if screen height changes or calculatedInitialCount changes
  useEffect(() => {
    if (visibleCount < calculatedInitialCount) {
        setVisibleCount(calculatedInitialCount);
    }
  }, [calculatedInitialCount]);

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(calculatedInitialCount);
  }, [searchQuery, selectedFilter, selectedSection, calculatedInitialCount]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = useCallback(async (id) => {
    try {
      const idStr = String(id);
      let newFavorites;
      if (favorites.includes(idStr)) {
        newFavorites = favorites.filter(fid => fid !== idStr);
      } else {
        newFavorites = [...favorites, idStr];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const isFavorite = useCallback((id) => favorites.includes(String(id)), [favorites]);

  const getStatusColor = (category) => {
    return category === 'ረጅም' ? theme.error : theme.success;
  };

  const handlePress = useCallback((item) => {
    navigation.navigate('Detail', { mezmur: item });
  }, [navigation]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate network delay for effect
    setTimeout(() => {
      setVisibleCount(prev => prev + LOAD_INCREMENT);
      setIsLoadingMore(false);
    }, 500);
  };

  const filteredMezmurs = useMemo(() => {
    let result = mezmursData;

    if (selectedSection !== 'All') {
      result = result.filter(item => item.section === selectedSection);
    }

    if (selectedFilter !== 'All') {
      const filterFunction = (lyrics) => {
         if (!lyrics) return 'አጭር';
         const lineCount = lyrics.split('\n').length;
         return lineCount > 8 ? 'ረጅም' : 'አጭር';
      };
      
      result = result.filter(item => {
        const cat = filterFunction(item.lyrics);
        return cat === selectedFilter;
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
        (item.lyrics && item.lyrics.toLowerCase().includes(lowerQuery)) ||
        String(item.id).includes(lowerQuery)
      );
    }

    return result;
  }, [searchQuery, selectedFilter, selectedSection]);

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
        <Text fontFamily="$ethiopicSerif" fontSize={28} fontWeight="800" color={theme.primary} letterSpacing={-0.5}>
          ቅዱስ ዜማ
        </Text>
        {/* User Avatar - Right Side */}
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
               <Text fontFamily="$body" fontSize={10} color="$colorSecondary" marginTop="$2" opacity={0.6}>
                 {visibleCount} / {filteredMezmurs.length}
               </Text>
             </YStack>
           )
        }
        ListHeaderComponent={
          <YStack paddingBottom="$5" space="$4">
            {/* Traditional Search Input */}
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

            {/* Length Filters (Classic Pills) */}
            <XStack space="$3" justifyContent="center">
              {filters.map(filter => (
                <Button
                  key={filter}
                  size="$3"
                  borderRadius="$10"
                  backgroundColor={selectedFilter === filter ? theme.primary : "transparent"}
                  borderColor={theme.primary}
                  borderWidth={1}
                  onPress={() => setSelectedFilter(filter)}
                  pressStyle={{ opacity: 0.8 }}
                  paddingHorizontal="$4"
                  elevation={selectedFilter === filter ? "$2" : "$0"}
                >
                  <Text 
                    fontFamily="$ethiopic"
                    fontSize="$3" 
                    fontWeight={selectedFilter === filter ? "800" : "600"}
                    color={selectedFilter === filter ? "white" : theme.primary}
                  >
                    {filter}
                  </Text>
                </Button>
              ))}
            </XStack>

            {/* Section Tabs (Horizontal Scroll - Parchment Style) */}
            <YStack space="$2">
               <Text fontFamily="$ethiopicSerif" fontSize="$3" color="$colorSecondary" opacity={0.7} marginLeft="$2">
                 {t('sections')}
               </Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                  {sections.map((section, index) => (
                    <YStack
                      key={`${section}-${index}`}
                      onPress={() => setSelectedSection(section)}
                      marginRight="$3"
                      paddingVertical="$2"
                      paddingHorizontal="$3"
                      borderBottomWidth={selectedSection === section ? 3 : 0}
                      borderColor={theme.accent}
                      opacity={selectedSection === section ? 1 : 0.6}
                      pressStyle={{ opacity: 0.8 }}
                    >
                      <Text 
                        fontFamily="$ethiopicSerif" 
                        fontSize="$4" 
                        color={selectedSection === section ? theme.primary : theme.text} 
                        fontWeight={selectedSection === section ? "800" : "500"} 
                      >
                        {section}
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

      <Modal
        visible={sectionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <Theme name="light">
          <YStack f={1} backgroundColor="rgba(0, 0, 0, 0.5)" justifyContent="flex-end">
            <YStack 
              backgroundColor="$background" 
              borderTopLeftRadius={24} 
              borderTopRightRadius={24} 
              maxHeight="80%" 
              paddingBottom={insets.bottom + 20}
              elevation="$5"
            >
              <XStack justifyContent="space-between" alignItems="center" padding="$5" borderBottomWidth={1} borderBottomColor="$borderColor">
                <Text fontFamily="$heading" fontSize="$6" fontWeight="700" color="$color">ክፍላትን ይምረጡ</Text>
                <Button 
                  circular 
                  size="$4" 
                  backgroundColor="transparent" 
                  icon={<Ionicons name="close" size={24} color="$color" />} 
                  onPress={() => setSectionModalVisible(false)} 
                />
              </XStack>
              <ScrollView style={{ paddingHorizontal: 20 }}>
                {sections.map((section, index) => (
                  <XStack
                    key={`${section}-${index}`}
                    paddingVertical="$4"
                    borderBottomWidth={1}
                    borderBottomColor="$borderColor"
                    justifyContent="space-between"
                    alignItems="center"
                    onPress={() => {
                      setSelectedSection(section);
                      setSectionModalVisible(false);
                    }}
                    backgroundColor={selectedSection === section ? "$accentColor" : "transparent"}
                    borderRadius="$3"
                    paddingHorizontal="$3"
                    marginVertical="$1"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Text 
                      fontFamily="$ethiopic" 
                      fontSize="$4" 
                      color={selectedSection === section ? COLORS.primary : "$color"} 
                      fontWeight={selectedSection === section ? "700" : "400"} 
                      flex={1}
                    >
                      {section === 'All' ? 'ሁሉንም ክፍላት' : section}
                    </Text>
                    {selectedSection === section && (
                      <Ionicons name="checkmark" size={22} color={COLORS.primary} />
                    )}
                  </XStack>
                ))}
              </ScrollView>
            </YStack>
          </YStack>
        </Theme>
      </Modal>
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = HomeScreen;
