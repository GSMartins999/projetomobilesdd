import { Photo } from '../entities/Inspection';

export interface PhotoRepository {
    findByInspectionId(inspectionId: string): Promise<Photo[]>;
    findByArtworkId(artworkId: string): Promise<Photo[]>;
    findById(id: string): Promise<Photo | null>;
    save(photo: Photo): Promise<void>;
    update(photo: Photo): Promise<void>;
    updateUploadStatus(id: string, status: Photo['uploadStatus'], remoteUrl?: string): Promise<void>;
    findUnsyncedPhotos(): Promise<Photo[]>;
    findUnsynced(): Promise<Photo[]>;
    softDelete(id: string): Promise<void>;
}
