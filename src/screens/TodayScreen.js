const React = require('react');
const { useState, useMemo, useEffect } = React;
const { YStack, XStack, Text, Button, ScrollView, Card, Separator } = require('tamagui');
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
  const { user } = useAuth();

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || t('guest') || 'Guest';

  // 1. Get Today's Ethiopian Date
  const today = new Date();
  const ethDayObj = useMemo(() => toEthiopian(
    today.getFullYear(), 
    today.getMonth() + 1, 
    today.getDate()
  ), []);

  const { day, month, year } = ethDayObj;
  const monthName = language === 'am' ? ETHIOPIC_MONTHS[month - 1] : ETHIOPIC_MONTHS_EN[month - 1];
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
             {t('appTitle') || 'ቅዱስ ዜማ'}
           </Text>
           <Text fontFamily="$body" fontSize={11} color={theme.primary} opacity={0.6} textTransform="uppercase" letterSpacing={1}>
             {language === 'am' ? 'ሰላም ላንተ ይሁን' : 'Welcome back'}, {userDisplayName}
           </Text>
        </YStack>
        <Button 
          position="absolute"
          right="$4"
          circular 
          size="$3" 
          backgroundColor="transparent"
          icon={<Ionicons name="person-circle-outline" size={28} color={theme.primary} />}
          onPress={() => navigation.navigate('Profile')}
          pressStyle={{ opacity: 0.6 }}
        />
      </XStack>

      <ScrollView f={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$5" space="$5">
          
          {/* Quick Actions / Link Tiles */}
          <XStack space="$4" paddingBottom="$2">
             <Card 
               f={1} 
               height={120} 
               bordered 
               borderRadius="$4" 
               backgroundColor={theme.primary} 
               onPress={() => navigation.navigate('Favorites')}
               pressStyle={{ scale: 0.98, opacity: 0.9 }}
             >
                <YStack f={1} p="$3" jc="space-between">
                   <Ionicons name="heart" size={24} color="white" />
                   <YStack>
                     <Text fontFamily="$ethiopicSerif" color="white" fontWeight="800" fontSize="$4">{t('favorites')}</Text>
                     <Text color="white" opacity={0.8} fontSize="$1">{favoritesCount} {t('mezmurs')}</Text>
                   </YStack>
                </YStack>
             </Card>
             <Card 
               f={1} 
               height={120} 
               bordered 
               borderRadius="$4" 
               backgroundColor={theme.accent} 
               onPress={() => navigation.navigate('Mezmurs')}
               pressStyle={{ scale: 0.98, opacity: 0.9 }}
             >
                <YStack f={1} p="$3" jc="space-between">
                   <Ionicons name="compass" size={24} color={theme.primary} />
                   <YStack>
                     <Text fontFamily="$ethiopicSerif" color={theme.primary} fontWeight="800" fontSize="$4">Explore</Text>
                     <Text color={theme.primary} opacity={0.8} fontSize="$1">Categories</Text>
                   </YStack>
                </YStack>
             </Card>
          </XStack>

          {/* Recently Played Carousel */}
          {recentlyPlayed.length > 0 && (
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$ethiopicSerif" fontSize={18} fontWeight="800" color={theme.text}>
                  Recently Played
                </Text>
                <Button chromeless p="$0" onPress={() => navigation.navigate('Mezmurs')}>
                   <Text fontSize="$2" color={theme.primary}>See All</Text>
                </Button>
              </XStack>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                {recentlyPlayed.map((item) => (
                  <YStack 
                    key={item.id} 
                    width={140} 
                    marginRight="$4" 
                    onPress={() => navigation.navigate('Detail', { mezmur: item })}
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <YStack 
                      width={140} 
                      height={140} 
                      backgroundColor={theme.cardBackground} 
                      borderRadius="$6" 
                      bordered 
                      borderColor={theme.borderColor}
                      ai="center"
                      jc="center"
                      marginBottom="$2"
                      elevation="$2"
                    >
                      <Ionicons name="musical-note" size={60} color={theme.primary} opacity={0.15} />
                      <View position="absolute" bottom={10} right={10}>
                         <Circle size={30} backgroundColor={theme.primary}>
                            <Ionicons name="play" size={16} color="white" style={{marginLeft: 2}} />
                         </Circle>
                      </View>
                    </YStack>
                    <Text fontFamily="$ethiopic" fontSize={14} fontWeight="700" color={theme.text} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text fontFamily="$ethiopic" fontSize={11} color={theme.textSecondary} opacity={0.6} numberOfLines={1}>
                      {item.section}
                    </Text>
                  </YStack>
                ) )}
              </ScrollView>
            </YStack>
          )}
          
          {/* 2. Today's Date Card (Large & Premium) */}
          <YStack alignItems="center" space="$2" marginVertical="$4">
             <XStack space="$3" alignItems="center">
               <Text fontFamily="$ethiopicSerif" fontSize={64} fontWeight="900" color={theme.primary}>
                 {geezDay}
               </Text>
               <YStack>
                 <Text fontFamily="$ethiopic" fontSize={24} fontWeight="700" color={theme.text}>
                   {monthName}
                 </Text>
                 <Text fontFamily="$body" fontSize={16} color={theme.textSecondary} opacity={0.6}>
                   {year} ዓ.ም
                 </Text>
               </YStack>
             </XStack>
          </YStack>

          {/* 3. Daily Feast/Commemoration Card */}
          <Card 
            elevate 
            bordered 
            padding="$5" 
            borderRadius="$6" 
            backgroundColor={theme.cardBackground}
            borderColor={theme.primary}
            borderWidth={0.5}
          >
            <XStack space="$3" alignItems="center" marginBottom="$3">
               <Ionicons name="bookmark" size={20} color={theme.primary} />
               <Text fontFamily="$ethiopicSerif" fontSize={14} fontWeight="700" color={theme.primary} textTransform="uppercase">
                 {language === 'am' ? 'የዕለቱ መታሰቢያ' : "TODAY'S FEAST"}
               </Text>
            </XStack>
            
            <YStack space="$2">
              {feastSummary.major && (
                <Text fontFamily="$ethiopic" fontSize={20} fontWeight="800" color={theme.primary}>
                  {feastSummary.major.am}
                </Text>
              )}
              {feastSummary.monthly && (
                <Text fontFamily="$ethiopic" fontSize={16} color={theme.text} lineHeight={24}>
                  {feastSummary.monthly.am}
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
                  bordered
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
                      <Text fontFamily="$ethiopic" fontSize={13} color={theme.textSecondary} opacity={0.6} numberOfLines={1}>
                        {hymn.section}
                      </Text>
                    </YStack>

                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} opacity={0.4} />
                  </XStack>
                </Button>
              ))}
            </YStack>
          </YStack>

          <Separator marginVertical="$4" opacity={0.1} />
          
          <Text textAlign="center" fontFamily="$body" fontSize={12} color={theme.textSecondary} opacity={0.4} marginBottom="$10">
            {t('appVersion')} 1.0.0
          </Text>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

module.exports = TodayScreen;
