const React = require('react');
const { memo } = React;
const { YStack, XStack, Text, Button } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { useLanguage } = require('../context/LanguageContext');

const MezmurListCard = memo(({ item, isFavorite, onToggleFavorite, onPress, getStatusColor, theme }) => {
  const { t } = useLanguage();
  const getCategory = (lyrics = '') => {
    if (!lyrics) return 'አጭር';
    const lineCount = lyrics.split('\n').length;
    return lineCount > 8 ? 'ረጅም' : 'አጭር';
  };

  const calculatedCategory = item.category || getCategory(item.lyrics);
  const statusColor = getStatusColor(calculatedCategory);

  // Truncate lyrics for preview (first 2 lines)
  const lyricsPreview = item.lyrics 
    ? item.lyrics.split('\n').slice(0, 2).join('\n') 
    : '';

  return (
    <YStack 
      backgroundColor={theme.cardBackground}
      borderRadius="$3"
      marginBottom="$3"
      onPress={() => onPress(item)}
      pressStyle={{ opacity: 0.95, scale: 0.98 }}
      elevation="$2"
      overflow="hidden"
      position="relative"
    >
      {/* Left Accent Stripe */}
      <YStack 
        position="absolute" 
        left={0} 
        top={0} 
        bottom={0} 
        width={6} 
        backgroundColor={statusColor} 
      />

      {/* Watermark Icon */}
      <YStack position="absolute" right={-10} bottom={-15} opacity={0.05} rotate="-15deg">
        <Ionicons name="musical-note" size={120} color={theme.primary} />
      </YStack>

      <XStack padding="$4" paddingLeft="$5" justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} space="$2">
           {/* Top Metadata Row */}
            <XStack alignItems="center" space="$2" marginBottom="$1">
              <Text 
                fontFamily="$body" 
                fontSize="$1" 
                color={theme.textSecondary} 
                opacity={0.5}
                letterSpacing={1}
              >
                MEZMUR #{item.id}
              </Text>
              {/* Refined Badge: Just Text, No "Circle/Pill" */}
              <YStack 
                opacity={0.7}
              >
                 <Text 
                  fontFamily="$body" 
                  fontSize="$1" 
                  color={statusColor}
                  fontWeight="700"
                  letterSpacing={0.5}
                  textTransform="uppercase"
                >
                  {t(calculatedCategory)}
                </Text>
              </YStack>
           </XStack>
          
          {/* Title */}
          <Text 
             fontFamily="$ethiopic" 
             fontSize="$6" 
             fontWeight="800" 
             color={theme.text} 
             numberOfLines={1}
             marginBottom="$1"
           >
             {item.title}
           </Text>

           {/* Lyric Preview (Serif for Songbook feel) */}
           <Text 
             fontFamily="$ethiopicSerif" 
             fontSize="$4" 
             color={theme.textSecondary} 
             numberOfLines={2} 
             lineHeight={24}
             opacity={0.7}
             fontStyle="italic"
           >
             "{lyricsPreview}..."
           </Text>
           
           {/* Localized Section Subtitle */}
           <Text 
             fontFamily="$ethiopic" 
             fontSize={12} 
             color={theme.textSecondary} 
             opacity={0.8}
             marginTop="$1"
           >
             {t(item.section)}
           </Text>
        </YStack>

        {/* Floating Heart */}
        <Button 
          circular
          size="$3"
          backgroundColor={theme.cardBackground}
          elevation="$1"
          borderColor={theme.borderColor}
          borderWidth={0.5}
          icon={<Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={18} 
            color={isFavorite ? theme.error : theme.textSecondary} 
          />}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          pressStyle={{ scale: 0.9 }}
        />
      </XStack>
    </YStack>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.theme === nextProps.theme
  );
});

module.exports = MezmurListCard;
