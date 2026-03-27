// Mock expo-location
export const PermissionStatus = {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
};

export const Accuracy = {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
};

export const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({
    status: 'granted',
    granted: true,
});

export const getForegroundPermissionsAsync = jest.fn().mockResolvedValue({
    status: 'granted',
    granted: true,
});

export const getCurrentPositionAsync = jest.fn().mockResolvedValue({
    coords: {
        latitude: -23.5505,
        longitude: -46.6333,
        altitude: 760,
        accuracy: 5,
        altitudeAccuracy: 5,
        heading: 0,
        speed: 0,
    },
    timestamp: Date.now(),
});

export const reverseGeocodeAsync = jest.fn().mockResolvedValue([
    {
        street: 'Av. Paulista',
        streetNumber: '1234',
        district: 'Bela Vista',
        city: 'São Paulo',
        region: 'SP',
        country: 'Brasil',
        postalCode: '01310-100',
        formattedAddress: 'Av. Paulista, 1234 - Bela Vista, São Paulo - SP',
    },
]);

export const useLocationPermissions = jest.fn(() => [
    { granted: true, status: 'granted' },
    requestForegroundPermissionsAsync,
]);
