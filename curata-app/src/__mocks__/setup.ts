// Silence specific warnings in tests
const originalWarn = console.warn;
jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg?.includes('Warning:') || msg?.includes('componentWillMount')) return;
    originalWarn(msg);
});

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockIcon = (props: any) => React.createElement(View, props);
    return {
        MaterialIcons: MockIcon,
        Ionicons: MockIcon,
        FontAwesome: MockIcon,
    };
});

// Mock react-i18next
const mockI18nInstance = {
    language: 'pt-BR',
    changeLanguage: jest.fn((lng: string) => {
        mockI18nInstance.language = lng;
    }),
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (typeof options === 'string') return options;
            if (options && typeof options === 'object' && options.defaultValue) {
                return String(options.defaultValue);
            }
            return key;
        },
        i18n: mockI18nInstance,
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// Mock Alert
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.Alert.alert = jest.fn();
    return RN;
});

// Mock expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getCurrentPositionAsync: jest.fn().mockResolvedValue({
        coords: { latitude: -23.55052, longitude: -46.633308 },
    }),
    reverseGeocodeAsync: jest.fn().mockResolvedValue([{
        street: 'Praça da Sé',
        city: 'São Paulo',
        region: 'SP',
        country: 'Brazil'
    }]),
}));

// Mock expo-camera
jest.mock('expo-camera', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockCameraView = (props: any) => {
        React.useEffect(() => {
            if (props.onCameraReady) {
                props.onCameraReady();
            }
        }, []);
        return React.createElement(View, props);
    };
    return {
        CameraView: MockCameraView,
        requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
        useCameraPermissions: jest.fn().mockReturnValue([{ status: 'granted', granted: true }, jest.fn()]),
        Camera: {
            requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
            getCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
            Constants: { Type: { back: 'back', front: 'front' } },
        }
    };
});

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([
        { identifier: '1', content: { title: 'Inspeção Urgente!', body: 'Revisitar obra' } },
        { identifier: '2', content: { title: 'Agendamento Confirmado', body: 'Visita agendada' } }
    ]),
    setNotificationHandler: jest.fn(),
    scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id'),
    setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
    SchedulableTriggerInputTypes: {
        TIME_INTERVAL: 'timeInterval',
        DATE: 'date',
        DAILY: 'daily',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly',
        YEARLY: 'yearly',
    },
    AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1, NONE: 0 },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
    EncodingType: { Base64: 'base64' },
}));

jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
    EncodingType: { Base64: 'base64' },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    getItemAsync: jest.fn().mockResolvedValue(null),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);


// Mock expo-print
jest.mock('expo-print', () => ({
    printToFileAsync: jest.fn().mockResolvedValue({ uri: 'fake-uri' }),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(() => () => { }),
    fetch: jest.fn().mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
    }),
    useNetInfo: () => ({
        isConnected: true,
        isInternetReachable: true,
    }),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockComponent = React.forwardRef((props: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
            animateToRegion: jest.fn(),
        }));
        return React.createElement(View, props, props.children);
    });
    return {
        __esModule: true,
        default: MockComponent,
        Marker: MockComponent,
        Callout: MockComponent,
    };
}, { virtual: true });

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        SafeAreaView: (props: any) => React.createElement(View, props, props.children),
        SafeAreaProvider: (props: any) => React.createElement(View, props, props.children),
        useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
    };
});


