// Silence specific warnings in tests
const originalWarn = console.warn;
jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg?.includes('Warning:') || msg?.includes('componentWillMount')) return;
    originalWarn(msg);
});

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue?: string) => {
            return defaultValue || key;
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

// Ultra-simple FlatList mock to ensure item rendering
jest.mock('react-native/Libraries/Lists/FlatList', () => {
    const React = require('react');
    const { View } = require('react-native');

    return React.forwardRef((props: any, ref: any) => {
        const { data, renderItem } = props;

        React.useImperativeHandle(ref, () => ({
            scrollToIndex: jest.fn(),
        }));

        return React.createElement(View, {},
            (data || []).map((item: any, index: number) =>
                React.createElement(View, { key: index.toString() }, renderItem({ item, index }))
            )
        );
    });
});
