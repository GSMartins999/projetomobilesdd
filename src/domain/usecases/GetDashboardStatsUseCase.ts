import { ArtworkRepository } from '../repositories/ArtworkRepository';
import { ConservationStatus } from '../entities/Artwork';

export interface DashboardStats {
    totalArtworks: number;
    countByStatus: Record<ConservationStatus, number>;
    totalUnsynced: number;
    criticalPendingInspections: number;
}

export class GetDashboardStatsUseCase {
    constructor(private readonly artworkRepository: ArtworkRepository) { }

    async execute(): Promise<DashboardStats> {
        const artworks = await this.artworkRepository.findAll();
        const unsynced = await this.artworkRepository.findUnsynced();

        const stats: DashboardStats = {
            totalArtworks: artworks.length,
            totalUnsynced: unsynced.length,
            criticalPendingInspections: 0,
            countByStatus: {
                good: 0,
                fair: 0,
                poor: 0,
                urgent: 0,
                unknown: 0
            }
        };

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        artworks.forEach(art => {
            stats.countByStatus[art.conservationStatus]++;

            // Critério: status poor/urgent e não atualizado nos últimos 30 dias
            if ((art.conservationStatus === 'poor' || art.conservationStatus === 'urgent') &&
                new Date(art.updatedAt) < thirtyDaysAgo) {
                stats.criticalPendingInspections++;
            }
        });

        return stats;
    }
}
