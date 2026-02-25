const React = require('react');
const { useState } = React;
const { Modal, TouchableOpacity, View, StyleSheet, FlatList, TextInput } = require('react-native');
const { YStack, XStack, Text, Button, Circle, Separator } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const { usePlaylists } = require('../context/PlaylistContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAppTheme } = require('../context/ThemeContext');

const AddToPlaylistModal = ({ visible, onClose, hymnId }) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { playlists, addToPlaylist, createPlaylist } = usePlaylists();
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreateAndAdd = async () => {
    if (newPlaylistName.trim()) {
      const playlist = await createPlaylist(newPlaylistName.trim());
      await addToPlaylist(playlist.id, hymnId);
      setNewPlaylistName('');
      setShowCreate(false);
      onClose();
    }
  };

  const handleAddToExisting = async (playlistId) => {
    await addToPlaylist(playlistId, hymnId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <YStack 
          backgroundColor={theme.background} 
          width="100%" 
          maxHeight="70%"
          borderTopLeftRadius={30}
          borderTopRightRadius={30}
          padding="$5"
          onPress={(e) => e.stopPropagation()}
        >
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <Text fontFamily="$ethiopicSerif" fontSize="$7" fontWeight="800" color={theme.primary}>
              {t('addToPlaylist')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.primary} />
            </TouchableOpacity>
          </XStack>

          {!showCreate ? (
            <>
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                  <TouchableOpacity 
                    onPress={() => setShowCreate(true)}
                    style={[styles.playlistItem, { borderBottomColor: theme.borderColor }]}
                  >
                    <Circle size={40} backgroundColor={`${theme.primary}15`} marginRight="$3">
                      <Ionicons name="add" size={24} color={theme.primary} />
                    </Circle>
                    <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="600" color={theme.primary}>
                      {t('createPlaylist')}
                    </Text>
                  </TouchableOpacity>
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => handleAddToExisting(item.id)}
                    style={[styles.playlistItem, { borderBottomColor: theme.borderColor }]}
                  >
                    <Circle size={40} backgroundColor={`${theme.primary}10`} marginRight="$3">
                      <Ionicons name="list" size={20} color={theme.primary} />
                    </Circle>
                    <YStack f={1}>
                      <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="600" color={theme.text}>
                        {item.name}
                      </Text>
                      <Text fontFamily="$body" fontSize="$1" color={theme.textSecondary} opacity={0.7}>
                        {item.items.length} {t('items')}
                      </Text>
                    </YStack>
                    {item.items.includes(hymnId) && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <YStack paddingVertical="$8" alignItems="center">
                    <Text color={theme.textSecondary} opacity={0.6}>{t('noPlaylists')}</Text>
                  </YStack>
                )}
              />
            </>
          ) : (
            <YStack space="$4" paddingBottom="$4">
              <TextInput
                style={[styles.input, { 
                  color: theme.text, 
                  borderColor: theme.borderColor,
                  backgroundColor: theme.surface 
                }]}
                placeholder={t('enterPlaylistName')}
                placeholderTextColor={theme.textSecondary}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
              />
              <XStack space="$3">
                <Button 
                  f={1} 
                  variant="outline" 
                  borderColor={theme.borderColor}
                  onPress={() => setShowCreate(false)}
                >
                  <Text color={theme.text}>{t('cancel')}</Text>
                </Button>
                <Button 
                  f={1} 
                  backgroundColor={theme.primary}
                  onPress={handleCreateAndAdd}
                  disabled={!newPlaylistName.trim()}
                >
                  <Text color="white" fontWeight="700">{t('save')}</Text>
                </Button>
              </XStack>
            </YStack>
          )}
        </YStack>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
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

module.exports = AddToPlaylistModal;
