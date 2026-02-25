const React = require('react');
const { useState, useEffect } = React;
const { YStack, XStack, Text, ScrollView, View, Spinner, Circle } = require('tamagui');
const { TouchableOpacity, FlatList } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const AdminService = require('../../services/AdminService');
const ScreenHeader = require('../../components/ScreenHeader');

const AdminFeedbackListScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useAppTheme();
    const { t } = useLanguage();

    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchFeedback = async (loadMore = false) => {
        if (loadMore && !hasMore) return;

        if (loadMore) setLoadingMore(true);
        else setLoading(true);

        const result = await AdminService.getFeedback(loadMore ? lastVisible : null);

        if (result.success) {
            if (loadMore) {
                setFeedback(prev => [...prev, ...result.feedback]);
            } else {
                setFeedback(result.feedback);
            }
            setLastVisible(result.lastVisible);
            setHasMore(result.feedback.length === 20);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const renderItem = ({ item }) => (
        <YStack
            backgroundColor={theme.surface}
            padding="$4"
            borderRadius="$3"
            marginBottom="$3"
            borderWidth={1}
            borderColor={theme.borderColor}
            space="$2"
        >
            <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="700" color={theme.text}>
                    {item.subject}
                </Text>
                <Text fontSize="$1" color={theme.textSecondary} opacity={0.6}>
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
                </Text>
            </XStack>

            <Text fontFamily="$body" fontSize="$3" color={theme.text} opacity={0.9}>
                {item.message}
            </Text>

            <Separator borderColor={theme.borderColor} opacity={0.5} marginVertical="$2" />

            <XStack alignItems="center" space="$2">
                <Circle size={24} backgroundColor={theme.primary + '20'}>
                    <Ionicons name="person" size={12} color={theme.primary} />
                </Circle>
                <Text fontSize="$2" color={theme.textSecondary} f={1} numberOfLines={1}>
                    {item.userName} ({item.userEmail})
                </Text>
                <XStack backgroundColor={item.status === 'pending' ? '#f1c40f20' : '#2ecc7120'} px="$2" py="$1" borderRadius="$10">
                    <Text fontSize={10} color={item.status === 'pending' ? '#f39c12' : '#27ae60'} fontWeight="800">
                        {item.status.toUpperCase()}
                    </Text>
                </XStack>
            </XStack>
        </YStack>
    );

    return (
        <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
            <ScreenHeader
                title={t('adminFeedback')}
                onBack={() => navigation.goBack()}
                theme={theme}
            />

            {loading ? (
                <YStack f={1} jc="center" ai="center">
                    <Spinner size="large" color={theme.primary} />
                </YStack>
            ) : (
                <FlatList
                    data={feedback}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    onEndReached={() => fetchFeedback(true)}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => loadingMore ? <Spinner padding="$4" color={theme.primary} /> : null}
                    ListEmptyComponent={() => (
                        <YStack ai="center" mt="$10" opacity={0.5}>
                            <Ionicons name="chatbubbles-outline" size={60} color={theme.textSecondary} />
                            <Text fontFamily="$body" mt="$4">No feedback received yet</Text>
                        </YStack>
                    )}
                />
            )}
        </YStack>
    );
};

const Separator = ({ borderColor, opacity, marginVertical }) => (
    <View borderBottomWidth={1} borderColor={borderColor} opacity={opacity} marginVertical={marginVertical} />
);

export default AdminFeedbackListScreen;
