const React = require('react');
const { useState } = React;
const { YStack, XStack, Text, ScrollView, View, Button, Input, TextArea, Spinner } = require('tamagui');
const { TouchableOpacity, Alert } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useAuth } = require('../context/AuthContext');
const AdminService = require('../services/AdminService');
const ScreenHeader = require('../components/ScreenHeader');

const FeedbackScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useAppTheme();
    const { t } = useLanguage();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        if (!subject || !message) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        const result = await AdminService.submitFeedback(user?.uid || 'anonymous', {
            subject,
            message,
            userEmail: user?.email || 'Anonymous',
            userName: user?.displayName || 'Anonymous'
        });
        setLoading(false);

        if (result.success) {
            Alert.alert("Thank You", "Your feedback has been submitted successfully.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Error", result.error);
        }
    };

    return (
        <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
            {/* Header */}
            <ScreenHeader
                title={t('submitFeedback')}
                onBack={() => navigation.goBack()}
                theme={theme}
            />

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <YStack space="$4">
                    <Text fontFamily="$body" fontSize="$4" color={theme.text} opacity={0.8}>
                        We value your thoughts and suggestions. Please let us know how we can improve.
                    </Text>

                    <YStack space="$2">
                        <Text fontFamily="$ethiopic" fontSize="$3" fontWeight="600" color={theme.textSecondary}>
                            {t('feedbackSubject')}
                        </Text>
                        <Input
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="e.g. App suggestion, Bug report..."
                            backgroundColor={theme.surface}
                            borderColor={theme.borderColor}
                            color={theme.text}
                            fontFamily="$ethiopic"
                        />
                    </YStack>

                    <YStack space="$2">
                        <Text fontFamily="$ethiopic" fontSize="$3" fontWeight="600" color={theme.textSecondary}>
                            {t('feedbackMessage')}
                        </Text>
                        <TextArea
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Your detailed feedback..."
                            backgroundColor={theme.surface}
                            borderColor={theme.borderColor}
                            color={theme.text}
                            fontFamily="$ethiopic"
                            minHeight={200}
                        />
                    </YStack>

                    <Button
                        onPress={handleSubmit}
                        backgroundColor={theme.primary}
                        disabled={loading}
                        size="$5"
                        borderRadius="$10"
                        marginTop="$4"
                    >
                        {loading ? <Spinner color="white" /> : <Text color="white" fontWeight="700" fontSize="$4">{t('sendFeedback')}</Text>}
                    </Button>
                </YStack>
            </ScrollView>
        </YStack>
    );
};

export default FeedbackScreen;
