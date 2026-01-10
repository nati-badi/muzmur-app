const { ScrollView, useWindowDimensions, Keyboard, TouchableWithoutFeedback } = require('react-native');
const { YStack, XStack, Text, Card, Circle, Button, Input, Image } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const DataService = require('../services/DataService');
const SearchBar = require('../components/SearchBar');
const { SECTIONS } = require('../constants/sections');
const MEZMURS = require('../data/mezmurs.json');
const { normalizeAmharic } = require('../utils/textUtils');

const SectionListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchSuggestions, setSearchSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [searchBarLayout, setSearchBarLayout] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(!DataService.isReady);

  // Sync with general app hydration
  React.useEffect(() => {
    if (!DataService.isReady) {
      DataService.waitForReady().then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);
  
  // Effect to disable parent swipe when search is active
  React.useEffect(() => {
    navigation.setOptions({ 
      swipeEnabled: !showSuggestions 
    });

    return () => {
      navigation.setOptions({ 
        swipeEnabled: true 
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuggestions]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 1) {
      const normalizedQuery = normalizeAmharic(text.toLowerCase());
      const suggestions = DataService.getAll()
        .filter(m => normalizeAmharic(m.title.toLowerCase()).includes(normalizedQuery))
        .slice(0, 10);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const SkeletonItem = () => (
    <Card 
      width={cardWidth} 
      height={cardWidth * 1.35} 
      backgroundColor={theme.cardBackground} 
      marginBottom="$5" 
      borderRadius="$6"
      style={{ opacity: 0.6 }}
    >
       <YStack f={1} ai="center" jc="flex-end" padding="$3" paddingBottom="$4" space="$2" backgroundColor={theme.borderColor} opacity={0.1}>
          <YStack height={14} width="70%" backgroundColor={theme.borderColor} borderRadius="$1" opacity={0.3} />
       </YStack>
    </Card>
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      Keyboard.dismiss();
      navigation.navigate('MezmurList', { searchQuery: searchQuery.trim(), sectionTitle: t('searchResults') });
    }
  };

  const selectSuggestion = (hymn) => {
    setSearchQuery('');
    setShowSuggestions(false);
    Keyboard.dismiss();
    navigation.navigate('Detail', { mezmur: hymn });
  };

  const sections = [
    { id: SECTIONS.MARY, label: t('የእመቤታችን'), image: require('../../assets/sections/maryam.jpg') },
    { id: SECTIONS.MICHAEL, label: t('የቅዱስ ሚካኤል'), image: require('../../assets/sections/michael.jpg') },
    { id: SECTIONS.GABRIEL, label: t('የቅዱስ ገብርኤል'), image: require('../../assets/sections/gebriel.jpg') },
    { id: SECTIONS.BAPTISM, label: t('የጥምቀት'), image: require('../../assets/sections/timket_1.jpg') },
    { id: SECTIONS.THANKSGIVING, label: t('የመድኃኔዓለም'), image: require('../../assets/sections/medhanialem.jpg') },
    { id: SECTIONS.GEORGE, label: t('የቅዱስ ጊዮርጊስ'), image: require('../../assets/sections/george.jpg') },
    { id: SECTIONS.TEKLE_HAYMANOT, label: t('የአቡነ ተክለ ሃይማኖት'), image: require('../../assets/sections/tekle_haymanot.jpg') },
    { id: SECTIONS.CANA, label: t('የቃና ዘገሊላ'), image: require('../../assets/sections/cana.jpg') },
    { id: SECTIONS.GEBRE_MENFES_KIDUS, label: t('የአቡነ ገብረ መንፈስ ቅዱስ'), image: require('../../assets/sections/gebre_menfes.jpg') },
    { id: SECTIONS.CHURCH, label: t('ስለ ቤተ ክርስቲያን'), image: require('../../assets/sections/church.jpg') },
    { id: SECTIONS.ARSEMA, label: t('የቅድስት አርሴማ'), image: require('../../assets/sections/arsema.jpg') },
  ];

  const cardWidth = (width - 60) / 2;

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
          icon={<Ionicons name="menu-outline" size={28} color={theme.primary} />}
          onPress={() => navigation.toggleDrawer()}
        />
        <Text fontFamily="$ethiopicSerif" fontSize={22} fontWeight="800" color={theme.primary}>
          {t('explore')}
        </Text>
      </XStack>

      {/* Backdrop for tapping outside */}
      {showSuggestions && (
        <TouchableWithoutFeedback
          onPress={() => {
            setShowSuggestions(false);
            Keyboard.dismiss();
          }}
        >
          <YStack 
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={900}
            backgroundColor="transparent"
          />
        </TouchableWithoutFeedback>
      )}

      {/* Sticky Search Bar Hub */}
      <YStack 
        paddingHorizontal={20} 
        zIndex={1000}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          if (!searchBarLayout || 
              Math.floor(layout.y) !== Math.floor(searchBarLayout.y) || 
              Math.floor(layout.height) !== Math.floor(searchBarLayout.height)) {
            setSearchBarLayout(layout);
          }
        }}
      >
         <SearchBar
           value={searchQuery}
           onChangeText={handleSearchChange}
           onSubmitEditing={handleSearch}
           onFocus={() => {
             if (searchQuery.length > 1) setShowSuggestions(true);
           }}
           onClear={() => {
             setSearchQuery('');
             setShowSuggestions(false);
             Keyboard.dismiss();
           }}
           placeholder={t('searchPlaceholder')}
         />
         <XStack mt="$2" jc="center" marginBottom="$4">
            <Text fontSize="$1" color={theme.primary} opacity={0.8} fontStyle="italic">
               {t('searchHint')}
            </Text>
         </XStack>
      </YStack>

      {/* Modern Skeleton Grid */}
      {isLoading ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
           <YStack height={22} width={150} backgroundColor={theme.borderColor} borderRadius="$2" opacity={0.2} marginBottom="$4" />
           <XStack fw="wrap" jc="space-between">
              {[1, 2, 4, 5, 6, 7, 8, 9].map(i => <SkeletonItem key={i} />)}
           </XStack>
        </ScrollView>
      ) : (
        <>
          {/* Search Suggestions Dropdown - Root Level for Touch Handling */}
          {showSuggestions && searchSuggestions.length > 0 && searchBarLayout && (
             <YStack 
               position="absolute"
               top={searchBarLayout.y + 60} 
               left={20}
               right={20}
               backgroundColor={theme.background}
               borderRadius="$5"
               borderWidth={1}
               borderColor={theme.borderColor}
               elevation="$10"
               maxHeight={350}
               overflow="hidden"
               zIndex={2000}
             >
               <ScrollView 
                 keyboardShouldPersistTaps="handled"
                 keyboardDismissMode='none'
                 nestedScrollEnabled={true}
                 bounces={true}
               >
                 {searchSuggestions.map((hymn, index) => (
                   <YStack
                     key={hymn.id}
                     paddingHorizontal="$4"
                     paddingVertical="$3.5"
                     borderBottomWidth={index < searchSuggestions.length - 1 ? 1 : 0}
                     borderBottomColor={theme.borderColor}
                     onPress={() => selectSuggestion(hymn)}
                     pressStyle={{ backgroundColor: `${theme.primary}08` }}
                   >
                     <XStack ai="center" space="$3">
                        <Circle size={32} backgroundColor={`${theme.primary}12`}>
                           <Ionicons name="musical-note" size={16} color={theme.primary} />
                        </Circle>
                        <YStack f={1} space="$0.5">
                           <Text fontFamily="$ethiopic" fontSize={15} fontWeight="700" color={theme.text} numberOfLines={1}>
                             {hymn.title}
                           </Text>
                           <Text fontFamily="$ethiopic" fontSize={11} color={theme.textSecondary} opacity={0.8}>
                             {hymn.section}
                           </Text>
                        </YStack>
                        <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} opacity={0.3} />
                     </XStack>
                   </YStack>
                 ))}
               </ScrollView>
             </YStack>
          )}

          <ScrollView 
            contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!showSuggestions}
          >
             <Text fontFamily="$ethiopicSerif" fontSize={20} fontWeight="800" color={theme.text} marginBottom="$4">
                {t('categories')}
             </Text>
            <XStack fw="wrap" jc="space-between">
              {sections.map((section) => (
                <Card
                  key={section.id}
                  width={cardWidth}
                  height={cardWidth * 1.35}
                  backgroundColor={theme.cardBackground}
                  marginBottom="$5"
                  borderRadius="$6"
                  elevate
                  bordered
                  borderColor={theme.borderColor}
                  onPress={() => navigation.navigate('MezmurList', { sectionId: section.id, sectionTitle: section.label })}
                  pressStyle={{ scale: 0.96, opacity: 0.9 }}
                  overflow="hidden"
                >
                  {section.image && (
                    <Image 
                      source={section.image} 
                      style={{ position: 'absolute', width: '100%', height: '100%' }} 
                      resizeMode="cover"
                    />
                  )}
                  <YStack 
                    f={1} 
                    ai="center" 
                    jc="flex-end" 
                    padding="$3" 
                    paddingBottom="$4"
                    space="$2" 
                    backgroundColor="rgba(0,0,0,0.25)"
                  >
                    <Text 
                      fontFamily="$ethiopicSerif" 
                      fontSize={15} 
                      fontWeight="900" 
                      color="white" 
                      textAlign="center"
                      numberOfLines={2}
                      textShadowColor="rgba(0,0,0,0.9)"
                      textShadowOffset={{ width: 0, height: 1 }}
                      textShadowRadius={4}
                    >
                      {section.label}
                    </Text>
                  </YStack>
                </Card>
              ))}
            </XStack>
          </ScrollView>
        </>
      )}
    </YStack>
  );
};

module.exports = SectionListScreen;
