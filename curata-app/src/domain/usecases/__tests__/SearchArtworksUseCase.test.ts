import { SearchArtworksUseCase } from '../SearchArtworksUseCase';
import { Artwork } from '../../entities/Artwork';

const mockArtwork: Artwork = {
    id: '1', displayId: 'A1', name: 'Monumento', artist: 'Silva', type: 'sculpture',
    conservationStatus: 'good', latitude: 0, longitude: 0, address: 'Praça da Sé',
    deviceId: 'd', updatedAt: '2026-01-01', syncedAt: null, deletedAt: null,
    notes: null,
};

const makeRepo = (artworks: Artwork[] = [mockArtwork]) => ({
    findAll: jest.fn().mockResolvedValue(artworks),
} as any);

describe('SearchArtworksUseCase', () => {
    it('deve filtrar por nome (case insensitive)', async () => {
        const useCase = new SearchArtworksUseCase(makeRepo());
        const result = await useCase.execute({ query: 'monu' });
        expect(result).toHaveLength(1);

        const noResult = await useCase.execute({ query: 'Inexistente' });
        expect(noResult).toHaveLength(0);
    });

    it('deve filtrar por artist', async () => {
        const useCase = new SearchArtworksUseCase(makeRepo());
        const result = await useCase.execute({ query: 'silva' });
        expect(result).toHaveLength(1);
        expect(result[0].artist).toBe('Silva');
    });

    it('deve filtrar por address', async () => {
        const useCase = new SearchArtworksUseCase(makeRepo());
        const result = await useCase.execute({ query: 'praça' });
        expect(result).toHaveLength(1);
    });

    it('deve retornar tudo quando não há filtros', async () => {
        const useCase = new SearchArtworksUseCase(makeRepo());
        const result = await useCase.execute({});
        expect(result).toHaveLength(1);
    });

    it('deve filtrar por tipo e estado combinados', async () => {
        const useCase = new SearchArtworksUseCase(makeRepo());

        const match = await useCase.execute({ type: 'sculpture', conservationStatus: 'good' });
        expect(match).toHaveLength(1);

        const noMatch = await useCase.execute({ type: 'painting', conservationStatus: 'good' });
        expect(noMatch).toHaveLength(0);
    });

    it('não deve quebrar quando artist e address são null', async () => {
        const artworkWithNulls: Artwork = {
            ...mockArtwork, id: '2', artist: null, address: null,
        };
        const useCase = new SearchArtworksUseCase(makeRepo([artworkWithNulls]));
        const result = await useCase.execute({ query: 'monumento' });
        // name matches
        expect(result).toHaveLength(1);

        const noMatch = await useCase.execute({ query: 'silva' }); // artist null
        expect(noMatch).toHaveLength(0);
    });

    it('deve filtrar só por conservationStatus', async () => {
        const useCase = new SearchArtworksUseCase(makeRepo());
        const match = await useCase.execute({ conservationStatus: 'good' });
        expect(match).toHaveLength(1);

        const noMatch = await useCase.execute({ conservationStatus: 'urgent' });
        expect(noMatch).toHaveLength(0);
    });
});
