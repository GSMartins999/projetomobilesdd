import { GetDashboardStatsUseCase } from '../GetDashboardStatsUseCase';

describe('GetDashboardStatsUseCase', () => {
    it('deve calcular estatísticas corretamente', async () => {
        const mockArtworks = [
            { id: '1', conservationStatus: 'good', updatedAt: new Date().toISOString() },
            { id: '2', conservationStatus: 'urgent', updatedAt: new Date(2020, 1, 1).toISOString() },
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
        expect(stats.criticalPendingInspections).toBe(1); // Obra 2 é urgente e antiga
    });
});
