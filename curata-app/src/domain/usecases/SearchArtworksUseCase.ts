import { Artwork } from '../entities/Artwork';
import { ArtworkRepository } from '../repositories/ArtworkRepository';

export interface SearchFilters {
    query?: string;
    type?: string;
    conservationStatus?: string;
}

export class SearchArtworksUseCase {
    constructor(private readonly artworkRepository: ArtworkRepository) { }

    async execute(filters: SearchFilters): Promise<Artwork[]> {
        const all = await this.artworkRepository.findAll();

        return all.filter(art => {
            let matches = true;

            if (filters.query) {
                const q = filters.query.toLowerCase();
                matches = matches && (
                    art.name.toLowerCase().includes(q) ||
                    (art.artist?.toLowerCase().includes(q) ?? false) ||
                    (art.address?.toLowerCase().includes(q) ?? false)
                );
            }

            if (filters.type) {
                matches = matches && art.type === filters.type;
            }

            if (filters.conservationStatus) {
                matches = matches && art.conservationStatus === filters.conservationStatus;
            }

            return matches;
        });
    }
}
