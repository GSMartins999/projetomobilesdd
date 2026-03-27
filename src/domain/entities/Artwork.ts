export type ConservationStatus = 'good' | 'fair' | 'poor' | 'urgent' | 'unknown';
export type ArtworkType = 'painting' | 'sculpture' | 'mural' | 'tile' | 'relief' | 'other';

export interface Artwork {
    id: string;                      // UUID gerado no dispositivo
    displayId: string | null;        // ART-YYYY-XXXXX — gerado pelo servidor no 1º sync
    name: string;
    artist: string | null;
    type: ArtworkType;
    conservationStatus: ConservationStatus;
    notes: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;          // preenchido por geocoding reverso
    deviceId: string;
    updatedAt: string;               // ISO 8601 — timestamp da ação do usuário
    syncedAt: string | null;         // null se nunca sincronizado
    deletedAt: string | null;        // soft delete
}

export interface CreateArtworkInput {
    name: string;
    artist?: string;
    type: ArtworkType;
    conservationStatus: ConservationStatus;
    notes?: string;
    latitude?: number;
    longitude?: number;
    photoLocalPath?: string;
}
