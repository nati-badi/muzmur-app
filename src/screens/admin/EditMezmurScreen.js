const React = require('react');
const { useState, useMemo, useRef, useEffect } = React;
const { YStack, XStack, Text, ScrollView, Button, Input, TextArea, Spinner, View: TView } = require('tamagui');
const { TouchableOpacity, Alert, FlatList, Modal, View, Animated, PanResponder, Dimensions, StyleSheet, TouchableWithoutFeedback } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { useAppTheme } = require('../../context/ThemeContext');
const { useLanguage } = require('../../context/LanguageContext');
const AdminService = require('../../services/AdminService');
const DataService = require('../../services/DataService');
const ScreenHeader = require('../../components/ScreenHeader');

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.70;

// Static list of categories from the data folders to ensure they are always available
const FOLDER_CATEGORIES = [
    "የከተራና የጥምቀት መዝሙራት",
    "የቃና ዘገሊላ መዝሙራት",
    "የመድኃኔዓለም የምስጋና መዝሙራት",
    "የእመቤታችን የምስጋና መዝሙራት",
    "የቅዱስ ሚካኤል መዝሙራት",
    "የቅዱስ ገብርኤል መዝሙራት",
    "የአቡነ ተክለ ሃይማኖት መዝሙራት",
    "የቅዱስ ጊዮርጊስ መዝሙራት",
    "የአቡነ ገብረ መንፈስ ቅዱስ መዝሙራት",
    "ስለ ቅድስት ቤተ ክርስቲያን መዝሙራት",
    "ስለ ቀዳሜ ሰማዕት እስጢፋኖስ መዝሙራት",
    "ስለ ቅዱስ ዮሐንስ አፈወርቅ መዝሙራት",
    "ስለ ሀገራችን ኢትዮጵያ መዝሙራት",
    "ስለ አባ ገሪማ",
    "ስለ ቅድስት አርሴማ መዝሙራት",
    "ስለ ቅዱስ ፊልጶስ መዝሙራት",
    "Afan Oromo Mezmurs",
    "የዐውደ ዓመት መዝሙራት",
    "የሆሣዕና መዝሙራት",
    "የልደት እና የጥምቀት መዝሙራት",
    "የሕጻናት መዝሙራት",
    "የመላእክት መዝሙራት",
    "የመስቀል መዝሙራት",
    "የሠርግ መዝሙራት",
    "የሰማዕታት መዝሙራት",
    "የቅዱሳን ጻድቃን መዝሙራት",
    "የትንሣኤ መዝሙራት",
    "የኅዳር ጽዮን መዝሙራት",
    "የንስሓ መዝሙራት",
    "የአስተርእዮ ማርያም መዝሙራት",
    "የኪዳነ ምሕረት መዝሙራት",
    "የወርኃ ጽጌ መዝሙራት",
    "የደብረ ታቦር መዝሙራት",
    "የግንቦት 1. መዝሙራት"
];

const InputField = ({ label, value, onChangeText, placeholder, multiline = false, readOnly = false, onPress, theme }) => (
    <YStack space="$2" marginBottom="$4">
        <Text fontFamily="$ethiopic" fontSize="$3" fontWeight="600" color={theme.textSecondary}>
            {label}
        </Text>
        {onPress ? (
            <TouchableOpacity onPress={onPress}>
                <XStack
                    backgroundColor={theme.surface}
                    borderColor={theme.borderColor}
                    borderWidth={1}
                    padding="$3"
                    borderRadius="$3"
                    jc="space-between"
                    ai="center"
                >
                    <Text color={value ? theme.text : theme.textSecondary} fontFamily="$ethiopic">
                        {value || placeholder}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.primary} />
                </XStack>
            </TouchableOpacity>
        ) : multiline ? (
            <TextArea
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                backgroundColor={theme.surface}
                borderColor={theme.borderColor}
                color={theme.text}
                fontFamily="$ethiopic"
                borderRadius="$3"
                minHeight={150}
                textAlign="left"
                textAlignVertical="top"
                p="$3"
            />
        ) : (
            <Input
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                backgroundColor={theme.surface}
                borderColor={theme.borderColor}
                color={theme.text}
                fontFamily="$ethiopic"
                borderRadius="$3"
                readOnly={readOnly}
                textAlign="left"
                p="$3"
            />
        )}
    </YStack>
);

// Fully custom bottom sheet — no PortalProvider needed at all
const CategorySheet = ({ visible, onClose, filteredSections, sectionSearch, setSectionSearch, formData, setFormData, theme, insets }) => {
    const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const dragY = useRef(new Animated.Value(0)).current;
    const [mounted, setMounted] = useState(false);

    // Step 1: when visible changes to true, reset positions then mount
    useEffect(() => {
        if (visible) {
            translateY.setValue(SHEET_HEIGHT);
            overlayOpacity.setValue(0);
            dragY.setValue(0);
            setMounted(true);
        }
    }, [visible]);

    // Step 2: once mounted, animate in (runs after Modal is in the tree)
    useEffect(() => {
        if (mounted && visible) {
            Animated.parallel([
                Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
                Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [mounted]);

    const closeSheet = () => {
        Animated.parallel([
            Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 280, useNativeDriver: true }),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => {
            dragY.setValue(0);
            setMounted(false);
            onClose();
        });
    };

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
        onPanResponderMove: (_, gs) => {
            if (gs.dy > 0) dragY.setValue(gs.dy);
        },
        onPanResponderRelease: (_, gs) => {
            if (gs.dy > 80 || gs.vy > 0.5) {
                closeSheet();
            } else {
                Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
            }
        },
    })).current;

    if (!mounted && !visible) return null;

    return (
        <Modal
            transparent
            visible={mounted}
            animationType="none"
            onRequestClose={closeSheet}
            statusBarTranslucent
        >
            {/* Fading dark overlay */}
            <TouchableWithoutFeedback onPress={closeSheet}>
                <Animated.View style={[sheetStyles.overlay, { opacity: overlayOpacity }]} />
            </TouchableWithoutFeedback>

            {/* The sliding sheet panel */}
            <Animated.View
                style={[
                    sheetStyles.sheet,
                    {
                        backgroundColor: theme.background,
                        paddingBottom: insets.bottom + 20,
                        height: SHEET_HEIGHT,
                        transform: [{ translateY: Animated.add(translateY, dragY) }],
                    },
                ]}
            >
                {/* Draggable handle bar */}
                <View {...panResponder.panHandlers} style={sheetStyles.handleArea}>
                    <View style={[sheetStyles.handle, { backgroundColor: theme.textSecondary }]} />
                </View>

                {/* Header */}
                <XStack ai="center" jc="center" paddingHorizontal="$5" paddingVertical="$3">
                    <Text fontFamily="$ethiopicSerif" fontSize="$6" fontWeight="800" color={theme.primary}>
                        Select Category
                    </Text>
                </XStack>

                {/* Search */}
                <XStack
                    marginHorizontal={20}
                    marginBottom="$3"
                    backgroundColor={theme.surface}
                    borderRadius="$10"
                    paddingHorizontal="$3"
                    ai="center"
                    borderWidth={1}
                    borderColor={theme.borderColor}
                >
                    <Ionicons name="search" size={18} color={theme.textSecondary} />
                    <Input
                        f={1}
                        borderWidth={0}
                        backgroundColor="transparent"
                        placeholder="Search categories..."
                        value={sectionSearch}
                        onChangeText={setSectionSearch}
                        fontFamily="$ethiopic"
                    />
                </XStack>

                {/* Category List */}
                <FlatList
                    data={filteredSections}
                    keyExtractor={(item, idx) => idx.toString()}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item: sec }) => (
                        <TouchableOpacity
                            onPress={() => {
                                setFormData(prev => ({ ...prev, section: sec }));
                                setSectionSearch('');
                                closeSheet();
                            }}
                        >
                            <XStack
                                padding="$3"
                                backgroundColor={formData.section === sec ? `${theme.primary}15` : 'transparent'}
                                borderRadius="$3"
                                ai="center"
                                space="$3"
                            >
                                <Ionicons
                                    name={formData.section === sec ? "radio-button-on" : "radio-button-off"}
                                    size={20}
                                    color={formData.section === sec ? theme.primary : theme.textSecondary}
                                />
                                <Text fontFamily="$ethiopic" fontSize="$4" color={theme.text} f={1}>
                                    {sec}
                                </Text>
                            </XStack>
                        </TouchableOpacity>
                    )}
                />
            </Animated.View>
        </Modal>
    );
};

const sheetStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    handleArea: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 6,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        opacity: 0.35,
    },
});

const EditMezmurScreen = ({ route, navigation }) => {
    const { mezmur } = route.params || {};
    const isEditing = !!mezmur;

    const insets = useSafeAreaInsets();
    const { theme } = useAppTheme();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [showSectionSheet, setShowSectionSheet] = useState(false);
    const [sectionSearch, setSectionSearch] = useState('');

    const [formData, setFormData] = useState({
        id: mezmur?.id || '',
        title: mezmur?.title || '',
        lyrics: mezmur?.lyrics || '',
        translation: mezmur?.translation || '',
        section: mezmur?.section || '',
        duration: mezmur?.duration || '0:00',
        audioUrl: mezmur?.audioUrl || '#',
    });

    // Aggregate unique sections from data and our static list
    const availableSections = useMemo(() => {
        const dataSections = DataService.getSections().map(s => s.label);
        const combined = Array.from(new Set([...dataSections, ...FOLDER_CATEGORIES]));
        return combined.sort((a, b) => a.localeCompare(b));
    }, []);

    const filteredSections = useMemo(() => {
        if (!sectionSearch) return availableSections;
        return availableSections.filter(s => s.toLowerCase().includes(sectionSearch.toLowerCase()));
    }, [sectionSearch, availableSections]);

    const handleSave = async () => {
        if (!formData.title || !formData.lyrics || !formData.section) {
            Alert.alert("Error", "Please fill in Title, Lyrics, and Section");
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
                id: isEditing ? mezmur.id : result.id
            });

            Alert.alert("Success", `Mezmur ${isEditing ? 'updated' : 'added'} successfully`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Error", result.error);
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
                <InputField
                    label="Title"
                    value={formData.title}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                    theme={theme}
                />

                <InputField
                    label="Section / Category"
                    value={formData.section}
                    placeholder="Select a category..."
                    onPress={() => setShowSectionSheet(true)}
                    theme={theme}
                />

                <InputField
                    label="Lyrics"
                    value={formData.lyrics}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, lyrics: text }))}
                    multiline={true}
                    theme={theme}
                />
                <InputField
                    label="Translation (Optional)"
                    value={formData.translation}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, translation: text }))}
                    multiline={true}
                    theme={theme}
                />
                <InputField
                    label="Audio URL"
                    value={formData.audioUrl}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, audioUrl: text }))}
                    theme={theme}
                />
                <InputField
                    label="Duration (m:ss)"
                    value={formData.duration}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
                    theme={theme}
                />

                <TView height={40} />
            </ScrollView>

            <CategorySheet
                visible={showSectionSheet}
                onClose={() => setShowSectionSheet(false)}
                filteredSections={filteredSections}
                sectionSearch={sectionSearch}
                setSectionSearch={setSectionSearch}
                formData={formData}
                setFormData={setFormData}
                theme={theme}
                insets={insets}
            />
        </YStack>
    );
};

module.exports = EditMezmurScreen;
