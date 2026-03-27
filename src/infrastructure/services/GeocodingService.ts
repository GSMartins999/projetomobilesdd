import * as Location from 'expo-location';

export class GeocodingService {
    /**
     * Converte coordenadas Lat/Lng em endereço legível.
     */
    async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
        try {
            const results = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (results && results.length > 0) {
                const addr = results[0];
                // Formato: Rua Nome, Número - Bairro, Cidade - UF
                const components = [
                    addr.street,
                    addr.streetNumber,
                    addr.district,
                    addr.city,
                    addr.region // UF
                ].filter(Boolean);

                return components.join(', ');
            }
            return null;
        } catch (error) {
            console.error('[GeocodingService] Error reverse geocoding:', error);
            return null;
        }
    }
}
