const React = require('react');
const { XStack, Input, Button, Circle } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');

/**
 * Premium unified search bar component.
 * 
 * @param {Object} props
 * @param {string} props.value - Current search text
 * @param {function} props.onChangeText - Handler for text changes
 * @param {function} props.onSubmitEditing - Handler for submit
 * @param {function} props.onFocus - Handler for focus
 * @param {function} props.onClear - Handler for clearing text
 * @param {string} props.placeholder - Placeholder text
 * @param {function} [props.onLayout] - Optional layout handler for positioning dropdowns
 */
const SearchBar = ({ 
  value, 
  onChangeText, 
  onSubmitEditing, 
  onFocus, 
  onClear, 
  placeholder,
  onLayout,
  ...props 
}) => {
  const { theme } = useAppTheme();

  return (
    <XStack 
      backgroundColor="#2C3E50" // Use a dark slate fill as per the user's "dark mode" image request, or fallback to theme.
      // However, to respect "no theme changes" but match image, we might need to be smart.
      // The user said "look like this image". The image is dark.
      // If the app is light mode, a dark bar might look weird. 
      // BUT, if I use theme.primary with low opacity, it will be light.
      // Let's use a subtle dark fill that works on light backgrounds too, or just theme.primary + opacity.
      // Actually, looking at the image again, it's a solid dark bar.
      // Let's try to match the "filled" look using the theme's swatches if possible, or a standard neutral.
      // For now, I will use a solid background color that contrasts nicely.
      // Since I can't change the theme object, I'll use a hardcoded style that looks good, 
      // or derive it.
      // Let's go with a transparent darker fill on light themes: 'rgba(0,0,0,0.05)'
      // Wait, the user specifically said "look like this image". The image IS dark. 
      // If the user is running the app in "classic" (light) mode, a dark bar is "change my theme".
      // I will assume the user wants the SHAPE and STYLE (filled), not necessarily the exact dark blue color if the app is white.
      // I will use `theme.primary` with 10% opacity for the background to keep it consistent but "filled".
      backgroundColor={theme.primary + '10'} // 10% opacity of primary for a subtle filled look
      borderRadius={50} // Pill shape
      borderWidth={0} // No border
      paddingHorizontal="$4" 
      height={50} 
      alignItems="center"
      onLayout={onLayout}
      {...props}
    >
      <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
      <Input 
        f={1}
        placeholder={placeholder}
        fontFamily="$body"
        fontSize="$4"
        backgroundColor="transparent"
        borderWidth={0}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        placeholderTextColor={theme.textSecondary + '90'}
        color={theme.text}
      />
      {value.length > 0 && (
        <Button 
          circular 
          chromeless 
          size="$2" 
          icon={<Ionicons name="close" size={20} color={theme.textSecondary} />} 
          onPress={onClear}
        />
      )}
    </XStack>
  );
};

module.exports = SearchBar;
