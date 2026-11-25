const React = require('react');
const { XStack, Input, Button } = require('tamagui');
const { Ionicons } = require('../utils/icons');
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
      backgroundColor={theme.primary + '10'}
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
