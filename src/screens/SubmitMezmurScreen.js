const React = require('react');
const { useState, useEffect } = React;
const { YStack, Text, ScrollView, Button, Spinner } = require('tamagui');
const { TouchableOpacity, Alert } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const DocumentPicker = require('expo-document-picker');
const { Ionicons } = require('../utils/icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAuth } = require('../context/AuthContext');
const SubmissionService = require('../services/SubmissionService');
const ScreenHeader = require('../components/ScreenHeader');
const { MezmurFormFields } = require('../components/MezmurFormFields');

const SubmitMezmurScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, isAnonymous } = useAuth();

  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    translation: '',
    section: '',
    notes: '',
    proposedId: '',
  });

  useEffect(() => {
    if (!isAuthenticated || isAnonymous) {
      Alert.alert(t('signInRequired'), t('signInToSubmitMezmur'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    }
  }, [isAuthenticated, isAnonymous, navigation, t]);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setAudioFile({
        uri: asset.uri,
        mimeType: asset.mimeType || 'audio/m4a',
        name: asset.name,
      });
    } catch (e) {
      Alert.alert(t('error'), e.message);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || isAnonymous) {
      Alert.alert(t('signInRequired'), t('signInToSubmitMezmur'));
      return;
    }
    if (!formData.title || !formData.lyrics || !formData.section) {
      Alert.alert(t('error'), t('mezmurFormRequired'));
      return;
    }
    if (!audioFile?.uri) {
      Alert.alert(t('error'), t('audioRequired'));
      return;
    }

    setLoading(true);
    const result = await SubmissionService.createSubmission(user, formData, audioFile.uri, audioFile.mimeType);
    setLoading(false);

    if (result.success) {
      Alert.alert(t('submissionThankYou'), t('submissionSuccess'), [
        { text: t('ok'), onPress: () => navigation.replace('MySubmissions') },
      ]);
    } else {
      Alert.alert(t('error'), result.error);
    }
  };

  if (!isAuthenticated || isAnonymous) {
    return null;
  }

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <ScreenHeader title={t('submitMezmur')} onBack={() => navigation.goBack()} theme={theme} />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text fontFamily="$body" fontSize="$3" color={theme.text} opacity={0.85} marginBottom="$4">
          {t('submitMezmurIntro')}
        </Text>

        <MezmurFormFields
          formData={formData}
          setFormData={setFormData}
          theme={theme}
          insets={insets}
          showNotes
          showProposedId
        />

        <YStack space="$2" marginBottom="$4">
          <Text fontFamily="$ethiopic" fontSize="$3" fontWeight="600" color={theme.textSecondary}>
            {t('submissionAudio')}
          </Text>
          <TouchableOpacity onPress={pickAudio}>
            <YStack
              backgroundColor={theme.surface}
              borderColor={theme.borderColor}
              borderWidth={1}
              padding="$4"
              borderRadius="$3"
              ai="center"
              space="$2"
            >
              <Ionicons name="musical-note-outline" size={32} color={theme.primary} />
              <Text fontFamily="$body" color={theme.text} textAlign="center">
                {audioFile ? audioFile.name : t('pickAudioFile')}
              </Text>
            </YStack>
          </TouchableOpacity>
        </YStack>

        <Button
          onPress={handleSubmit}
          backgroundColor={theme.primary}
          disabled={loading}
          size="$5"
          borderRadius="$10"
        >
          {loading ? <Spinner color="white" /> : <Text color="white" fontWeight="700" fontSize="$4">{t('sendSubmission')}</Text>}
        </Button>

        <TouchableOpacity onPress={() => navigation.navigate('MySubmissions')} style={{ marginTop: 16 }}>
          <Text fontFamily="$body" color={theme.primary} textAlign="center">
            {t('mySubmissions')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </YStack>
  );
};

module.exports = SubmitMezmurScreen;