import { Inspection, CreateInspectionInput } from '../entities/Inspection';

export interface InspectionRepository {
    findByArtworkId(artworkId: string): Promise<Inspection[]>;
    findById(id: string): Promise<Inspection | null>;
    save(inspection: Inspection): Promise<void>;
    softDelete(id: string): Promise<void>;
    findUnsynced(): Promise<Inspection[]>;
}
