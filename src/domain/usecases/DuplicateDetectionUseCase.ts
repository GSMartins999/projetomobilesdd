import { Artwork } from '../entities/Artwork';
import { ArtworkRepository } from '../repositories/ArtworkRepository';

const DUPLICATE_DETECTION_RADIUS_METERS = 30;

export class DuplicateDetectionUseCase {
    constructor(private readonly artworkRepository: ArtworkRepository) { }

    async execute(latitude: number, longitude: number): Promise<Artwork[]> {
        const allArtworks = await this.artworkRepository.findAll();

        return allArtworks.filter((a) => {
            if (a.latitude === null || a.longitude === null || a.deletedAt !== null) return false;
            const dist = this.haversineDistance(latitude, longitude, a.latitude, a.longitude);
            return dist < DUPLICATE_DETECTION_RADIUS_METERS;
        });
    }

    private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371000; // Earth radius in meters
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
