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

const WEEKDAYS = ['ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሁድ'];

const CalendarScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage(); // Only using t for generic nav title if needed, or ignoring

  // Force Amharic for Calendar Content
  const langCode = 'am';

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
    setCurrentYear(todayEth.year);
    setCurrentMonth(todayEth.month);
    setSelectedEthDate(todayEth);
  };
  
  const handleDayPress = (day) => {
      setSelectedEthDate({ year: currentYear, month: currentMonth, day });
  };

  // Get Feast Info for Selected Date
  const feastInfo = useMemo(() => {
     return getFeastForDate(selectedEthDate.month, selectedEthDate.day);
  }, [selectedEthDate]);

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* Header */}
      <XStack paddingHorizontal="$5" paddingVertical="$3" alignItems="center" justifyContent="center">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 16, zIndex: 10 }}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text fontFamily="$ethiopicSerif" fontSize="$7" fontWeight="800" color={theme.primary}>
          {t('Calendar') || "የቀን መቁጠሪያ"}
        </Text>
        <TouchableOpacity onPress={jumpToToday} style={{ position: 'absolute', right: 16 }}>
           <XStack backgroundColor={theme.surface} paddingHorizontal="$3" paddingVertical="$1.5" borderRadius="$10" borderWidth={1} borderColor={theme.borderColor} alignItems="center" shadowColor="black" shadowOpacity={0.05} shadowRadius={2} elevation={1}>
             <Text fontFamily="$ethiopic" fontSize="$3" color={theme.primary} fontWeight="700">ዛሬ</Text>
           </XStack>
        </TouchableOpacity>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Month Navigator */}
        <YStack backgroundColor={theme.surface} borderRadius="$4" padding="$4" elevation="$2" marginBottom="$4" borderWidth={1} borderColor={theme.borderColor}>
           <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
             <Button circular size="$4" backgroundColor="transparent" onPress={() => changeMonth(-1)} icon={<Ionicons name="chevron-back" size={24} color={theme.primary} />} />
             
             <YStack alignItems="center">
                <Text fontFamily="$ethiopic" fontSize="$8" fontWeight="800" color={theme.text}>
                  {ETHIOPIC_MONTHS[currentMonth - 1] || "Month"} <Text fontSize="$6" opacity={0.6}>{currentYear}</Text>
                </Text>
             </YStack>
             
             <Button circular size="$4" backgroundColor="transparent" onPress={() => changeMonth(1)} icon={<Ionicons name="chevron-forward" size={24} color={theme.primary} />} />
           </XStack>

           {/* Weekday Header */}
           <XStack justifyContent="space-between" marginBottom="$2" paddingHorizontal="$2">
             {WEEKDAYS.map(day => (
               <Text key={day} fontFamily="$ethiopic" fontSize="$3" color={theme.primary} width={38} textAlign="center" fontWeight="700">
                 {day}
               </Text>
             ))}
           </XStack>

           {/* Calendar Grid */}
           <XStack flexWrap="wrap" justifyContent="flex-start">
             {calendarGrid.map((item, index) => {
               if(!item) return <YStack key={index} width="14.28%" aspectRatio={0.85} />;
               
               const isSelected = item.ethDay === selectedEthDate.day && currentMonth === selectedEthDate.month && currentYear === selectedEthDate.year;
               const isToday = item.ethDay === todayEth.day && currentMonth === todayEth.month && currentYear === todayEth.year;

               return (
               <YStack key={index} width="14.28%" aspectRatio={0.85} alignItems="center" justifyContent="center" padding="$1">
                   <TouchableOpacity onPress={() => handleDayPress(item.ethDay)} style={{ width: '100%', height: '100%' }}>
                   <YStack 
                     width="100%" 
                     height="100%"
                     alignItems="center" 
                     justifyContent="center"
                     borderRadius="$3"
                     backgroundColor={
                       isSelected ? theme.primary : (isToday ? `${theme.primary}15` : "transparent")
                     }
                     borderWidth={isToday ? 1.5 : 0}
                     borderColor={theme.primary}
                   >
                     <Text 
                       fontFamily="$body" 
                       fontSize="$5" 
                       fontWeight="700"
                       lineHeight={24}
                       color={isSelected ? "white" : (isToday ? theme.primary : theme.text)}
                     >
                       {item.ethDay}
                     </Text>
                     <Text 
                       fontFamily="$ethiopic"
                       fontSize={12}
                       color={isSelected ? "white" : theme.textSecondary}
                       opacity={isSelected ? 0.9 : 0.6}
                       fontWeight="600"
                     >
                       {item.geezDay}
                     </Text>
                   </YStack>
                   </TouchableOpacity>
               </YStack>
             )})}
           </XStack>
        </YStack>
        
        {/* Feast/Holiday Info Card */}
        <YStack backgroundColor={theme.surface} borderRadius="$4" padding="$4" elevation="$2" borderWidth={1} borderColor={theme.borderColor} marginBottom="$4">
             <XStack alignItems="center" marginBottom="$3">
                <Ionicons name="book-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                <Text fontFamily="$ethiopic" fontSize="$5" fontWeight="700" color={theme.text}>
                   {ETHIOPIC_MONTHS[selectedEthDate.month - 1]} {selectedEthDate.day}
                </Text>
             </XStack>

             {/* Modern Divider */}
             <YStack height={1} backgroundColor={theme.borderColor} opacity={0.5} width="100%" marginBottom="$3" />
             
             {feastInfo.major ? (
                 <YStack backgroundColor={`${theme.primary}10`} padding="$3" borderRadius="$3" marginBottom="$2" borderLeftWidth={4} borderLeftColor={theme.primary}>
                     <Text fontFamily="$body" fontSize="$4" fontWeight="800" color={theme.primary}>
                         ዓመታዊ በዓል
                     </Text>
                     <Text fontFamily="$body" fontSize="$4" color={theme.text} marginTop="$1">
                         {feastInfo.major.am || feastInfo.major.en}
                     </Text>
                 </YStack>
             ) : null}
             
             <YStack marginTop="$1">
                <Text fontFamily="$body" fontSize="$3" color={theme.textSecondary} fontWeight="600" marginBottom="$1">
                    የዕለቱ መታሰቢያ:
                </Text>
                <Text fontFamily="$body" fontSize="$4" color={theme.text} lineHeight={22}>
                    {(feastInfo.monthly && (feastInfo.monthly.am || feastInfo.monthly.en)) || "የተመዘገበ በዓል የለም"}
                </Text>
             </YStack>
        </YStack>


      </ScrollView>
    </YStack>
  );
};

module.exports = CalendarScreen;
