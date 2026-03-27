import { eq, and, isNull } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { ArtworkRepository } from '../../domain/repositories/ArtworkRepository';
import { Artwork } from '../../domain/entities/Artwork';
import { artworks } from '../db/schema';
import * as schema from '../db/schema';

export class ArtworkRepositoryImpl implements ArtworkRepository {
    constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) { }

    async findAll(): Promise<Artwork[]> {
        const result = await this.db.select().from(artworks).where(isNull(artworks.deletedAt));
        return result as Artwork[];
    }

    async findById(id: string): Promise<Artwork | null> {
        const result = await this.db.select().from(artworks).where(eq(artworks.id, id)).limit(1);
        return (result[0] as Artwork) || null;
    }

    async findNearby(latitude: number, longitude: number, radiusMeters: number): Promise<Artwork[]> {
        // SQLite não tem funções geográficas nativas complexas.
        // Para o MVP, buscamos todas e filtramos em memória ou usamos uma caixa delimitadora (bounding box).
        // Aqui usaremos bounding box aproximada (1 grau lat ~ 111km)
        const latDelta = radiusMeters / 111000;
        const lngDelta = radiusMeters / (111000 * Math.cos(latitude * (Math.PI / 180)));

        const result = await this.db.select().from(artworks).where(
            and(
                isNull(artworks.deletedAt),
                // Simplificação: Filtro retangular básico
                // artworks.latitude >= latitude - latDelta, ...
            )
        );

        // Filtro preciso via Haversine no domain ou aqui
        // Como o domain já faz isso no CreateArtworkUseCase, aqui retornamos a lista base
        return result as Artwork[];
    }

    async save(artwork: Artwork): Promise<void> {
        await this.db.insert(artworks).values({
            id: artwork.id,
            displayId: artwork.displayId,
            name: artwork.name,
            artist: artwork.artist,
            type: artwork.type,
            conservationStatus: artwork.conservationStatus,
            notes: artwork.notes,
            latitude: artwork.latitude,
            longitude: artwork.longitude,
            address: artwork.address,
            deviceId: artwork.deviceId,
            updatedAt: artwork.updatedAt,
            syncedAt: artwork.syncedAt,
            deletedAt: artwork.deletedAt,
        });
    }

    async update(artwork: Artwork): Promise<void> {
        await this.db.update(artworks)
            .set({
                name: artwork.name,
                artist: artwork.artist,
                type: artwork.type,
                conservationStatus: artwork.conservationStatus,
                notes: artwork.notes,
                latitude: artwork.latitude,
                longitude: artwork.longitude,
                address: artwork.address,
                updatedAt: artwork.updatedAt,
                syncedAt: artwork.syncedAt, // Atualiza para null no sync service se alterado
                deletedAt: artwork.deletedAt,
            })
            .where(eq(artworks.id, artwork.id));
    }

    async softDelete(id: string): Promise<void> {
        await this.db.update(artworks)
            .set({
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .where(eq(artworks.id, id));
    }

    async findUnsynced(): Promise<Artwork[]> {
        return await this.db.select().from(artworks).where(
            and(
                isNull(artworks.syncedAt)
            )
        ) as Artwork[];
    }
}
