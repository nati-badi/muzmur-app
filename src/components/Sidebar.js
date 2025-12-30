const React = require('react');
const { YStack, Text, Button, XStack } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { DrawerContentScrollView } = require('@react-navigation/drawer');
const { COLORS } = require('../constants/theme');

const Sidebar = (props) => {
  const menuItems = [
    { id: 1, label: 'ቤት (Home)', icon: 'home-outline', screen: 'Home' },
    { id: 2, label: 'ተወዳጆች (Favorites)', icon: 'heart-outline', screen: 'Favorites' },
  ];

  return (
    <YStack f={1} backgroundColor="$background">
      <DrawerContentScrollView {...props}>
        <YStack padding="$4" space="$4">
          <Text fontFamily="$ethiopicSerif" fontSize="$6" fontWeight="800" color="$primary" marginBottom="$4">
            ማውጫ
          </Text>
          
          {menuItems.map((item) => (
            <Button
              key={item.id}
              chromeless
              onPress={() => props.navigation.navigate(item.screen)}
              paddingVertical="$3"
              justifyContent="flex-start"
            >
              <XStack space="$3" alignItems="center">
                <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                <Text fontFamily="$ethiopicSerif" fontSize="$4" color="$color" fontWeight="600">
                  {item.label}
                </Text>
              </XStack>
            </Button>
          ))}
        </YStack>
      </DrawerContentScrollView>
    </YStack>
  );
};

module.exports = Sidebar;
