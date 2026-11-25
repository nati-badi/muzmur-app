const React = require('react');
const { useState, useEffect } = React;
const { YStack, XStack, Text, ScrollView, Button, Spinner, Input } = require('tamagui');
const { Alert, TouchableOpacity } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Audio } = require('expo-av');
const { Ionicons } = require('../../utils/icons');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const { useAuth } = require('../../context/AuthContext');
const AdminService = require('../../services/AdminService');
const DataService = require('../../services/DataService');
const ScreenHeader = require('../../components/ScreenHeader');
const { MezmurFormFields } = require('../../components/MezmurFormFields');

const SubmissionReviewScreen = ({ route, navigation }) => {
  const { submissionId } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [assignedId, setAssignedId] = useState('');
  const [duration, setDuration] = useState('0:00');
  const [preferCdn, setPreferCdn] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    translation: '',
    section: '',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      const result = await AdminService.getSubmissionById(submissionId);
      if (result.success) {
        const s = result.submission;
        setSubmission(s);
        setFormData({
          title: s.title,
          lyrics: s.lyrics,
          translation: s.translation || '',
          section: s.section,
          notes: s.notes || '',
        });
        setAssignedId(s.proposedId || AdminService.suggestNextMezmurId());
      } else {
        Alert.alert(t('error'), result.error);
      }
      setLoading(false);
    };
    load();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [submissionId]);

  const togglePreview = async () => {
    if (!submission?.audioDownloadUrl) return;
    try {
      if (sound) {
        if (playing) {
          await sound.pauseAsync();
          setPlaying(false);
        } else {
          await sound.playAsync();
          setPlaying(true);
        }
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: submission.audioDownloadUrl });
      setSound(newSound);
      await newSound.playAsync();
      setPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setPlaying(false);
      });
    } catch (e) {
      Alert.alert(t('error'), e.message);
    }
  };

  const handleApprove = () => {
    if (!assignedId?.trim()) {
      Alert.alert(t('error'), t('assignedIdRequired'));
      return;
    }
    Alert.alert(t('approveSubmission'), t('approveSubmissionConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        onPress: async () => {
          setActionLoading(true);
          const result = await AdminService.approveSubmission(submissionId, user.uid, {
            assignedMezmurId: assignedId.trim(),
            duration,
            preferCdn,
          });
          setActionLoading(false);
          if (result.success) {
            DataService.updateLocalHymn(result.mezmur);
            Alert.alert(t('success'), t('submissionApproved'), [
              { text: t('ok'), onPress: () => navigation.goBack() },
            ]);
          } else {
            Alert.alert(t('error'), result.error);
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      Alert.alert(t('error'), t('rejectionReasonRequired'));
      return;
    }
    Alert.alert(t('rejectSubmission'), t('rejectSubmissionConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          const result = await AdminService.rejectSubmission(submissionId, user.uid, rejectReason);
          setActionLoading(false);
          if (result.success) {
            Alert.alert(t('success'), t('submissionRejected'), [
              { text: t('ok'), onPress: () => navigation.goBack() },
            ]);
          } else {
            Alert.alert(t('error'), result.error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <YStack f={1} jc="center" ai="center" backgroundColor={theme.background}>
        <Spinner size="large" color={theme.primary} />
      </YStack>
    );
  }

  if (!submission) return null;

  const readOnly = submission.status !== 'pending';

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <ScreenHeader title={t('reviewSubmission')} onBack={() => navigation.goBack()} theme={theme} />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <XStack space="$2" marginBottom="$4" flexWrap="wrap">
          <Text fontWeight="700" color={theme.primary}>
            {submission.status?.toUpperCase()}
          </Text>
          <Text color={theme.textSecondary}>
            {submission.submitterName} ({submission.submitterEmail})
          </Text>
        </XStack>

        {submission.audioDownloadUrl ? (
          <TouchableOpacity onPress={togglePreview} style={{ marginBottom: 16 }}>
            <XStack
              backgroundColor={theme.surface}
              borderColor={theme.borderColor}
              borderWidth={1}
              padding="$4"
              borderRadius="$3"
              ai="center"
              space="$3"
            >
              <Ionicons name={playing ? 'pause-circle' : 'play-circle'} size={40} color={theme.primary} />
              <Text fontFamily="$body" color={theme.text}>
                {t('previewSubmissionAudio')}
              </Text>
            </XStack>
          </TouchableOpacity>
        ) : null}

        <MezmurFormFields formData={formData} setFormData={setFormData} theme={theme} insets={insets} readOnly />

        {!readOnly && (
          <YStack space="$3" marginTop="$4">
            <Text fontFamily="$ethiopic" fontWeight="600" color={theme.textSecondary}>
              {t('assignedMezmurId')}
            </Text>
            <Input
              value={assignedId}
              onChangeText={setAssignedId}
              backgroundColor={theme.surface}
              borderColor={theme.borderColor}
              color={theme.text}
              fontFamily="$body"
            />
            <TouchableOpacity onPress={() => setAssignedId(AdminService.suggestNextMezmurId())}>
              <Text color={theme.primary} fontSize="$2">
                {t('suggestNextId')}: {AdminService.suggestNextMezmurId()}
              </Text>
            </TouchableOpacity>

            <Text fontFamily="$ethiopic" fontWeight="600" color={theme.textSecondary}>
              {t('duration')}
            </Text>
            <Input
              value={duration}
              onChangeText={setDuration}
              backgroundColor={theme.surface}
              borderColor={theme.borderColor}
              color={theme.text}
            />

            <TouchableOpacity onPress={() => setPreferCdn(!preferCdn)}>
              <XStack ai="center" space="$2">
                <Ionicons name={preferCdn ? 'checkbox' : 'square-outline'} size={22} color={theme.primary} />
                <Text color={theme.text}>{t('useCdnAudioUrl')}</Text>
              </XStack>
            </TouchableOpacity>

            <Button backgroundColor={theme.primary} onPress={handleApprove} disabled={actionLoading}>
              {actionLoading ? <Spinner color="white" /> : <Text color="white" fontWeight="700">{t('approveSubmission')}</Text>}
            </Button>

            <Text fontFamily="$ethiopic" fontWeight="600" color={theme.textSecondary} marginTop="$2">
              {t('rejectionReason')}
            </Text>
            <Input
              value={rejectReason}
              onChangeText={setRejectReason}
              backgroundColor={theme.surface}
              borderColor={theme.borderColor}
              color={theme.text}
              placeholder={t('rejectionReasonPlaceholder')}
            />
            <Button backgroundColor="#e74c3c" onPress={handleReject} disabled={actionLoading}>
              <Text color="white" fontWeight="700">{t('rejectSubmission')}</Text>
            </Button>
          </YStack>
        )}

        {submission.status === 'rejected' && submission.rejectionReason ? (
          <Text marginTop="$4" color="#e74c3c">
            {t('rejectionReason')}: {submission.rejectionReason}
          </Text>
        ) : null}
      </ScrollView>
    </YStack>
  );
};

module.exports = SubmissionReviewScreen;