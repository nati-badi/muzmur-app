const React = require('react');
const { useState, useEffect, useCallback } = React;
const { YStack, XStack, Text, ScrollView, View, Button, Circle, Input, Spinner } = require('tamagui');
const { TouchableOpacity, FlatList, Alert } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const DataService = require('../../services/DataService');
const AdminService = require('../../services/AdminService');
const ScreenHeader = require('../../components/ScreenHeader');

const ManageMezmursScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useAppTheme();
    const { t } = useLanguage();

    const [mezmurs, setMezmurs] = useState(DataService.getAll());
    const [dataVersion, setDataVersion] = useState(0);
    const [loading, setLoading] = useState(!DataService.isReady);
    const [searchQuery, setSearchQuery] = useState('');

    // Internal Pagination
    const LOAD_INCREMENT = 15;
    const [visibleCount, setVisibleCount] = useState(LOAD_INCREMENT);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Reset results when search changes
    useEffect(() => {
        setVisibleCount(LOAD_INCREMENT);
    }, [searchQuery]);

    useEffect(() => {
        const handleUpdate = () => {
            console.log('ManageMezmursScreen: Data updated, refreshing list...');
            setMezmurs([...DataService.getAll()]); // Spread to ensure new reference
            setDataVersion(v => v + 1);
            setLoading(false);
        };

        DataService.addListener(handleUpdate);
        if (DataService.isReady) {
            handleUpdate();
        } else {
            DataService.waitForReady().then(handleUpdate);
        }

        return () => DataService.removeListener(handleUpdate);
    }, []);

    const handleLoadMore = () => {
        if (isLoadingMore) return;

        const filteredMezmurs = mezmurs.filter(m =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.section.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (visibleCount >= filteredMezmurs.length) return;

        setIsLoadingMore(true);
        // Small timeout to show spinner for feedback
        setTimeout(() => {
            setVisibleCount(prev => prev + LOAD_INCREMENT);
            setIsLoadingMore(false);
        }, 300);
    };

    const handleDelete = (id, title) => {
        Alert.alert(
            "Delete Mezmur",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const res = await AdminService.deleteMezmur(id);
                        if (res.success) {
                            DataService.removeLocalHymn(id);
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
            <YStack f={1}>
                <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="700" color={theme.text}>
                    {item.title}
                </Text>
                <Text fontFamily="$body" fontSize="$2" color={theme.textSecondary} numberOfLines={1}>
                    {item.section}
                </Text>
            </YStack>
            <XStack space="$2">
                <TouchableOpacity
                    onPress={() => navigation.navigate('EditMezmur', { mezmur: item })}
                    style={{ padding: 8 }}
                >
                    <Ionicons name="create-outline" size={22} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.title)}
                    style={{ padding: 8 }}
                >
                    <Ionicons name="trash-outline" size={22} color={theme.error} />
                </TouchableOpacity>
            </XStack>
        </XStack>
    );

    return (
        <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
            <ScreenHeader
                title={t('manageMezmurs')}
                onBack={() => navigation.goBack()}
                theme={theme}
                rightElement={
                    <TouchableOpacity
                        onPress={() => navigation.navigate('EditMezmur')}
                        style={{
                            backgroundColor: theme.primary,
                            padding: 8,
                            borderRadius: 20,
                            elevation: 2
                        }}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            <YStack paddingHorizontal="$5" marginBottom="$4">
                <XStack
                    backgroundColor={theme.surface}
                    borderRadius="$10"
                    paddingHorizontal="$4"
                    alignItems="center"
                    borderWidth={1}
                    borderColor={theme.borderColor}
                >
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <Input
                        f={1}
                        borderWidth={0}
                        backgroundColor="transparent"
                        placeholder={t('searchPlaceholder')}
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        fontFamily="$ethiopic"
                    />
                </XStack>
            </YStack>

            {loading ? (
                <YStack f={1} jc="center" ai="center">
                    <Spinner size="large" color={theme.primary} />
                </YStack>
            ) : (
                <FlatList
                    data={mezmurs
                        .filter(m =>
                            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.section.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, visibleCount)
                    }
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => (
                        isLoadingMore ? (
                            <YStack padding="$4" ai="center">
                                <Spinner color={theme.primary} />
                            </YStack>
                        ) : null
                    )}
                    ListEmptyComponent={() => (
                        <YStack ai="center" mt="$10" opacity={0.5}>
                            <Ionicons name="musical-notes-outline" size={60} color={theme.textSecondary} />
                            <Text fontFamily="$body" mt="$4">{t('noResults')}</Text>
                        </YStack>
                    )}
                />
            )}
        </YStack>
    );
};

export default ManageMezmursScreen;
