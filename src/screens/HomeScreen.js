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

// Memoized list item component to prevent unnecessary re-renders
const MezmurListItem = memo(({ item, isFavorite, onToggleFavorite, onPress, getStatusColor }) => {
  const calculatedCategory = item.category;
  const itemIsFavorite = isFavorite(item.id);

  return (
    <YStack 
      backgroundColor="$background"
      padding="$4"
      borderRadius="$4"
      marginBottom="$2"
      onPress={() => onPress(item)}
      pressStyle={{ opacity: 0.7 }}
      elevation="$1"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" space="$2" flex={1}>
           <Circle size={10} backgroundColor={getStatusColor(calculatedCategory)} />
           <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>{item.id}. {item.title}</Text>
        </XStack>
        
        <Button 
          circular
          size="$3"
          backgroundColor="transparent"
          icon={<Ionicons 
            name={itemIsFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={itemIsFavorite ? COLORS.error : COLORS.textSecondary} 
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

      // Save to storage in the background (DO NOT await)
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

  // Performance optimization: tell FlatList the exact height of each item
  const getItemLayout = useCallback((data, index) => ({
    length: 72, // Approximate height of each card (padding + content)
    offset: 72 * index,
    index,
  }), []);

  return (
    <YStack f={1} backgroundColor="$background" paddingTop={insets.top}>
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        paddingHorizontal="$4" 
        paddingVertical="$2"
        marginBottom="$2"
      >
        <Text fontSize={24} fontWeight="bold" color="$color">{"ቅዱስ ዜማ"}</Text>
        <Button
          circular
          size="$4"
          backgroundColor="transparent"
          icon={<Ionicons name="heart-circle-outline" size={32} color={COLORS.primary} />}
          onPress={() => navigation.navigate('Favorites')}
        />
      </XStack>

      <FlatList
        data={filteredMezmurs}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={21}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <YStack paddingHorizontal="$1" paddingBottom="$4" space="$3">
            <Input
              size="$4"
              backgroundColor="$background"
              placeholder="Search by title or lyrics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="$color"
              borderRadius="$2"
              borderWidth={1}
              borderColor="$borderColor"
            />

            <XStack space="$2">
              {filters.map(filter => (
                <Button
                  key={filter}
                  size="$3"
                  borderRadius={20}
                  backgroundColor={selectedFilter === filter ? "$color" : "$background"}
                  borderColor="$borderColor"
                  borderWidth={1}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text 
                    fontSize="$3" 
                    fontWeight={selectedFilter === filter ? "bold" : "400"}
                    color={selectedFilter === filter ? "$background" : "$color"}
                  >
                    {filter}
                  </Text>
                </Button>
              ))}
            </XStack>

            <XStack 
              onPress={() => setSectionModalVisible(true)}
              backgroundColor="$background"
              padding="$3"
              borderRadius="$2"
              borderWidth={1}
              borderColor="$borderColor"
              justifyContent="space-between"
              alignItems="center"
              pressStyle={{ opacity: 0.8 }}
            >
              <Text fontSize="$4" color="$color">
                {selectedSection === 'All' ? 'All Sections' : selectedSection}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
            </XStack>
          </YStack>
        }
      />

      <Modal
        visible={sectionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <YStack f={1} backgroundColor="rgba(0, 0, 0, 0.5)" justifyContent="flex-end">
          <YStack 
            backgroundColor="$background" 
            borderTopLeftRadius={20} 
            borderTopRightRadius={20} 
            maxHeight="70%" 
            paddingBottom={insets.bottom + 20}
          >
            <XStack justifyContent="space-between" alignItems="center" padding="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
              <Text fontSize="$6" fontWeight="bold" color="$color">Select Section</Text>
              <Button 
                circular 
                size="$3" 
                backgroundColor="transparent" 
                icon={<Ionicons name="close" size={24} color="$color" />} 
                onPress={() => setSectionModalVisible(false)} 
              />
            </XStack>
            <ScrollView style={{ paddingHorizontal: 16 }}>
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
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text fontSize="$4" color={selectedSection === section ? COLORS.primary : "$color"} fontWeight={selectedSection === section ? "bold" : "400"} flex={1}>
                    {section === 'All' ? 'All Sections' : section}
                  </Text>
                  {selectedSection === section && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </XStack>
              ))}
            </ScrollView>
          </YStack>
        </YStack>
      </Modal>
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = HomeScreen;
