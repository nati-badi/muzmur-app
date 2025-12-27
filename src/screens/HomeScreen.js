import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { getAllSections } from '../constants/sections';
import mezmursData from '../data/mezmurs.json';

// Memoized list item component to prevent unnecessary re-renders
const MezmurListItem = memo(({ item, isFavorite, onToggleFavorite, onPress, getStatusColor }) => {
  const calculatedCategory = item.category;
  const itemIsFavorite = isFavorite(item.id);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
           <View style={[styles.statusDot, { backgroundColor: getStatusColor(calculatedCategory) }]} />
           <Text style={styles.cardTitle}>{item.id}. {item.title}</Text>
        </View>
        
        <TouchableOpacity onPress={() => onToggleFavorite(item.id)}>
          <Ionicons 
            name={itemIsFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={itemIsFavorite ? COLORS.error : COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if item ID changed or favorite status changed
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isFavorite(prevProps.item.id) === nextProps.isFavorite(nextProps.item.id)
  );
});

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMezmurs, setFilteredMezmurs] = useState(mezmursData);
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All', 'Short', 'Long'
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{"ቅዱስ ዜማ"}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Favorites')} style={styles.favButton}>
           <Ionicons name="heart-circle-outline" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMezmurs}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={21}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or lyrics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textSecondary}
            />

            <View style={styles.filterContainer}>
              {filters.map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive
                  ]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.sectionDropdown}
              onPress={() => setSectionModalVisible(true)}
            >
              <Text style={styles.sectionDropdownText}>
                {selectedSection === 'All' ? 'All Sections' : selectedSection}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={sectionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSectionModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Section</Text>
              <TouchableOpacity onPress={() => setSectionModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sectionList}>
              {sections.map((section, index) => (
                <TouchableOpacity
                  key={`${section}-${index}`}
                  style={[
                    styles.sectionItem,
                    selectedSection === section && styles.sectionItemActive
                  ]}
                  onPress={() => {
                    setSelectedSection(section);
                    setSectionModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.sectionItemText,
                    selectedSection === section && styles.sectionItemTextActive
                  ]}>
                    {section === 'All' ? 'All Sections' : section}
                  </Text>
                  {selectedSection === section && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    marginBottom: SPACING.m,
  },
  headerTitle: {
    fontSize: FONTS.size.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  favButton: {
    padding: SPACING.s,
  },
  searchInput: {
  backgroundColor: COLORS.surface,
  padding: SPACING.m,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: COLORS.border,
  fontSize: FONTS.size.medium,
  marginBottom: SPACING.m,
  },
  filterContainer: {
  flexDirection: 'row',
  marginBottom: SPACING.m,
  },
  filterChip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.s,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  filterTextActive: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderRadius: 12,
    marginBottom: SPACING.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
     flexDirection: 'row',
     alignItems: 'center',
  },
  statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: SPACING.s,
  },
  cardTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionDropdown: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: COLORS.surface,
  marginBottom: SPACING.m,
  padding: SPACING.m,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: COLORS.border,
  },
  sectionDropdownText: {
    fontSize: FONTS.size.medium,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionList: {
    paddingHorizontal: SPACING.m,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  sectionItemText: {
    fontSize: FONTS.size.medium,
    color: COLORS.text,
    flex: 1,
  },
  sectionItemTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listHeaderContainer: {
  paddingHorizontal: SPACING.m,
  paddingBottom: SPACING.m,
},

});

export default HomeScreen;
