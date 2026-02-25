const React = require('react');
const { YStack, XStack, Text, ScrollView, View, Circle } = require('tamagui');
const { TouchableOpacity } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const AdminService = require('../../services/AdminService');
const ScreenHeader = require('../../components/ScreenHeader');

const AdminDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useAppTheme();
    const { t } = useLanguage();

    const AdminCard = ({ title, icon, color, onPress, subtitle }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{ width: '100%', marginBottom: 16 }}
        >
            <XStack
                backgroundColor={theme.surface}
                padding="$4"
                borderRadius="$4"
                borderWidth={1}
                borderColor={theme.borderColor}
                alignItems="center"
                space="$4"
                elevation={2}
            >
                <Circle size={50} backgroundColor={`${color}15`}>
                    <Ionicons name={icon} size={24} color={color} />
                </Circle>
                <YStack f={1}>
                    <Text fontFamily="$ethiopic" fontSize="$5" fontWeight="700" color={theme.text}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text fontFamily="$body" fontSize="$2" color={theme.textSecondary} opacity={0.7}>
                            {subtitle}
                        </Text>
                    )}
                </YStack>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} opacity={0.5} />
            </XStack>
        </TouchableOpacity>
    );

    return (
        <YStack f={1} backgroundColor={theme.background} paddingTop={insets.top}>
            <ScreenHeader
                title={t('adminDashboard')}
                onBack={() => navigation.goBack()}
                theme={theme}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                <YStack space="$4">
                    <AdminCard
                        title={t('manageMezmurs')}
                        icon="musical-notes-outline"
                        color={theme.primary}
                        onPress={() => navigation.navigate('ManageMezmurs')}
                        subtitle="Add, edit or delete hymns"
                    />
                    <AdminCard
                        title={t('manageUsers')}
                        icon="people-outline"
                        color="#3498db"
                        onPress={() => navigation.navigate('ManageUsers')}
                        subtitle="Manage user roles and permissions"
                    />
                    <AdminCard
                        title={t('adminFeedback')}
                        icon="chatbubbles-outline"
                        color="#e67e22"
                        onPress={() => navigation.navigate('AdminFeedback')}
                        subtitle="Read and reply to user feedback"
                    />
                </YStack>
            </ScrollView>
        </YStack>
    );
};

export default AdminDashboardScreen;
