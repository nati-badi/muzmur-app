const React = require('react');
const { useState } = React;
const { FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } = require('react-native');
const { YStack, XStack, Text, Button, Circle, Theme, Separator } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const ScreenHeader = require('../components/ScreenHeader');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { usePlaylists } = require('../context/PlaylistContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAppTheme } = require('../context/ThemeContext');

const PlaylistListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePlaylists();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [playlistName, setPlaylistName] = useState('');

  const handleOpenModal = (playlist = null) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist ? playlist.name : '');
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (playlistName.trim()) {
      if (editingPlaylist) {
        await renamePlaylist(editingPlaylist.id, playlistName.trim());
      } else {
        await createPlaylist(playlistName.trim());
      }
      setIsModalVisible(false);
    }
  };

  const handleDelete = (playlist) => {
    Alert.alert(
      t('deletePlaylist'),
      t('confirmDeletePlaylist'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deletePlaylist'),
          style: 'destructive',
          onPress: () => deletePlaylist(playlist.id)
        }
      ]
    );
  };

  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      style={[styles.playlistCard, { backgroundColor: theme.surface, borderColor: theme.borderColor }]}
      onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
    >
      <XStack space="$4" alignItems="center">
        <Circle size={60} backgroundColor={`${theme.primary}15`}>
          <Ionicons name="musical-notes" size={30} color={theme.primary} />
        </Circle>
        <YStack f={1} space="$1">
          <Text fontFamily="$ethiopicSerif" fontSize="$5" fontWeight="800" color={theme.text}>
            {item.name}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color={theme.textSecondary} opacity={0.7} textTransform="uppercase" letterSpacing={1}>
            {item.items.length} {t('items')}
          </Text>
        </YStack>
        <XStack space="$1">
          <Button
            circular
            size="$3"
            backgroundColor="transparent"
            icon={<Ionicons name="create-outline" size={20} color={theme.textSecondary} />}
            onPress={() => handleOpenModal(item)}
          />
          <Button
            circular
            size="$3"
            backgroundColor="transparent"
            icon={<Ionicons name="trash-outline" size={20} color={theme.error} />}
            onPress={() => handleDelete(item)}
          />
        </XStack>
      </XStack>
    </TouchableOpacity>
  );

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <ScreenHeader
        title={t('myPlaylists')}
        onBack={() => navigation.goBack()}
        theme={theme}
        rightElement={
          <Button
            circular
            size="$3"
            backgroundColor="transparent"
            icon={<Ionicons name="add" size={32} color={theme.primary} />}
            onPress={() => handleOpenModal()}
            pressStyle={{ opacity: 0.6 }}
          />
        }
      />
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylist}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={() => (
          <YStack f={1} mt="$10" alignItems="center" space="$4">
            <Ionicons name="list-outline" size={80} color={theme.primary} opacity={0.2} />
            <Text textAlign="center" color={theme.textSecondary} opacity={0.6} paddingHorizontal="$10">
              {t('noPlaylists')}
            </Text>
            <Button
              backgroundColor={theme.primary}
              onPress={() => handleOpenModal()}
              marginTop="$2"
            >
              <Text color="white" fontWeight="700">{t('createPlaylist')}</Text>
            </Button>
          </YStack>
        )}
      />

      {/* Create/Rename Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <YStack
            backgroundColor={theme.background}
            padding="$6"
            borderRadius={20}
            width="85%"
            space="$4"
            onPress={(e) => e.stopPropagation()}
            elevation="$5"
          >
            <Text fontFamily="$ethiopicSerif" fontSize="$6" fontWeight="800" color={theme.primary}>
              {editingPlaylist ? t('renamePlaylist') : t('createPlaylist')}
            </Text>
            <TextInput
              style={[styles.input, {
                color: theme.text,
                borderColor: theme.borderColor,
                backgroundColor: theme.surface
              }]}
              placeholder={t('enterPlaylistName')}
              placeholderTextColor={theme.textSecondary}
              value={playlistName}
              onChangeText={setPlaylistName}
              autoFocus
            />
            <XStack space="$3" marginTop="$2">
              <Button
                f={1}
                variant="outline"
                borderColor={theme.borderColor}
                onPress={() => setIsModalVisible(false)}
              >
                <Text color={theme.text}>{t('cancel')}</Text>
              </Button>
              <Button
                f={1}
                backgroundColor={theme.primary}
                onPress={handleSave}
                disabled={!playlistName.trim()}
              >
                <Text color="white" fontWeight="700">{t('save')}</Text>
              </Button>
            </XStack>
          </YStack>
        </TouchableOpacity>
      </Modal>
    </YStack >
  );
};

const styles = StyleSheet.create({
  playlistCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  }
});

module.exports = PlaylistListScreen;
