const React = require('react');
const { useMemo } = React;
const { FlatList, TouchableOpacity, StyleSheet } = require('react-native');
const { YStack, XStack, Text, Button, Circle, Separator, View } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const ScreenHeader = require('../components/ScreenHeader');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { usePlaylists } = require('../context/PlaylistContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAppTheme } = require('../context/ThemeContext');
const { useAudio } = require('../context/GlobalAudioState.js');
const DataService = require('../services/DataService');
const MezmurListCard = require('../components/MezmurListCard');

const PlaylistDetailScreen = ({ route, navigation }) => {
  const { playlistId } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { playlists, removeFromPlaylist, reorderPlaylist } = usePlaylists();
  const { playPlaylist } = useAudio();

  const playlist = useMemo(() =>
    playlists.find(p => p.id === playlistId),
    [playlists, playlistId]);

  const hymns = useMemo(() => {
    if (!playlist) return [];
    return playlist.items
      .map(id => DataService.getAll().find(m => String(m.id) === String(id)))
      .filter(Boolean);
  }, [playlist]);

  if (!playlist) {
    return (
      <YStack f={1} backgroundColor={theme.background} justifyContent="center" alignItems="center">
        <Text color={theme.textSecondary}>Playlist not found</Text>
        <Button onPress={() => navigation.goBack()}>
          <Text color="white">{t('back')}</Text>
        </Button>
      </YStack>
    );
  }

  const handlePlayAll = () => {
    playPlaylist(playlist, 0);
    navigation.navigate('HymnPlayer');
  };

  const handleItemPress = (item) => {
    navigation.navigate('Detail', { mezmur: item });
  };

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      {/* Header */}
      <ScreenHeader
        title={t('playlist')}
        onBack={() => navigation.goBack()}
        theme={theme}
      />

      <FlatList
        data={hymns}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <YStack paddingVertical="$5" space="$5">
            <XStack space="$4" alignItems="center">
              <Circle size={110} backgroundColor={`${theme.primary}10`} borderWidth={1} borderColor={`${theme.primary}20`}>
                <Ionicons name="musical-notes" size={54} color={theme.primary} />
              </Circle>
              <YStack f={1} space="$1">
                <Text fontFamily="$ethiopicSerif" fontSize="$9" fontWeight="900" color={theme.text} lineHeight="$9">
                  {playlist.name}
                </Text>
                <XStack ai="center" space="$2">
                  <Ionicons name="layers-outline" size={14} color={theme.textSecondary} opacity={0.6} />
                  <Text fontFamily="$body" fontSize="$3" color={theme.textSecondary} opacity={0.8} fontWeight="600">
                    {hymns.length} {t('items')}
                  </Text>
                </XStack>
              </YStack>
            </XStack>

            <Button
              backgroundColor={theme.primary}
              onPress={handlePlayAll}
              disabled={hymns.length === 0}
              height={56}
              borderRadius="$4"
              icon={<Ionicons name="play" size={24} color="white" />}
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
              elevation="$2"
            >
              <Text color="white" fontWeight="800" fontSize="$5" letterSpacing={0.5}>
                {t('playAll').toUpperCase()}
              </Text>
            </Button>

            <Separator borderColor={theme.borderColor} opacity={0.2} />
          </YStack>
        )}
        renderItem={({ item, index }) => (
          <MezmurListCard
            item={item}
            onPress={() => handleItemPress(item)}
            theme={theme}
            getStatusColor={(type) => type === 'LONG_FILTER' ? theme.error : theme.success}
            rightAction={
              <TouchableOpacity
                onPress={() => removeFromPlaylist(playlistId, item.id)}
                style={{ padding: 10 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="remove-circle-outline" size={24} color={theme.error} opacity={0.8} />
              </TouchableOpacity>
            }
          />
        )}
        ListEmptyComponent={() => (
          <YStack mt="$12" alignItems="center" space="$3" opacity={0.5}>
            <Ionicons name="musical-notes-outline" size={60} color={theme.textSecondary} />
            <Text color={theme.textSecondary} fontSize="$4" fontWeight="600">
              {t('noResults')}
            </Text>
          </YStack>
        )}
      />
    </YStack>
  );
};

const styles = StyleSheet.create({});

module.exports = PlaylistDetailScreen;
