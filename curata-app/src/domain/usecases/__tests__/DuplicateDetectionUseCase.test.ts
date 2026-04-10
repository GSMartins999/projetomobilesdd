import { DuplicateDetectionUseCase } from '../DuplicateDetectionUseCase';
import { Artwork } from '../../entities/Artwork';
import { ArtworkRepository } from '../../repositories/ArtworkRepository';

const makeMockRepository = (existingArtworks: Artwork[] = []): jest.Mocked<ArtworkRepository> => ({
    findAll: jest.fn().mockResolvedValue(existingArtworks),
    findById: jest.fn().mockResolvedValue(null),
    findNearby: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    softDelete: jest.fn().mockResolvedValue(undefined),
    findUnsynced: jest.fn().mockResolvedValue([]),
});

describe('DuplicateDetectionUseCase', () => {
    const existing: Artwork = {
        id: 'existing-1', displayId: null, name: 'Obra Próxima', artist: null,
        type: 'painting', conservationStatus: 'good', notes: null,
        latitude: -23.5505, longitude: -46.6333, address: null,
        deviceId: 'dev-1', updatedAt: '2026-01-01', syncedAt: null, deletedAt: null,
    };

    it('deve retornar a obra se estiver a menos de 30m', async () => {
        const repo = makeMockRepository([existing]);
        const useCase = new DuplicateDetectionUseCase(repo);
        const result = await useCase.execute(-23.55052, -46.63332); // ~2m de distância
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('existing-1');
    });

    it('não deve retornar nada se estiver a mais de 30m', async () => {
        const repo = makeMockRepository([existing]);
        const useCase = new DuplicateDetectionUseCase(repo);
        const result = await useCase.execute(-23.5508, -46.6333); // ~33m de distância
        expect(result).toHaveLength(0);
    });

    it('deve ignorar obras deletadas', async () => {
        const deleted = { ...existing, id: 'deleted-1', deletedAt: '2026-01-01' };
        const repo = makeMockRepository([deleted]);
        const useCase = new DuplicateDetectionUseCase(repo);
        const result = await useCase.execute(-23.5505, -46.6333);
        expect(result).toHaveLength(0);
    });
});
