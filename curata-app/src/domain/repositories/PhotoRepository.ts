import { Photo } from '../entities/Inspection';

export interface PhotoRepository {
    findByInspectionId(inspectionId: string): Promise<Photo[]>;
    save(photo: Photo): Promise<void>;
    updateUploadStatus(id: string, status: Photo['uploadStatus'], remoteUrl?: string): Promise<void>;
    findUnsyncedPhotos(): Promise<Photo[]>;
    softDelete(id: string): Promise<void>;
}
