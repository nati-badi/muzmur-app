const React = require('react');
const { useState, useEffect, useCallback, useMemo, memo } = React;
const { FlatList, Modal, ScrollView, StyleSheet } = require('react-native');
const { YStack, XStack, Text, Input, Button, Circle, Theme } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
const { useFocusEffect } = require('@react-navigation/native');
const { COLORS, FONTS, SPACING } = require('../constants/theme');
const { getAllSections } = require('../constants/sections');
const mezmursData = require('../data/mezmurs.json');

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
const MezmurListItem = memo(({ item, isFavorite, onToggleFavorite, onPress, getStatusColor }) => {
  const calculatedCategory = item.category;
  const itemIsFavorite = isFavorite(item.id);

  return (
    <YStack 
      backgroundColor="$background"
      padding="$4"
      borderRadius="$4"
      marginBottom="$3"
      onPress={() => onPress(item)}
      pressStyle={{ opacity: 0.7 }}
      elevation="$1"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" space="$3" flex={1}>
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
        
        <Button 
          circular
          size="$3"
          backgroundColor="transparent"
          icon={<Ionicons 
            name={itemIsFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={itemIsFavorite ? COLORS.error : "$colorSecondary"} 
          />}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
        />
      </XStack>
    </YStack>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isFavorite(prevProps.item.id) === nextProps.isFavorite(nextProps.item.id)
  );
});

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMezmurs, setFilteredMezmurs] = useState(mezmursData);
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All', 'አጭር', 'ረጅም'
  const [selectedSection, setSelectedSection] = useState('All'); // Section filter
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const filters = ['All', 'አጭር', 'ረጅም'];
  const sections = ['All', ...getAllSections()];
  
  const isFavorite = useCallback((id) => {
    return favorites.includes(String(id));
  }, [favorites]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sanitized = parsed.map(String).filter(id => id && id !== 'undefined');
        setFavorites(sanitized);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = useCallback((id) => {
    setFavorites(prevFavorites => {
      const stringId = String(id);

      const updatedFavorites = prevFavorites.includes(stringId)
        ? prevFavorites.filter(fid => fid !== stringId)
        : [...prevFavorites, stringId];

      AsyncStorage.setItem(
        'favorites',
        JSON.stringify(updatedFavorites)
      );

      return updatedFavorites;
    });
  }, []);

  const getCategoryByLines = (lyrics = '') => {
    if (!lyrics) return 'አጭር';
    const lineCount = lyrics.split('\n').length;
    return lineCount > 8 ? 'ረጅም' : 'አጭር';
  };

  const mezmursWithCategory = useMemo(() => {
    return mezmursData.map(item => ({
      ...item,
      category: getCategoryByLines(item.lyrics || ''),
    }));
  }, []);

  useEffect(() => {
    setIsLoadingData(true);
    
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = mezmursWithCategory.filter(item => {
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.lyrics?.toLowerCase().includes(query);

        const matchesFilter =
          selectedFilter === 'All' || item.category === selectedFilter;

        const matchesSection =
          selectedSection === 'All' || item.section === selectedSection;

        return matchesSearch && matchesFilter && matchesSection;
      });
      
      setFilteredMezmurs(filtered);
      setIsLoadingData(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilter, selectedSection, mezmursWithCategory]);

  const getStatusColor = useCallback((category) => {
    return category === 'ረጅም' ? COLORS.error : COLORS.success;
  }, []);

  const handleItemPress = useCallback((item) => {
    navigation.navigate('Detail', { mezmur: item });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <MezmurListItem
      item={item}
      isFavorite={isFavorite}
      onToggleFavorite={toggleFavorite}
      onPress={handleItemPress}
      getStatusColor={getStatusColor}
    />
  ), [isFavorite, toggleFavorite, handleItemPress, getStatusColor]);

  const getItemLayout = useCallback((data, index) => ({
    length: 80,
    offset: 80 * index,
    index,
  }), []);

  return (
    <YStack f={1} backgroundColor="$background" paddingTop={insets.top}>
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        paddingHorizontal="$5" 
        paddingVertical="$3"
        marginBottom="$2"
      >
        <Text fontFamily="$heading" fontSize={28} fontWeight="700" color={COLORS.primary}>{"ቅዱስ ዜማ"}</Text>
        <Button
          circular
          size="$5"
          backgroundColor="transparent"
          icon={<Ionicons name="heart-circle-outline" size={32} color={COLORS.primary} />}
          onPress={() => navigation.navigate('Favorites')}
          pressStyle={{ opacity: 0.7 }}
        />
      </XStack>

      <FlatList
        data={isLoadingData ? [1, 2, 3, 4, 5, 6] : filteredMezmurs}
        keyExtractor={(item, index) => isLoadingData ? `skeleton-${index}` : String(item.id)}
        renderItem={isLoadingData ? () => <SkeletonCard /> : renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={21}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <YStack paddingBottom="$5" space="$4">
            <Input
              size="$5"
              fontFamily="$body"
              backgroundColor="$background"
              placeholder="በመዝሙር ርዕስ ወይም ግጥም ይፈልጉ..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="$colorSecondary"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
              focusStyle={{ borderColor: "$primary" }}
            />

            <XStack space="$2" flexWrap="wrap">
              {filters.map(filter => (
                <Button
                  key={filter}
                  size="$3"
                  borderRadius={10}
                  backgroundColor={selectedFilter === filter ? "$primary" : "$background"}
                  borderColor={selectedFilter === filter ? "$primary" : "$borderColor"}
                  borderWidth={1}
                  onPress={() => setSelectedFilter(filter)}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text 
                    fontFamily="$body"
                    fontSize="$3" 
                    fontWeight={selectedFilter === filter ? "700" : "400"}
                    color={selectedFilter === filter ? "white" : "$color"}
                  >
                    {filter}
                  </Text>
                </Button>
              ))}
            </XStack>

            <XStack 
              onPress={() => setSectionModalVisible(true)}
              backgroundColor="$background"
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
              justifyContent="space-between"
              alignItems="center"
              pressStyle={{ opacity: 0.8, backgroundColor: "$borderColor" }}
            >
              <Text fontFamily="$body" fontSize="$4" color="$color" fontWeight="600">
                {selectedSection === 'All' ? 'ክፍላትን ይምረጡ' : selectedSection}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
            </XStack>
          </YStack>
        }
        ListEmptyComponent={
          !isLoadingData && (
            <YStack py="$10" ai="center" jc="center" space="$4">
              <Ionicons name="search-outline" size={64} color="$borderColor" />
              <Text fontFamily="$body" color="$colorSecondary" fontSize="$5" textAlign="center">
                ምንም መዝሙር አልተገኘም
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
