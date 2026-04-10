import { ArtworkRepositoryImpl } from '../ArtworkRepositoryImpl';
import { mockDb } from './mockDb';
import { Artwork } from '../../../domain/entities/Artwork';
import { artworks } from '../../db/schema';
import { eq, isNull } from 'drizzle-orm';

describe('ArtworkRepositoryImpl', () => {
    let repository: ArtworkRepositoryImpl;

    const mockArtwork: Artwork = {
        id: '1',
        displayId: 'ART-001',
        name: 'Obra',
        artist: 'Artista',
        type: 'painting',
        conservationStatus: 'good',
        notes: null,
        latitude: 0,
        longitude: 0,
        address: 'Rua X',
        deviceId: 'dev',
        updatedAt: '2026-03-27T00:00:00Z',
        syncedAt: null,
        deletedAt: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new ArtworkRepositoryImpl(mockDb as any);
    });

    it('findById deve retornar uma obra se existir', async () => {
        (mockDb.select() as any).mockResolvedValue([mockArtwork]);

        const result = await repository.findById('1');
        expect(result).toEqual(mockArtwork);
    });

    it('findById deve retornar null se não existir', async () => {
        (mockDb.select() as any).mockResolvedValue([]);

        const result = await repository.findById('non-existent');
        expect(result).toBeNull();
    });

    it('findAll deve retornar todas as obras não deletadas', async () => {
        (mockDb.select() as any).mockResolvedValue([mockArtwork]);

        const result = await repository.findAll();
        expect(result).toEqual([mockArtwork]);
    });

    it('save deve inserir uma nova obra', async () => {
        await repository.save(mockArtwork);
        expect(mockDb.insert).toHaveBeenCalledWith(artworks);
    });

    it('update deve atualizar uma obra existente', async () => {
        await repository.update(mockArtwork);
        expect(mockDb.update).toHaveBeenCalledWith(artworks);
    });

    it('softDelete deve marcar obra como deletada', async () => {
        await repository.softDelete('1');
        expect(mockDb.update).toHaveBeenCalledWith(artworks);
    });

    it('findUnsynced deve retornar obras sem syncedAt', async () => {
        (mockDb.select() as any).mockResolvedValue([mockArtwork]);
        const result = await repository.findUnsynced();
        expect(result).toEqual([mockArtwork]);
    });

    it('findNearby deve retornar obras filtradas por bounding box', async () => {
        (mockDb.select() as any).mockResolvedValue([mockArtwork]);
        const result = await repository.findNearby(-23.55, -46.63, 1000);
        expect(result).toEqual([mockArtwork]);
        expect(mockDb.select().from(artworks).where).toHaveBeenCalled();
    });
});
