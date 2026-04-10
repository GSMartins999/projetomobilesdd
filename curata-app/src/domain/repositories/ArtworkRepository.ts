import { Artwork, CreateArtworkInput } from '../entities/Artwork';

export interface ArtworkRepository {
    findAll(): Promise<Artwork[]>;
    findById(id: string): Promise<Artwork | null>;
    findNearby(latitude: number, longitude: number, radiusMeters: number): Promise<Artwork[]>;
    save(artwork: Artwork): Promise<void>;
    update(artwork: Artwork): Promise<void>;
    softDelete(id: string): Promise<void>;
    findUnsynced(): Promise<Artwork[]>;
}
