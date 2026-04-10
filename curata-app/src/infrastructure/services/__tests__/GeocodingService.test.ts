import * as Location from 'expo-location';
import { GeocodingService } from '../GeocodingService';

jest.mock('expo-location', () => ({
    reverseGeocodeAsync: jest.fn(),
}));

describe('GeocodingService', () => {
    let service: GeocodingService;

    beforeEach(() => {
        service = new GeocodingService();
        jest.clearAllMocks();
    });

    it('should return a formatted address from coordinates', async () => {
        const mockAddress = {
            street: 'Rua das Flores',
            streetNumber: '123',
            district: 'Centro',
            city: 'São Paulo',
            region: 'SP',
        };
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValueOnce([mockAddress]);

        const result = await service.reverseGeocode(-23.55052, -46.633308);

        expect(Location.reverseGeocodeAsync).toHaveBeenCalledWith({
            latitude: -23.55052,
            longitude: -46.633308,
        });
        expect(result).toBe('Rua das Flores, 123, Centro, São Paulo, SP');
    });

    it('should return null if no results are found', async () => {
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValueOnce([]);

        const result = await service.reverseGeocode(0, 0);

        expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (Location.reverseGeocodeAsync as jest.Mock).mockRejectedValueOnce(new Error('Geocoding failed'));

        const result = await service.reverseGeocode(0, 0);

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('[GeocodingService] Error reverse geocoding:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('should filter out null or undefined address components', async () => {
        const mockAddress = {
            street: 'Rua Principal',
            city: 'Rio de Janeiro',
            region: 'RJ',
        };
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValueOnce([mockAddress]);

        const result = await service.reverseGeocode(-22.9068, -43.1729);

        expect(result).toBe('Rua Principal, Rio de Janeiro, RJ');
    });
});
