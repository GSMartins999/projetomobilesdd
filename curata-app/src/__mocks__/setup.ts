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
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue?: string) => defaultValue || key,
        i18n: {
            language: 'pt-BR',
            changeLanguage: jest.fn(),
        },
    }),
}));

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
jest.mock('expo-camera', () => ({
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    useCameraPermissions: jest.fn().mockReturnValue([{ status: 'granted' }, jest.fn()]),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setNotificationHandler: jest.fn(),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
    EncodingType: { Base64: 'base64' },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    getItemAsync: jest.fn().mockResolvedValue(null),
}));

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


