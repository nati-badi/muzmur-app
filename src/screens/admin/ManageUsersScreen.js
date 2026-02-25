const React = require('react');
const { useState, useEffect, useCallback } = React;
const { YStack, XStack, Text, ScrollView, View, Button, Circle, Spinner } = require('tamagui');
const { TouchableOpacity, FlatList, Alert, Image } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const AdminService = require('../../services/AdminService');
const ScreenHeader = require('../../components/ScreenHeader');

const ManageUsersScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useAppTheme();
    const { t } = useLanguage();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = async (loadMore = false) => {
        if (loadMore && !hasMore) return;

        if (loadMore) setLoadingMore(true);
        else setLoading(true);

        const result = await AdminService.getUsersPaginated(loadMore ? lastVisible : null);

        if (result.success) {
            if (loadMore) {
                setUsers(prev => [...prev, ...result.users]);
            } else {
                setUsers(result.users);
            }
            setLastVisible(result.lastVisible);
            setHasMore(result.users.length === 20);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleAdminRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const actionLabel = newRole === 'admin' ? t('makeAdmin') : t('removeAdmin');

        Alert.alert(
            actionLabel,
            `Are you sure you want to ${newRole === 'admin' ? 'make' : 'remove'} ${user.displayName || user.email} ${newRole === 'admin' ? 'an admin' : 'from admin role'}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: actionLabel,
                    onPress: async () => {
                        const res = await AdminService.updateUserRole(user.id, newRole);
                        if (res.success) {
                            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                        } else {
                            Alert.alert("Error", res.error);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteUser = async (user) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${user.displayName || user.email}? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const res = await AdminService.deleteUser(user.id);
                        if (res.success) {
                            setUsers(prev => prev.filter(u => u.id !== user.id));
                        } else {
                            Alert.alert("Error", res.error);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <XStack
            backgroundColor={theme.surface}
            padding="$4"
            borderRadius="$3"
            marginBottom="$3"
            alignItems="center"
            space="$3"
            borderWidth={1}
            borderColor={theme.borderColor}
        >
            <Circle size={40} backgroundColor={theme.primary} overflow="hidden">
                {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={{ width: '100%', height: '100%' }} />
                ) : (
                    <Ionicons name="person" size={20} color="white" />
                )}
            </Circle>

            <YStack f={1}>
                <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="700" color={theme.text}>
                    {item.displayName || 'Anonymous'}
                </Text>
                <Text fontFamily="$body" fontSize="$2" color={theme.textSecondary} numberOfLines={1}>
                    {item.email || 'No Email'}
                </Text>
                {item.role === 'admin' && (
                    <XStack backgroundColor={`${theme.primary}20`} paddingVertical={2} paddingHorizontal={8} borderRadius={10} alignSelf="flex-start" mt="$1">
                        <Text fontSize={10} color={theme.primary} fontWeight="800">ADMIN</Text>
                    </XStack>
                )}
            </YStack>

            <XStack space="$1">
                <TouchableOpacity
                    onPress={() => toggleAdminRole(item)}
                    style={{ padding: 8 }}
                >
                    <Ionicons
                        name={item.role === 'admin' ? "shield-outline" : "shield-checkmark-outline"}
                        size={24}
                        color={item.role === 'admin' ? theme.textSecondary : theme.primary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleDeleteUser(item)}
                    style={{ padding: 8 }}
                >
                    <Ionicons
                        name="trash-outline"
                        size={24}
                        color={theme.error || '#ff4444'}
                    />
                </TouchableOpacity>
            </XStack>
        </XStack>
    );

    return (
        <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
            <ScreenHeader
                title={t('manageUsers')}
                onBack={() => navigation.goBack()}
                theme={theme}
            />

            {loading ? (
                <YStack f={1} jc="center" ai="center">
                    <Spinner size="large" color={theme.primary} />
                </YStack>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    onEndReached={() => fetchUsers(true)}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => loadingMore ? <Spinner padding="$4" color={theme.primary} /> : null}
                    ListEmptyComponent={() => (
                        <YStack ai="center" mt="$10" opacity={0.5}>
                            <Ionicons name="people-outline" size={60} color={theme.textSecondary} />
                            <Text fontFamily="$body" mt="$4">No users found</Text>
                        </YStack>
                    )}
                />
            )}
        </YStack>
    );
};

export default ManageUsersScreen;
