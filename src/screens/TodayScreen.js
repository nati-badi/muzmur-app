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

const TodayScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t, language } = useLanguage();

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
        <Text fontFamily="$ethiopicSerif" fontSize={24} fontWeight="800" color={theme.primary}>
          {t('today')}
        </Text>
      </XStack>

      <ScrollView f={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$5" space="$5">
          
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
