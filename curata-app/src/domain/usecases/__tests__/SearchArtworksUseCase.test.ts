import { SearchArtworksUseCase } from '../SearchArtworksUseCase';
import { Artwork } from '../../entities/Artwork';

const mockArtwork: Artwork = {
    id: '1', displayId: 'A1', name: 'Monumento', artist: 'Silva', type: 'sculpture',
    conservationStatus: 'good', latitude: 0, longitude: 0, address: 'Praça da Sé',
    deviceId: 'd', updatedAt: '2026-01-01', syncedAt: null, deletedAt: null
};

describe('SearchArtworksUseCase', () => {
    it('deve filtrar por nome', async () => {
        const repo = { findAll: jest.fn().mockResolvedValue([mockArtwork]) } as any;
        const useCase = new SearchArtworksUseCase(repo);
        const result = await useCase.execute({ query: 'Monu' });
        expect(result).toHaveLength(1);

        const noResult = await useCase.execute({ query: 'Inexistente' });
        expect(noResult).toHaveLength(0);
    });

    it('deve filtrar por tipo e estado combinados', async () => {
        const repo = { findAll: jest.fn().mockResolvedValue([mockArtwork]) } as any;
        const useCase = new SearchArtworksUseCase(repo);

        const match = await useCase.execute({ type: 'sculpture', conservationStatus: 'good' });
        expect(match).toHaveLength(1);

        const noMatch = await useCase.execute({ type: 'painting', conservationStatus: 'good' });
        expect(noMatch).toHaveLength(0);
    });
});
