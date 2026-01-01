const React = require('react');
const { ScrollView, useWindowDimensions } = require('react-native');
const { YStack, XStack, Text, Card, Circle, Button, Input } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { SECTIONS } = require('../constants/sections');

const SectionListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('MezmurList', { searchQuery: searchQuery.trim(), sectionTitle: t('searchResults') || 'Search Results' });
    }
  };

  const sections = [
    { id: SECTIONS.MARY, label: 'የእመቤታችን', icon: 'heart', color: '#E91E63' },
    { id: SECTIONS.MICHAEL, label: 'የቅዱስ ሚካኤል', icon: 'shield', color: '#2196F3' },
    { id: SECTIONS.GABRIEL, label: 'የቅዱስ ገብርኤል', icon: 'paper-plane', color: '#4CAF50' },
    { id: SECTIONS.BAPTISM, label: 'የጥምቀት', icon: 'water', color: '#00BCD4' },
    { id: SECTIONS.THANKSGIVING, label: 'የመድኃኔዓለም', icon: 'sunny', color: '#FF9800' },
    { id: SECTIONS.GEORGE, label: 'የቅዱስ ጊዮርጊስ', icon: 'ribbon', color: '#F44336' },
    { id: SECTIONS.TEKLE_HAYMANOT, label: 'የአቡነ ተክለ ሃይማኖት', icon: 'leaf', color: '#8BC34A' },
    { id: SECTIONS.CANA, label: 'የቃና ዘገሊላ', icon: 'wine', color: '#9C27B0' },
    { id: SECTIONS.GEBRE_MENFES_KIDUS, label: 'የአቡነ ገብረ መንፈስ ቅዱስ', icon: 'disc', color: '#795548' },
    { id: SECTIONS.CHURCH, label: 'ስለ ቤተ ክርስቲያን', icon: 'home', color: '#607D8B' },
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
          {t('explore') || 'Explore'}
        </Text>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Search Bar Hub */}
        <YStack marginBottom="$6">
           <XStack 
             backgroundColor="$background" 
             borderRadius="$10" 
             borderWidth={1.5} 
             borderColor={theme.primary} 
             paddingHorizontal="$4" 
             height={55} 
             alignItems="center"
             elevation="$2"
           >
             <Ionicons name="search" size={20} color={theme.primary} opacity={0.6} />
             <Input 
               f={1}
               placeholder={t('searchPlaceholder')}
               fontFamily="$body"
               fontSize="$4"
               backgroundColor="transparent"
               borderWidth={0}
               value={searchQuery}
               onChangeText={setSearchQuery}
               onSubmitEditing={handleSearch}
               placeholderTextColor="$colorSecondary"
             />
             {searchQuery.length > 0 && (
               <Button 
                 circular 
                 chromeless 
                 size="$2" 
                 icon={<Ionicons name="close-circle" size={20} color={theme.primary} opacity={0.6} />} 
                 onPress={() => setSearchQuery('')}
               />
             )}
           </XStack>
           <XStack mt="$2" jc="flex-end">
              <Text fontSize="$1" color={theme.primary} opacity={0.6} fontStyle="italic">
                Search all hymns...
              </Text>
           </XStack>
        </YStack>

        <Text fontFamily="$ethiopicSerif" fontSize={20} fontWeight="800" color={theme.text} marginBottom="$4">
           {t('categories') || 'Categories'}
        </Text>
        <XStack fw="wrap" jc="space-between">
          {sections.map((section) => (
            <Card
              key={section.id}
              width={cardWidth}
              height={cardWidth * 1.1}
              backgroundColor={theme.cardBackground}
              marginBottom="$5"
              borderRadius="$6"
              elevate
              bordered
              borderColor={theme.borderColor}
              onPress={() => navigation.navigate('MezmurList', { sectionId: section.id, sectionTitle: section.label })}
              pressStyle={{ scale: 0.96, opacity: 0.9 }}
            >
              <YStack f={1} ai="center" jc="center" padding="$4" space="$3">
                <Circle size={width * 0.15} backgroundColor={section.color + '20'}>
                  <Ionicons name={section.icon} size={32} color={section.color} />
                </Circle>
                <Text 
                  fontFamily="$ethiopic" 
                  fontSize={14} 
                  fontWeight="700" 
                  color={theme.text} 
                  textAlign="center"
                  numberOfLines={2}
                >
                  {section.label}
                </Text>
              </YStack>
            </Card>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
};

module.exports = SectionListScreen;
