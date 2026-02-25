const React = require('react');
const { useState, useEffect } = React;
const { XStack, YStack, Text, Circle, AnimatePresence } = require('tamagui');
const { Ionicons } = require('@expo/vector-icons');
const SyncService = require('../services/SyncService');
const { useAppTheme } = require('../context/ThemeContext');
const { useLanguage } = require('../context/LanguageContext');
const { useSafeAreaInsets } = require('react-native-safe-area-context');

const OfflineStatusHeader = () => {
    const { theme } = useAppTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState(SyncService.getSyncStatus());
    const [showSyncSuccess, setShowSyncSuccess] = useState(false);

    useEffect(() => {
        const handleStatusChange = (newStatus) => {
            // If we just finished syncing, show success for a bit
            if (status.isSyncing && !newStatus.isSyncing && newStatus.isConnected) {
                setShowSyncSuccess(true);
                setTimeout(() => setShowSyncSuccess(false), 3000);
            }
            setStatus(newStatus);
        };

        SyncService.addListener(handleStatusChange);
        return () => SyncService.removeListener(handleStatusChange);
    }, [status]);

    if (status.isConnected && !status.isSyncing && !showSyncSuccess) return null;

    const backgroundColor = !status.isConnected
        ? theme.error + '22'
        : status.isSyncing
            ? theme.primary + '22'
            : theme.success + '22';

    const iconName = !status.isConnected
        ? 'cloud-offline-outline'
        : status.isSyncing
            ? 'refresh-outline'
            : 'cloud-done-outline';

    const iconColor = !status.isConnected
        ? theme.error
        : status.isSyncing
            ? theme.primary
            : theme.success;

    const message = !status.isConnected
        ? t('offlineMode') || 'Offline Mode'
        : status.isSyncing
            ? t('syncing') || 'Syncing...'
            : t('synced') || 'Synced';

    return (
        <YStack
            backgroundColor={backgroundColor}
            paddingVertical="$1"
            paddingHorizontal="$4"
            ai="center"
            jc="center"
            borderBottomWidth={1}
            borderBottomColor={iconColor + '44'}
        >
            <XStack ai="center" space="$2">
                <Ionicons name={iconName} size={14} color={iconColor} />
                <Text fontSize="$1" fontWeight="700" color={iconColor} textTransform="uppercase" letterSpacing={1}>
                    {message}
                </Text>
            </XStack>
        </YStack>
    );
};

module.exports = OfflineStatusHeader;
