const React = require('react');
const { useState, useEffect } = React;
const { YStack, XStack, Text, Spinner } = require('tamagui');
const { TouchableOpacity, FlatList } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('../../utils/icons');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const AdminService = require('../../services/AdminService');
const ScreenHeader = require('../../components/ScreenHeader');

const ManageSubmissionsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  const [filter, setFilter] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (loadMore = false, statusFilter = filter) => {
    if (loadMore && !hasMore) return;
    if (loadMore) setLoadingMore(true);
    else setLoading(true);

    const result = await AdminService.getSubmissionsPaginated(
      statusFilter === 'all' ? null : statusFilter,
      loadMore ? lastVisible : null
    );

    if (result.success) {
      if (loadMore) {
        setSubmissions((prev) => [...prev, ...result.submissions]);
      } else {
        setSubmissions(result.submissions);
      }
      setLastVisible(result.lastVisible);
      setHasMore(result.submissions.length === 20);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    setLastVisible(null);
    setHasMore(true);
    fetchData(false, filter);
  }, [filter]);

  const renderFilter = (value) => {
    const key = value || 'all';
    const active = (value || 'all') === (filter || 'all');
    return (
      <TouchableOpacity
        key={key}
        onPress={() => setFilter(value || 'all')}
        style={{ marginRight: 8 }}
      >
        <XStack
          px="$3"
          py="$2"
          borderRadius="$10"
          backgroundColor={active ? theme.primary : theme.surface}
          borderWidth={1}
          borderColor={active ? theme.primary : theme.borderColor}
        >
          <Text color={active ? 'white' : theme.text} fontSize="$2" fontWeight="700">
            {t(`submissionFilter_${key}`)}
          </Text>
        </XStack>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('SubmissionReview', { submissionId: item.id })}>
      <YStack
        backgroundColor={theme.surface}
        padding="$4"
        borderRadius="$3"
        marginBottom="$3"
        borderWidth={1}
        borderColor={theme.borderColor}
        space="$2"
      >
        <XStack justifyContent="space-between">
          <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="700" color={theme.text} f={1}>
            {item.title}
          </Text>
          <Text fontSize={10} fontWeight="800" color={theme.primary}>
            {(item.status || '').toUpperCase()}
          </Text>
        </XStack>
        <Text fontSize="$2" color={theme.textSecondary}>
          {item.submitterName} · {item.section}
        </Text>
        <Text fontSize="$1" opacity={0.6} color={theme.textSecondary}>
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}
        </Text>
      </YStack>
    </TouchableOpacity>
  );

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <ScreenHeader title={t('reviewSubmissions')} onBack={() => navigation.goBack()} theme={theme} />

      <FlatList
        horizontal
        data={['all', 'pending', 'approved', 'rejected']}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        renderItem={({ item }) => renderFilter(item === 'all' ? null : item)}
        style={{ maxHeight: 56, flexGrow: 0 }}
      />

      {loading ? (
        <YStack f={1} jc="center" ai="center">
          <Spinner size="large" color={theme.primary} />
        </YStack>
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          onEndReached={() => fetchData(true)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <Spinner padding="$4" color={theme.primary} /> : null}
          ListEmptyComponent={
            <YStack ai="center" mt="$8" opacity={0.5}>
              <Ionicons name="folder-open-outline" size={48} color={theme.textSecondary} />
              <Text marginTop="$3">{t('noSubmissionsAdmin')}</Text>
            </YStack>
          }
        />
      )}
    </YStack>
  );
};

module.exports = ManageSubmissionsScreen;