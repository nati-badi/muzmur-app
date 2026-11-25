const React = require('react');
const { useState, useEffect, useCallback } = React;
const { YStack, XStack, Text, Spinner, Button } = require('tamagui');
const { FlatList, TouchableOpacity, Alert, RefreshControl } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('../utils/icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAuth } = require('../context/AuthContext');
const SubmissionService = require('../services/SubmissionService');
const ScreenHeader = require('../components/ScreenHeader');

const statusColor = (status, theme) => {
  if (status === 'approved') return '#27ae60';
  if (status === 'rejected') return '#e74c3c';
  if (status === 'cancelled') return theme.textSecondary;
  return '#f39c12';
};

const MySubmissionsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, isAnonymous } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.uid || isAnonymous) return;
    const result = await SubmissionService.getMySubmissions(user.uid);
    if (result.success) {
      setItems(result.submissions.filter((s) => s.status !== 'cancelled'));
    }
    setLoading(false);
    setRefreshing(false);
  }, [user?.uid, isAnonymous]);

  useEffect(() => {
    if (!isAuthenticated || isAnonymous) {
      Alert.alert(t('signInRequired'), t('signInToSubmitMezmur'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
      return;
    }
    load();
  }, [isAuthenticated, isAnonymous, load, navigation, t]);

  const handleCancel = (item) => {
    if (item.status !== 'pending') return;
    Alert.alert(t('cancelSubmission'), t('cancelSubmissionConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          const result = await SubmissionService.cancelSubmission(user.uid, item.id);
          if (result.success) load();
          else Alert.alert(t('error'), result.error);
        },
      },
    ]);
  };

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
      <XStack justifyContent="space-between" alignItems="flex-start">
        <Text fontFamily="$ethiopic" fontSize="$4" fontWeight="700" color={theme.text} f={1}>
          {item.title}
        </Text>
        <XStack backgroundColor={`${statusColor(item.status, theme)}20`} px="$2" py="$1" borderRadius="$10">
          <Text fontSize={10} color={statusColor(item.status, theme)} fontWeight="800">
            {t(`submissionStatus_${item.status}`) || item.status}
          </Text>
        </XStack>
      </XStack>
      <Text fontSize="$2" color={theme.textSecondary} numberOfLines={1}>
        {item.section}
      </Text>
      {item.status === 'rejected' && item.rejectionReason ? (
        <Text fontSize="$2" color="#e74c3c">
          {t('rejectionReason')}: {item.rejectionReason}
        </Text>
      ) : null}
      {item.status === 'approved' && item.assignedMezmurId ? (
        <Text fontSize="$2" color={theme.primary}>
          {t('assignedId')}: {item.assignedMezmurId}
        </Text>
      ) : null}
      <Text fontSize="$1" color={theme.textSecondary} opacity={0.7}>
        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}
      </Text>
      {item.status === 'pending' && (
        <Button size="$3" chromeless onPress={() => handleCancel(item)}>
          <Text color="#e74c3c" fontWeight="600">
            {t('cancelSubmission')}
          </Text>
        </Button>
      )}
    </YStack>
  );

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <ScreenHeader
        title={t('mySubmissions')}
        onBack={() => navigation.goBack()}
        theme={theme}
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('SubmitMezmur')}>
            <Ionicons name="add-circle-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <YStack f={1} jc="center" ai="center">
          <Spinner size="large" color={theme.primary} />
        </YStack>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
          ListEmptyComponent={
            <YStack ai="center" mt="$10" opacity={0.6} space="$4">
              <Ionicons name="document-text-outline" size={56} color={theme.textSecondary} />
              <Text fontFamily="$body">{t('noSubmissionsYet')}</Text>
              <Button backgroundColor={theme.primary} onPress={() => navigation.navigate('SubmitMezmur')}>
                <Text color="white" fontWeight="700">
                  {t('submitMezmur')}
                </Text>
              </Button>
            </YStack>
          }
        />
      )}
    </YStack>
  );
};

module.exports = MySubmissionsScreen;