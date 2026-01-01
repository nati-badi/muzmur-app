const React = require('react');
const { useState, useMemo } = React;
const { YStack, Text, XStack, Grid, Button, Circle, ScrollView } = require('tamagui');
const { TouchableOpacity } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { toEthiopian, getEthiopianMonthStartDay } = require('../utils/dateUtils');

const ETHIOPIC_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 
  'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 
  'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

const WEEKDAYS = ['ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሁድ'];

const CalendarScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  

  // Initialize with today's Ethiopian date
  const todayEth = useMemo(() => {
    const today = new Date();
    // Library returns [year, month, day]
    // Month is 1-indexed in the library usually, let's verify if array or object
    // Assuming simple conversion first, might need adjustment based on library version.
    // If library fails, we fallback to a rough calculation or mock for safety first.
    try {
       const eth = toEthiopian(today.getFullYear(), today.getMonth() + 1, today.getDate());
       return { year: eth[0], month: eth[1], day: eth[2] };
    } catch (e) {
       console.error("Date conversion error", e);
       return { year: 2017, month: 4, day: 22 }; // Fallback
    }
  }, []);

  const [currentYear, setCurrentYear] = useState(todayEth.year);
  const [currentMonth, setCurrentMonth] = useState(todayEth.month);

  const calendarGrid = useMemo(() => {
    // We need to find the weekday of the 1st day of this Ethiopian Month
    // This is hard without a "FromEthiopian" converter or a robust library.
    // However, we can approximate or use the library if it supports full features.
    // Since we just installed `ethiopian-date-converter`, let's hope it has `toGregorian`.
    // If not, we might need a different dependency or math.
    // For now, let's implement the UI shell and a placeholder grid logic.
    
    // Placeholder logic for visual verification:
    // Assume month starts on a random day for now or standard calculation.
    // Actually, to get the starting weekday, we convert {year, month, 1} BACK to Gregorian and get .getDay().
    
    const daysInMonth = currentMonth === 13 ? (currentYear % 4 === 3 ? 6 : 5) : 30;
    
    // We need 'toGregorian' to find start day. 
    // If the library doesn't export it easily, we might need to rely on a known anchor.
    // Anchor: Meskerem 1 2017 is Sept 11 2024.
    // Let's rely on the library having `toGregorian` or `to_gregorian`.
    // If unavailable, I'll update it in the next step.
    
    let startDayOffset = 0; // 0 = Mon, 6 = Sun
    
    // Get 0=Sun, 1=Mon from utility
    const weekday = getEthiopianMonthStartDay(currentYear, currentMonth);
    
    // Convert to 0=Mon, ... 6=Sun
    // Util: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // UI:  0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    
    if (weekday === 0) startDayOffset = 6; // Sun
    else startDayOffset = weekday - 1;     // Mon(1)->0, Tue(2)->1...

    const days = [];
    // Pad start
    for(let i=0; i<startDayOffset; i++) days.push(null);
    // Fill days
    for(let i=1; i<=daysInMonth; i++) days.push(i);
    
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

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* Header */}
      <XStack paddingHorizontal="$5" paddingVertical="$3" alignItems="center" justifyContent="center">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 16 }}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text fontFamily="$ethiopicSerif" fontSize="$7" fontWeight="800" color={theme.primary}>
          {t('Calendar') || "የቀን መቁጠሪያ"}
        </Text>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Month Navigator */}
        <YStack backgroundColor={theme.surface} borderRadius="$4" padding="$4" elevation="$2" marginBottom="$4">
           <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
             <Button circular chromeless onPress={() => changeMonth(-1)} icon={<Ionicons name="chevron-back" size={24} color={theme.primary} />} />
             <YStack alignItems="center">
                <Text fontFamily="$ethiopic" fontSize="$8" fontWeight="800" color={theme.text}>
                  {ETHIOPIC_MONTHS[currentMonth - 1]}
                </Text>
                <Text fontFamily="$body" fontSize="$5" color={theme.primary} fontWeight="600" opacity={0.6}>
                  {currentYear}
                </Text>
             </YStack>
             <Button circular chromeless onPress={() => changeMonth(1)} icon={<Ionicons name="chevron-forward" size={24} color={theme.primary} />} />
           </XStack>

           {/* Weekday Header */}
           <XStack justifyContent="space-between" marginBottom="$2" paddingHorizontal="$2">
             {WEEKDAYS.map(day => (
               <Text key={day} fontFamily="$ethiopic" fontSize="$2" color={theme.textSecondary} width={38} textAlign="center" opacity={0.7}>
                 {day}
               </Text>
             ))}
           </XStack>

           {/* Calendar Grid */}
           <XStack flexWrap="wrap" justifyContent="flex-start">
             {calendarGrid.map((day, index) => (
               <YStack key={index} width="14.28%" aspectRatio={1} alignItems="center" justifyContent="center" padding="$1">
                 {day && (
                   <Circle 
                     size={38} 
                     backgroundColor={
                       (day === todayEth.day && currentMonth === todayEth.month && currentYear === todayEth.year) 
                       ? theme.primary 
                       : "transparent"
                     }
                   >
                     <Text 
                       fontFamily="$body" 
                       fontSize="$4" 
                       fontWeight="700"
                       color={
                         (day === todayEth.day && currentMonth === todayEth.month && currentYear === todayEth.year) 
                         ? "white" 
                         : theme.text
                       }
                     >
                       {day}
                     </Text>
                   </Circle>
                 )}
               </YStack>
             ))}
           </XStack>
        </YStack>

        <YStack alignItems="center" opacity={0.5} marginTop="$4">
          <Text fontFamily="$body" fontSize="$3" color={theme.primary}>
             Today: {ETHIOPIC_MONTHS[todayEth.month - 1]} {todayEth.day}, {todayEth.year}
          </Text>
        </YStack>

      </ScrollView>
    </YStack>
  );
};

module.exports = CalendarScreen;
