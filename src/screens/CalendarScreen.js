const React = require('react');
const { useState, useMemo, useEffect } = React;
const { YStack, Text, XStack, Button, Circle, ScrollView, Card, SizableText } = require('tamagui');
const { TouchableOpacity } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { toEthiopian, getEthiopianMonthStartDay, toGeez, ETHIOPIC_MONTHS } = require('../utils/dateUtils');
const { getFeastForDate } = require('../utils/holidayData');

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CalendarScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t, language } = useLanguage();

  // Initialize with today's Ethiopian date
  const todayEth = useMemo(() => {
    const today = new Date();
    try {
       const eth = toEthiopian(today.getFullYear(), today.getMonth() + 1, today.getDate());
       return { year: eth.year, month: eth.month, day: eth.day };
    } catch (e) {
       console.error("Date conversion error", e);
       return { year: 2017, month: 4, day: 22 }; 
    }
  }, []);

  const [currentYear, setCurrentYear] = useState(todayEth.year);
  const [currentMonth, setCurrentMonth] = useState(todayEth.month);
  
  // Selected date state
  const [selectedEthDate, setSelectedEthDate] = useState(todayEth);

  const calendarGrid = useMemo(() => {
    const daysInMonth = currentMonth === 13 ? (currentYear % 4 === 3 ? 6 : 5) : 30;
    const weekday = getEthiopianMonthStartDay(currentYear, currentMonth);
    let startDayOffset = weekday === 0 ? 6 : weekday - 1;

    const days = [];
    for(let i=0; i<startDayOffset; i++) days.push(null);
    for(let i=1; i<=daysInMonth; i++) {
        days.push({
            ethDay: i,
            geezDay: toGeez(i)
        });
    }
    return days;
  }, [currentYear, currentMonth]);

  const changeMonth = (delta) => {
    let newM = currentMonth + delta;
    let newY = currentYear;
    if (newM > 13) { newM = 1; newY++; }
    else if (newM < 1) { newM = 13; newY--; }
    setCurrentMonth(newM);
    setCurrentYear(newY);
  };

  const jumpToToday = () => {
    setCurrentMonth(todayEth.month);
    setCurrentYear(todayEth.year);
    setSelectedEthDate(todayEth);
  };
  
  const handleDayPress = (day) => {
      setSelectedEthDate({ year: currentYear, month: currentMonth, day });
  };

  // Get Feast Info for Selected Date
  const feastInfo = useMemo(() => {
     return getFeastForDate(selectedEthDate.month, selectedEthDate.day);
  }, [selectedEthDate]);

  // Helper to get localized feast text
  const getFeastText = (item) => {
      if (!item) return "";
       // Always use Amharic key for translation lookup
       const rawText = item['am'] || item['en'] || "";
       return t(rawText);
   };

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* Header */}
      <XStack paddingHorizontal="$5" paddingVertical="$3" alignItems="center" justifyContent="center">
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
        <Text fontFamily="$ethiopicSerif" fontSize="$7" fontWeight="800" color={theme.primary}>
          {t('calendar')}
        </Text>
        <TouchableOpacity onPress={jumpToToday} style={{ position: 'absolute', right: 16 }}>
           <XStack backgroundColor={theme.surface} paddingHorizontal="$3" paddingVertical="$1.8" borderRadius="$10" borderWidth={1.5} borderColor={theme.primary} alignItems="center" elevation={3}>
             <Text fontFamily="$ethiopic" fontSize="$3" color={theme.primary} fontWeight="800">{t('todayLabel')}</Text>
           </XStack>
        </TouchableOpacity>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Month Navigator */}
        <YStack backgroundColor={theme.surface} borderRadius="$4" padding="$4" elevation="$2" marginBottom="$4" borderWidth={1} borderColor={theme.borderColor}>
           <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
             <Button circular size="$4" backgroundColor="transparent" onPress={() => changeMonth(-1)} icon={<Ionicons name="chevron-back" size={24} color={theme.primary} />} />
             
             <YStack alignItems="center">
                <Text fontFamily="$ethiopic" fontSize="$8" fontWeight="800" color={theme.text}>
                  {t(`month${currentMonth}`)} <Text fontSize="$6" color={theme.primary} fontWeight="700">{currentYear}</Text>
                </Text>
             </YStack>
             
             <Button circular size="$4" backgroundColor="transparent" onPress={() => changeMonth(1)} icon={<Ionicons name="chevron-forward" size={24} color={theme.primary} />} />
           </XStack>

           {/* Integrated Full Grid Structure */}
           <YStack borderWidth={1} borderColor={theme.borderColor} borderRadius="$4" overflow="hidden">
             {/* Weekdays Row */}
             <XStack backgroundColor={`${theme.primary}05`} borderBottomWidth={1} borderBottomColor={theme.borderColor}>
               {WEEKDAYS.map((day, i) => (
                 <YStack 
                   key={day} 
                   width="14.28%" 
                   paddingVertical="$2.5" 
                   ai="center" 
                   jc="center"
                   borderRightWidth={i < 6 ? 1 : 0}
                   borderRightColor={theme.borderColor}
                 >
                   <Text fontFamily="$ethiopic" fontSize="$2" fontWeight="900" color={theme.primary} opacity={0.9}>
                     {t(day).substring(0, 3)}
                   </Text>
                 </YStack>
               ))}
             </XStack>

             {/* Days Grid */}
             <XStack flexWrap="wrap">
               {calendarGrid.map((item, index) => {
                 const isLastInRow = (index + 1) % 7 === 0;
                 const isLastRow = index >= calendarGrid.length - 7;
                 
                 if (!item) {
                   return (
                     <YStack 
                       key={`empty-${index}`} 
                       width="14.28%" 
                       height={60}
                       borderRightWidth={isLastInRow ? 0 : 1}
                       borderRightColor={theme.borderColor}
                       borderBottomWidth={isLastRow ? 0 : 1}
                       borderBottomColor={theme.borderColor}
                       backgroundColor={`${theme.background}30`}
                     />
                   );
                 }

                 const isToday = todayEth.year === currentYear && todayEth.month === currentMonth && todayEth.day === item.ethDay;
                 const isSelected = selectedEthDate.year === currentYear && selectedEthDate.month === currentMonth && selectedEthDate.day === item.ethDay;

                 return (
                   <YStack 
                     key={`day-${item.ethDay}`} 
                     width="14.28%" 
                     height={60}
                     borderRightWidth={isLastInRow ? 0 : 1}
                     borderRightColor={theme.borderColor}
                     borderBottomWidth={isLastRow ? 0 : 1}
                     borderBottomColor={theme.borderColor}
                   >
                     <TouchableOpacity 
                       onPress={() => handleDayPress(item.ethDay)}
                       style={{ flex: 1 }}
                     >
                       <YStack 
                         f={1} 
                         ai="center" 
                         jc="center"
                         borderRadius="$3"
                         backgroundColor={isSelected ? theme.primary : (isToday ? `${theme.primary}12` : "transparent")}
                         borderWidth={isToday ? 1.5 : 0}
                         borderColor={theme.primary}
                         elevation={isSelected ? 4 : 0}
                       >
                         <Text 
                           fontFamily="$body" 
                           fontSize="$4" 
                           fontWeight="800"
                           color={isSelected ? "white" : (isToday ? theme.primary : theme.text)}
                         >
                           {language === 'am' || language === 'ti' ? toGeez(item.ethDay) : item.ethDay}
                         </Text>
                         {(language === 'am' || language === 'ti') && (
                           <Text 
                             fontFamily="$ethiopic"
                             fontSize={9}
                             color={isSelected ? "white" : theme.textSecondary}
                             opacity={isSelected ? 1 : 0.7}
                             fontWeight="600"
                             marginTop={-2}
                           >
                             {item.ethDay}
                           </Text>
                         )}
                       </YStack>
                     </TouchableOpacity>
                   </YStack>
                 );
               })}
             </XStack>
           </YStack>
        </YStack>
        
        {/* Feast/Holiday Info Card */}
        <YStack backgroundColor={theme.surface} borderRadius="$4" padding="$4" elevation="$2" borderWidth={1} borderColor={theme.borderColor} marginBottom="$4">
             <XStack alignItems="center" marginBottom="$3">
                <Ionicons name="book-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                <Text fontFamily="$ethiopic" fontSize="$5" fontWeight="700" color={theme.text}>
                   {t(`month${selectedEthDate.month}`)} {language === 'am' || language === 'ti' ? toGeez(selectedEthDate.day) : selectedEthDate.day}
                </Text>
             </XStack>

             {/* Modern Divider */}
             <YStack height={1} backgroundColor={theme.borderColor} opacity={1} width="100%" marginBottom="$3" />
             
             {feastInfo.major ? (
                  <YStack backgroundColor={`${theme.primary}12`} padding="$3" borderRadius="$3" marginBottom="$2" borderLeftWidth={4} borderLeftColor={theme.primary}>
                      <Text fontFamily="$ethiopicSerif" fontSize="$3" fontWeight="900" color={theme.primary} textTransform="uppercase" letterSpacing={1} marginBottom="$1">
                          {t('annualFeast')}
                      </Text>
                      <Text fontFamily="$ethiopic" fontSize="$5" fontWeight="800" color={theme.text} marginTop="$1">
                          {getFeastText(feastInfo.major)}
                      </Text>
                  </YStack>
             ) : null}
             
             <YStack marginTop="$1">
                <Text fontFamily="$body" fontSize="$3" color={theme.textSecondary} fontWeight="600" marginBottom="$1">
                    {t('monthlyFeast')}:
                </Text>
                <Text fontFamily="$body" fontSize="$4" color={theme.text} lineHeight={22} fontWeight="700">
                    {getFeastText(feastInfo.monthly) || t('noFeastToday')}
                </Text>

                {/* Enriched Details/Meaning Section */}
                {(feastInfo.major?.details?.['am'] || feastInfo.monthly?.details?.['am']) && (
                  <YStack 
                    marginTop="$3" 
                    padding="$3" 
                    backgroundColor={`${theme.accent}15`} 
                    borderRadius="$3"
                    space="$2"
                  >
                    <XStack ai="center" space="$2">
                       <Ionicons name="information-circle" size={16} color={theme.primary} />
                       <Text fontFamily="$ethiopicSerif" fontSize="$2" fontWeight="800" color={theme.primary} textTransform="uppercase">
                          {t('feastSecret')}
                       </Text>
                    </XStack>
                     <Text fontFamily="$body" fontSize="$3" color={theme.text} lineHeight={20} fontWeight="600">
                        {t(feastInfo.major?.details?.['am'] || feastInfo.monthly?.details?.['am'])}
                     </Text>
                  </YStack>
                )}
             </YStack>
        </YStack>


      </ScrollView>
    </YStack>
  );
};

module.exports = CalendarScreen;
