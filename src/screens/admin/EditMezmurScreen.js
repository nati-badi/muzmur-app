const React = require('react');
const { useState } = React;
const { YStack, Text, ScrollView, Button, Spinner, View: TView } = require('tamagui');
const { Alert } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const AdminService = require('../../services/AdminService');
const DataService = require('../../services/DataService');
const ScreenHeader = require('../../components/ScreenHeader');
const { MezmurFormFields } = require('../../components/MezmurFormFields');

const EditMezmurScreen = ({ route, navigation }) => {
  const { mezmur } = route.params || {};
  const isEditing = !!mezmur;

  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: mezmur?.id || '',
    title: mezmur?.title || '',
    lyrics: mezmur?.lyrics || '',
    translation: mezmur?.translation || '',
    section: mezmur?.section || '',
    duration: mezmur?.duration || '0:00',
    audioUrl: mezmur?.audioUrl || '#',
  });

  const handleSave = async () => {
    if (!formData.title || !formData.lyrics || !formData.section) {
      Alert.alert(t('error'), t('mezmurFormRequired'));
      return;
    }

    setLoading(true);
    let result;

    if (isEditing) {
      result = await AdminService.updateMezmur(mezmur.id, formData);
    } else {
      const { id, ...data } = formData;
      result = await AdminService.addMezmur(data);
    }

    setLoading(false);

    if (result.success) {
      DataService.updateLocalHymn({
        ...formData,
        id: isEditing ? mezmur.id : result.id,
      });

      Alert.alert(t('success'), isEditing ? t('mezmurUpdated') : t('mezmurAdded'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert(t('error'), result.error);
    }
  };

  return (
    <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
      <ScreenHeader
        title={isEditing ? t('editMezmur') : t('addMezmur')}
        onBack={() => navigation.goBack()}
        theme={theme}
        rightElement={
          <Button
            onPress={handleSave}
            backgroundColor={theme.primary}
            disabled={loading}
            size="$3"
            circular={false}
            borderRadius="$10"
            paddingHorizontal="$4"
          >
            {loading ? <Spinner color="white" /> : <Text color="white" fontWeight="700">{t('save')}</Text>}
          </Button>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <MezmurFormFields
          formData={formData}
          setFormData={setFormData}
          theme={theme}
          insets={insets}
          showAudioUrl
          showDuration
        />
        <TView height={40} />
      </ScrollView>
    </YStack>
  );
};

module.exports = EditMezmurScreen;