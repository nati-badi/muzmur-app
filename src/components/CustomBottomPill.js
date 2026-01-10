const React = require('react');
const { Ionicons } = require('@expo/vector-icons');
const { Text, XStack, YStack } = require('tamagui');
const { useSafeAreaInsets } = require('react-native-safe-area-context');

// Memoized Tab Item for maximum snappiness
const TabItem = React.memo(({ route, isFocused, onPress, label }) => {
  const color = isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.7)';
  
  let iconName;
  if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
  else if (route.name === 'Mezmurs') iconName = isFocused ? 'musical-notes' : 'musical-notes-outline';
  else if (route.name === 'Calendar') iconName = isFocused ? 'calendar-number' : 'calendar-number-outline';
  else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      onPress={onPress}
      pressStyle={{ opacity: 0.7, scale: 0.92 }}
    >
      <Ionicons name={iconName} size={22} color={color} />
      <Text
        fontFamily="$ethiopic"
        fontSize={10}
        fontWeight="700"
        color={color}
        marginTop={2}
        numberOfLines={1}
      >
        {label}
      </Text>
    </YStack>
  );
});

const CustomBottomPill = ({ state, descriptors, navigation, theme, t }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <XStack
      position="absolute"
      bottom={Math.max(insets.bottom, 15)}
      left={15}
      right={15}
      backgroundColor={theme.primary}
      borderRadius={25}
      height={65}
      elevation={10}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.4}
      shadowRadius={12}
      paddingHorizontal={10}
      alignItems="center"
      justifyContent="space-around"
      borderWidth={theme.id === 'midnight' ? 1 : 0}
      borderColor="rgba(255,255,255,0.15)"
      zIndex={1000}
    >
      {state.routes.map((route) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        // Correctly find the index in original state for focus tracking
        const originalIndex = state.routes.findIndex(r => r.key === route.key);
        const isFocused = state.index === originalIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem 
            key={route.key}
            route={route}
            isFocused={isFocused}
            onPress={onPress}
            label={label}
          />
        );
      })}
    </XStack>
  );
};

module.exports = CustomBottomPill;
