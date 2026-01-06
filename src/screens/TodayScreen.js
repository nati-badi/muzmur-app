const React = require('react');
const { useState, useMemo, useEffect } = React;
const { YStack, XStack, Text, Button, ScrollView, Card, Separator, Circle, Image } = require('tamagui');
const { Image: RNImage } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { toEthiopian, toGeez, ETHIOPIC_MONTHS, ETHIOPIC_MONTHS_EN } = require('../utils/dateUtils');
const { getFeastForDate } = require('../utils/holidayData');
const MEZMURS = require('../data/mezmurs.json');
const { useAudio } = require('../context/GlobalAudioState.js');
const { useFavorites } = require('../context/FavoritesContext');
const { useAuth } = require('../context/AuthContext');

const TodayScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t, language } = useLanguage();
  const { recentlyPlayed } = useAudio();
  const { favoritesCount } = useFavorites();
  const { user, profileData } = useAuth();

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || t('guest') || 'Guest';

  // 1. Get Today's Ethiopian Date
  const today = new Date();
  const ethDayObj = useMemo(() => toEthiopian(
    today.getFullYear(), 
    today.getMonth() + 1, 
    today.getDate()
  ), []);

  const { day, month, year } = ethDayObj;
  const monthName = t(`month${month}`);
  const geezDay = toGeez(day);

  // 2. Resolve Today's Feast
  const feastSummary = useMemo(() => getFeastForDate(month, day), [month, day]);

  // 3. Recommendation Engine: Match Feast Keywords to Hymn Sections
  const recommendedHymns = useMemo(() => {
    const feastText = (feastSummary.major?.en || "") + " " + (feastSummary.monthly?.en || "");
    const feastTextAm = (feastSummary.major?.am || "") + " " + (feastSummary.monthly?.am || "");
    
    // Keyword Mapping
    let sectionMatch = "";
    if (feastText.includes("Mariam") || feastTextAm.includes("ማርያም")) sectionMatch = "የእመቤታችን የምስጋና መዝሙራት";
    else if (feastText.includes("Mikael") || feastTextAm.includes("ሚካኤል")) sectionMatch = "የቅዱስ ሚካኤል መዝሙራት";
    else if (feastText.includes("Gabriel") || feastTextAm.includes("ገብርኤል")) sectionMatch = "የቅዱስ ገብርኤል መዝሙራት";
    else if (feastText.includes("Tekle Haymanot") || feastTextAm.includes("ተክለ ሃይማኖት")) sectionMatch = "የአቡነ ተክለ ሃይማኖት መዝሙራት";
    else if (feastText.includes("Giorgis") || feastTextAm.includes("ጊዮርጊስ")) sectionMatch = "የቅዱስ ጊዮርጊስ መዝሙራት";
    else if (feastText.includes("Medhane Alem") || feastTextAm.includes("መድኃኔዓለም")) sectionMatch = "የመድኃኔዓለም የምስጋና መዝሙራት";
    else if (feastText.includes("Timket") || feastTextAm.includes("ጥምቀት")) sectionMatch = "የከተራና የጥምቀት መዝሙራት";
    else if (feastText.includes("Kana ZeGalila") || feastTextAm.includes("ቃና ዘገሊላ")) sectionMatch = "የቃና ዘገሊላ መዝሙራት";
    
    // 1. Get Feast-Specific Hymns (Strict Priority)
    let feastHymns = [];
    if (sectionMatch) {
      feastHymns = MEZMURS.filter(m => m.section === sectionMatch).sort(() => 0.5 - Math.random());
    }
    
    // 2. If we have less than 5, prepare Buffer (Maryam & Medhane Alem)
    let finalSelection = [...feastHymns.slice(0, 5)];
    
    if (finalSelection.length < 5) {
      const remainingCount = 5 - finalSelection.length;
      
      // Get Maryam and Medhane Alem pools (excluding already selected if they were the feast)
      const bufferPool = MEZMURS.filter(m => 
        (m.section === "የእመቤታችን የምስጋና መዝሙራት" || m.section === "የመድኃኔዓለም የምስጋና መዝሙራት") &&
        !finalSelection.some(sel => sel.id === m.id)
      ).sort(() => 0.5 - Math.random());
      
      finalSelection = [...finalSelection, ...bufferPool.slice(0, remainingCount)];
    }

    return finalSelection;
  }, [feastSummary]);

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* 1. Styled Header */}
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
        <YStack alignItems="center">
           <Text fontFamily="$ethiopicSerif" fontSize={22} fontWeight="800" color={theme.primary}>
             {t('appTitle')}
           </Text>
           <Text fontFamily="$body" fontSize={11} color={theme.text} opacity={0.5} textTransform="uppercase" letterSpacing={1}>
             {t('goodMorningPrompt')}, {userDisplayName}
           </Text>
        </YStack>
        <Button 
          position="absolute"
          right="$4"
          circular 
          size="$3" 
          backgroundColor="transparent"
          onPress={() => navigation.navigate('Profile')}
          pressStyle={{ opacity: 0.6 }}
          padding="$0"
        >
          {profileData?.photoURL ? (
            <RNImage 
              source={{ uri: profileData.photoURL }} 
              style={{ width: 34, height: 34, borderRadius: 17 }} 
            />
          ) : (
            <Ionicons name="person-circle-outline" size={32} color={theme.primary} />
          )}
        </Button>
      </XStack>

      <ScrollView f={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$5" space="$5">
          
          {/* Quick Actions / Link Tiles - Enhanced Premium */}
          <XStack space="$3" paddingBottom="$3">
             <Card 
               f={1} 
               height={130} 
               borderRadius="$5" 
               backgroundColor={theme.primary} 
               onPress={() => navigation.navigate('Favorites')}
               pressStyle={{ scale: 0.97, opacity: 0.95 }}
               elevation="$4"
               shadowColor="$shadowColor"
               shadowOffset={{ width: 0, height: 6 }}
               shadowOpacity={0.25}
               shadowRadius={12}
               overflow="hidden"
             >
                <YStack f={1} p="$4" jc="space-between">
                   <Circle size={44} backgroundColor="rgba(255,255,255,0.2)" ai="center" jc="center">
                      <Ionicons name="heart" size={22} color="white" />
                   </Circle>
                   <YStack>
                     <Text fontFamily="$ethiopicSerif" color="white" fontWeight="900" fontSize="$5">{t('favorites')}</Text>
                     <Text color="white" opacity={0.9} fontSize="$2" fontWeight="600">{favoritesCount} {t('mezmurs')}</Text>
                   </YStack>
                </YStack>
                {/* Subtle gradient overlay */}
                <YStack position="absolute" top={0} right={-20} opacity={0.1}>
                   <Ionicons name="heart" size={100} color="white" />
                </YStack>
             </Card>
             <Card 
               f={1} 
               height={130} 
               borderRadius="$5" 
               backgroundColor={theme.accent} 
               onPress={() => navigation.navigate('Mezmurs')}
               pressStyle={{ scale: 0.97, opacity: 0.95 }}
               elevation="$4"
               shadowColor="$shadowColor"
               shadowOffset={{ width: 0, height: 6 }}
               shadowOpacity={0.25}
               shadowRadius={12}
               overflow="hidden"
             >
                <Image 
                  source={require('../../assets/sections/church.jpg')} 
                  style={{ position: 'absolute', width: '100%', height: '100%' }} 
                  resizeMode="cover"
                />
                <YStack f={1} p="$4" jc="flex-end" backgroundColor="rgba(0,0,0,0.45)">
                    <YStack>
                       <Text fontFamily="$ethiopicSerif" color="white" fontWeight="900" fontSize="$5">{t('explore')}</Text>
                       <Text color="white" opacity={0.9} fontSize="$2" fontWeight="600">{t('categories')}</Text>
                    </YStack>
                </YStack>
             </Card>
          </XStack>

          {/* Recently Played Carousel - Enhanced */}
          {recentlyPlayed.length > 0 && (
            <YStack space="$3" marginTop="$2">
              <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$1">
                 <Text fontFamily="$ethiopicSerif" fontSize={20} fontWeight="900" color={theme.text}>
                   {t('recentlyPlayed')}
                 </Text>
                <Button chromeless p="$2" onPress={() => navigation.navigate('Mezmurs')} borderRadius="$8">
                   <XStack ai="center" space="$1">
                      <Text fontSize="$3" color={theme.primary} fontWeight="700">{t('seeAll')}</Text>
                      <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                   </XStack>
                </Button>
              </XStack>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20, paddingLeft: 4, paddingVertical: 8 }}>
                {recentlyPlayed.map((item) => (
                  <YStack 
                    key={item.id} 
                    width={150} 
                    marginRight="$4" 
                    onPress={() => navigation.navigate('Detail', { mezmur: item })}
                    pressStyle={{ scale: 0.96 }}
                  >
                    <Card
                      width={150} 
                      height={150} 
                      backgroundColor={theme.cardBackground} 
                      borderRadius="$5" 
                      borderWidth={0.6}
                      borderColor={theme.borderColor}
                      ai="center"
                      jc="center"
                      marginBottom="$2.5"
                      elevation="$3"
                      shadowColor="$shadowColor"
                      shadowOffset={{ width: 0, height: 4 }}
                      shadowOpacity={0.15}
                      shadowRadius={8}
                      overflow="hidden"
                      position="relative"
                    >
                      <Ionicons name="musical-note" size={65} color={theme.primary} opacity={0.12} />
                      <Circle position="absolute" bottom={12} right={12} size={36} backgroundColor={theme.primary} elevation="$2">
                         <Ionicons name="play" size={18} color="white" style={{marginLeft: 2}} />
                      </Circle>
                    </Card>
                    <Text fontFamily="$ethiopic" fontSize={15} fontWeight="800" color={theme.text} numberOfLines={2} lineHeight={20}>
                      {item.title}
                    </Text>
                    <Text fontFamily="$ethiopic" fontSize={12} color={theme.textSecondary} opacity={0.9} numberOfLines={1} marginTop="$1">
                      {t(item.section)}
                    </Text>
                  </YStack>
                ) )}
              </ScrollView>
            </YStack>
          )}
          
          {/* Combined Today's Date & Feast Card - Minimal Premium */}
          <Card 
            padding="$5"
            marginVertical="$4"
            borderRadius="$5"
            backgroundColor={theme.cardBackground}
            borderColor={theme.borderColor}
            borderWidth={0.6}
            elevation="$2"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.08}
            shadowRadius={8}
          >
            {/* Date Section */}
            <XStack space="$4" alignItems="center" marginBottom="$4">
              <Text fontFamily="$ethiopicSerif" fontSize={56} fontWeight="900" color={theme.primary}>
                {language === 'am' || language === 'ti' ? geezDay : (toEthiopian(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()).day)}
              </Text>
              <YStack space={0}>
                <Text fontFamily="$ethiopic" fontSize={26} fontWeight="900" color={theme.text}>
                  {monthName}
                </Text>
                <Text fontFamily="$body" fontSize={16} color={theme.primary} fontWeight="700" opacity={0.9}>
                  {year} {t('yearSuffix')}
                </Text>
              </YStack>
            </XStack>

            {/* Simple Divider */}
            <YStack height={1} backgroundColor={theme.borderColor} marginVertical="$3" opacity={0.5} />

            {/* Feast Section */}
            <YStack space="$3">
              <Text fontFamily="$ethiopicSerif" fontSize={12} fontWeight="800" color={theme.primary} opacity={0.8} textTransform="uppercase" letterSpacing={1}>
                {t('todaysFeast')}
              </Text>
              
               {feastSummary.major && (
                 <Text fontFamily="$ethiopicSerif" fontSize={22} fontWeight="900" color={theme.text} lineHeight={30}>
                   {t(feastSummary.major['am'] || feastSummary.major['en'] || '')}
                 </Text>
               )}
               {feastSummary.monthly && (
                 <Text fontFamily="$ethiopic" fontSize={16} color={theme.textSecondary} lineHeight={24} opacity={0.9}>
                   {t(feastSummary.monthly['am'] || feastSummary.monthly['en'] || '')}
                 </Text>
               )}
            </YStack>
          </Card>

          {/* 4. Recommendations Section */}
          <YStack space="$4" marginTop="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontFamily="$ethiopicSerif" fontSize={20} fontWeight="800" color={theme.text}>
                {t('todaysFeatured')}
              </Text>
              <Ionicons name="sparkles" size={18} color={theme.primary} opacity={0.5} />
            </XStack>

            <YStack space="$3">
              {recommendedHymns.map((hymn) => (
                <Button 
                  key={hymn.id}
                  padding="$0"
                  height={85}
                  backgroundColor={theme.cardBackground}
                  borderWidth={0.6}
                  borderColor={theme.borderColor}
                  borderRadius="$4"
                  pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  onPress={() => navigation.navigate('Detail', { mezmur: hymn })}
                >
                  <XStack f={1} alignItems="center" paddingHorizontal="$4" space="$4">
                    {/* Visual Marker */}
                    <YStack height={45} width={45} borderRadius={10} backgroundColor={theme.primary + '15'} alignItems="center" justifyContent="center">
                       <Ionicons name="musical-note" size={24} color={theme.primary} />
                    </YStack>

                    <YStack f={1} space="$1">
                      <Text fontFamily="$ethiopic" fontSize={17} fontWeight="700" color={theme.text} numberOfLines={1}>
                        {hymn.title}
                      </Text>
                      <Text fontFamily="$ethiopic" fontSize={13} color={theme.textSecondary} opacity={0.9} numberOfLines={1}>
                        {t(hymn.section)}
                      </Text>
                    </YStack>

                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} opacity={0.4} />
                  </XStack>
                </Button>
              ))}
            </YStack>
          </YStack>

          <Separator marginVertical="$4" opacity={0.1} />
          
           <Text textAlign="center" fontFamily="$body" fontSize={12} color={theme.textSecondary} opacity={0.6} marginBottom="$10">
             {t('version')} 1.0.0
           </Text>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

module.exports = TodayScreen;
