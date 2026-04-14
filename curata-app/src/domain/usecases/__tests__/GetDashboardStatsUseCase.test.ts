import { GetDashboardStatsUseCase } from '../GetDashboardStatsUseCase';

const OLD_DATE = new Date(2020, 1, 1).toISOString();
const RECENT_DATE = new Date().toISOString();

describe('GetDashboardStatsUseCase', () => {
    it('deve calcular estatísticas com obra urgente antiga', async () => {
        const mockArtworks = [
            { id: '1', conservationStatus: 'good', updatedAt: RECENT_DATE },
            { id: '2', conservationStatus: 'urgent', updatedAt: OLD_DATE },
        ];
        const repo = {
            findAll: jest.fn().mockResolvedValue(mockArtworks),
            findUnsynced: jest.fn().mockResolvedValue([])
        } as any;

        const useCase = new GetDashboardStatsUseCase(repo);
        const stats = await useCase.execute();

        expect(stats.totalArtworks).toBe(2);
        expect(stats.countByStatus.good).toBe(1);
        expect(stats.countByStatus.urgent).toBe(1);
        expect(stats.criticalPendingInspections).toBe(1);
    });

    it('deve contar obra poor antiga como crítica', async () => {
        const mockArtworks = [
            { id: '1', conservationStatus: 'poor', updatedAt: OLD_DATE },
            { id: '2', conservationStatus: 'poor', updatedAt: RECENT_DATE }, // recente não conta
        ];
        const repo = {
            findAll: jest.fn().mockResolvedValue(mockArtworks),
            findUnsynced: jest.fn().mockResolvedValue([])
        } as any;

        const useCase = new GetDashboardStatsUseCase(repo);
        const stats = await useCase.execute();

        expect(stats.countByStatus.poor).toBe(2);
        expect(stats.criticalPendingInspections).toBe(1);
    });

    it('deve retornar zeros quando não há obras', async () => {
        const repo = {
            findAll: jest.fn().mockResolvedValue([]),
            findUnsynced: jest.fn().mockResolvedValue([])
        } as any;

        const useCase = new GetDashboardStatsUseCase(repo);
        const stats = await useCase.execute();

        expect(stats.totalArtworks).toBe(0);
        expect(stats.totalUnsynced).toBe(0);
        expect(stats.criticalPendingInspections).toBe(0);
        expect(stats.countByStatus.good).toBe(0);
        expect(stats.countByStatus.fair).toBe(0);
        expect(stats.countByStatus.poor).toBe(0);
        expect(stats.countByStatus.urgent).toBe(0);
    });

    it('deve refletir totalUnsynced corretamente', async () => {
        const mockArtworks = [
            { id: '1', conservationStatus: 'fair', updatedAt: RECENT_DATE },
        ];
        const unsyncedArtworks = [
            { id: '1', conservationStatus: 'fair', syncedAt: null, updatedAt: RECENT_DATE },
            { id: '2', conservationStatus: 'good', syncedAt: null, updatedAt: RECENT_DATE },
        ];
        const repo = {
            findAll: jest.fn().mockResolvedValue(mockArtworks),
            findUnsynced: jest.fn().mockResolvedValue(unsyncedArtworks)
        } as any;

        const useCase = new GetDashboardStatsUseCase(repo);
        const stats = await useCase.execute();

        expect(stats.totalUnsynced).toBe(2);
    });

    it('não deve contar obra urgent recente como crítica', async () => {
        const mockArtworks = [
            { id: '1', conservationStatus: 'urgent', updatedAt: RECENT_DATE },
        ];
        const repo = {
            findAll: jest.fn().mockResolvedValue(mockArtworks),
            findUnsynced: jest.fn().mockResolvedValue([])
        } as any;

        const useCase = new GetDashboardStatsUseCase(repo);
        const stats = await useCase.execute();

        expect(stats.criticalPendingInspections).toBe(0);
    });
});
