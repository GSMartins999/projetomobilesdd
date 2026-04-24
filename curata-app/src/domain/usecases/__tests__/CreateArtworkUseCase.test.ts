import { CreateArtworkUseCase } from '../CreateArtworkUseCase';
import { Artwork } from '../../entities/Artwork';
import { ArtworkRepository } from '../../repositories/ArtworkRepository';

// Mock do repositório
const makeMockRepository = (existingArtworks: Artwork[] = []): jest.Mocked<ArtworkRepository> => ({
    findAll: jest.fn().mockResolvedValue(existingArtworks),
    findById: jest.fn().mockResolvedValue(null),
    findNearby: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    softDelete: jest.fn().mockResolvedValue(undefined),
    findUnsynced: jest.fn().mockResolvedValue([]),
});

const FIXED_UUID = 'test-uuid-1234';
const FIXED_DEVICE_ID = 'device-001';
const FIXED_NOW = '2026-03-27T20:00:00.000Z';

const makeUseCase = (existingArtworks: Artwork[] = []) => {
    const repo = makeMockRepository(existingArtworks);
    const useCase = new CreateArtworkUseCase(
        repo,
        () => FIXED_DEVICE_ID,
        () => FIXED_UUID,
        () => FIXED_NOW,
    );
    return { useCase, repo };
};

describe('CreateArtworkUseCase', () => {
    it('cria obra com UUID gerado e synced_at = null', async () => {
        const { useCase, repo } = makeUseCase();
        const result = await useCase.execute({
            name: 'Mural do Mercadão',
            type: 'mural',
            conservationStatus: 'fair',
        });

        expect(result.artwork.id).toBe(FIXED_UUID);
        expect(result.artwork.syncedAt).toBeNull();
        expect(result.artwork.displayId).toBeNull();
        expect(result.artwork.deviceId).toBe(FIXED_DEVICE_ID);
        expect(result.artwork.updatedAt).toBe(FIXED_NOW);
        expect(repo.save).toHaveBeenCalledWith(result.artwork);
    });

    it('lança erro quando nome está vazio', async () => {
        const { useCase } = makeUseCase();
        await expect(
            useCase.execute({ name: '  ', type: 'mural', conservationStatus: 'fair' }),
        ).rejects.toThrow('Nome da obra é obrigatório');
    });

    it('não detecta duplicatas quando obra não tem coordenadas', async () => {
        const existing: Artwork = {
            id: 'existing-1', displayId: null, name: 'Obra vizinha', artist: null,
            type: 'painting', conservationStatus: 'good', notes: null,
            latitude: -23.5505, longitude: -46.6333, address: null,
            deviceId: FIXED_DEVICE_ID, updatedAt: FIXED_NOW, syncedAt: null, deletedAt: null,
        };
        const { useCase } = makeUseCase([existing]);
        const result = await useCase.execute({
            name: 'Nova Obra', type: 'mural', conservationStatus: 'fair',
            // sem latitude/longitude
        });
        expect(result.nearbyArtworks).toHaveLength(0);
    });

    it('detecta duplicata quando obra está a menos de 30m', async () => {
        const existing: Artwork = {
            id: 'existing-1', displayId: null, name: 'Obra próxima', artist: null,
            type: 'painting', conservationStatus: 'good', notes: null,
            latitude: -23.5505, longitude: -46.6333, address: null,
            deviceId: FIXED_DEVICE_ID, updatedAt: FIXED_NOW, syncedAt: null, deletedAt: null,
        };
        const { useCase } = makeUseCase([existing]);
        const result = await useCase.execute({
            name: 'Nova Obra',
            type: 'mural',
            conservationStatus: 'fair',
            latitude: -23.55052,   // ~2m de distância
            longitude: -46.63332,
        });
        expect(result.nearbyArtworks).toHaveLength(1);
        expect(result.nearbyArtworks[0].id).toBe('existing-1');
    });

    it('não detecta duplicata quando obra está a 30m ou mais', async () => {
        const existing: Artwork = {
            id: 'existing-far', displayId: null, name: 'Obra distante', artist: null,
            type: 'painting', conservationStatus: 'good', notes: null,
            latitude: -23.5505, longitude: -46.6333, address: null,
            deviceId: FIXED_DEVICE_ID, updatedAt: FIXED_NOW, syncedAt: null, deletedAt: null,
        };
        const { useCase } = makeUseCase([existing]);
        const result = await useCase.execute({
            name: 'Nova Obra',
            type: 'mural',
            conservationStatus: 'fair',
            latitude: -23.5508,    // ~33m ao norte
            longitude: -46.6333,
        });
        expect(result.nearbyArtworks).toHaveLength(0);
    });

    it('não considera obras deletadas como duplicatas', async () => {
        const deleted: Artwork = {
            id: 'deleted-1', displayId: null, name: 'Obra deletada', artist: null,
            type: 'painting', conservationStatus: 'good', notes: null,
            latitude: -23.5505, longitude: -46.6333, address: null,
            deviceId: FIXED_DEVICE_ID, updatedAt: FIXED_NOW, syncedAt: null,
            deletedAt: '2026-01-01T00:00:00.000Z',
        };
        const { useCase } = makeUseCase([deleted]);
        const result = await useCase.execute({
            name: 'Nova Obra', type: 'mural', conservationStatus: 'fair',
            latitude: -23.5505, longitude: -46.6333,
        });
        expect(result.nearbyArtworks).toHaveLength(0);
    });

    it('deve usar o provedor de data padrão se nenhum for passado no construtor', async () => {
        const repo = makeMockRepository();
        const useCase = new CreateArtworkUseCase(
            repo,
            () => FIXED_DEVICE_ID,
            () => FIXED_UUID
            // não passamos o quarto parâmetro (now)
        );
        const result = await useCase.execute({
            name: 'Obra Data Padrão',
            type: 'painting',
            conservationStatus: 'good'
        });
        expect(result.artwork.updatedAt).toBeDefined();
        expect(typeof result.artwork.updatedAt).toBe('string');
    });
});
