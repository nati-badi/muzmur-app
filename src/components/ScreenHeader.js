const React = require('react');
const { XStack, Text, Button, Circle, View } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { TouchableOpacity } = require('react-native');

/**
 * ScreenHeader - A standardized header for all screens.
 * 
 * @param {string} title - The title text to display (center-aligned).
 * @param {function} onBack - Optional. Function for the back button. If present, shows chevron-back.
 * @param {function} onMenu - Optional. Function for the menu button. If present, shows menu-outline.
 * @param {React.ReactNode} rightElement - Optional. Custom element to show on the right.
 * @param {object} theme - The theme object from useAppTheme().
 */
const ScreenHeader = ({ title, onBack, onMenu, rightElement, theme }) => {
    return (
        <XStack
            paddingHorizontal="$5"
            paddingVertical="$3"
            alignItems="center"
            justifyContent="center"
            zIndex={100}
        >
            {/* Left Action Button (Back or Menu) */}
            {(onBack || onMenu) && (
                <Button
                    position="absolute"
                    left="$4"
                    circular
                    size="$3"
                    backgroundColor="transparent"
                    icon={
                        <Ionicons
                            name={onBack ? "chevron-back" : "menu-outline"}
                            size={onBack ? 32 : 28}
                            color={theme.primary}
                        />
                    }
                    onPress={onBack || onMenu}
                    pressStyle={{ opacity: 0.6 }}
                />
            )}

            {/* Title */}
            <Text
                fontFamily="$ethiopicSerif"
                fontSize="$7"
                fontWeight="800"
                color={theme.primary}
                textAlign="center"
                numberOfLines={1}
                maxWidth="70%"
            >
                {title}
            </Text>

            {/* Right Action Element */}
            {rightElement && (
                <XStack position="absolute" right="$4">
                    {rightElement}
                </XStack>
            )}
        </XStack>
    );
};

module.exports = ScreenHeader;
