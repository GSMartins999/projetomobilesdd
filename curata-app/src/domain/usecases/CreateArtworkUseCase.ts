import { Artwork, CreateArtworkInput } from '../entities/Artwork';
import { ArtworkRepository } from '../repositories/ArtworkRepository';

const DUPLICATE_DETECTION_RADIUS_METERS = 30;

function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
): number {
    const R = 6371000; // raio da Terra em metros
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface CreateArtworkResult {
    artwork: Artwork;
    nearbyArtworks: Artwork[];
}

export class CreateArtworkUseCase {
    constructor(
        private readonly artworkRepository: ArtworkRepository,
        private readonly getDeviceId: () => string,
        private readonly generateId: () => string,
        private readonly now: () => string = () => new Date().toISOString(),
    ) { }

    async execute(input: CreateArtworkInput): Promise<CreateArtworkResult> {
        if (!input.name.trim()) {
            throw new Error('Nome da obra é obrigatório');
        }

        const artwork: Artwork = {
            id: this.generateId(),
            displayId: null,
            name: input.name.trim(),
            artist: input.artist?.trim() || null,
            type: input.type,
            conservationStatus: input.conservationStatus,
            notes: input.notes?.trim() || null,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            address: null,
            deviceId: this.getDeviceId(),
            updatedAt: this.now(),
            syncedAt: null,
            deletedAt: null,
        };

        // Detecção de duplicatas por geofence de 30m
        let nearbyArtworks: Artwork[] = [];
        if (artwork.latitude !== null && artwork.longitude !== null) {
            const allArtworks = await this.artworkRepository.findAll();
            nearbyArtworks = allArtworks.filter((a) => {
                if (a.latitude === null || a.longitude === null || a.deletedAt !== null) return false;
                const dist = haversineDistance(
                    artwork.latitude!, artwork.longitude!,
                    a.latitude, a.longitude,
                );
                return dist < DUPLICATE_DETECTION_RADIUS_METERS;
            });
        }

        await this.artworkRepository.save(artwork);
        return { artwork, nearbyArtworks };
    }
}
