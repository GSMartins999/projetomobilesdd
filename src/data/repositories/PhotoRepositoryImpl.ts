import { eq, and, isNull } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import { Photo } from '../../domain/entities/Inspection';
import { photos } from '../db/schema';
import * as schema from '../db/schema';

export class PhotoRepositoryImpl implements PhotoRepository {
    constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) { }

    async findByInspectionId(inspectionId: string): Promise<Photo[]> {
        const result = await this.db.select().from(photos).where(
            and(
                eq(photos.inspectionId, inspectionId),
                isNull(photos.deletedAt)
            )
        );
        return result as Photo[];
    }

    async save(photo: Photo): Promise<void> {
        await this.db.insert(photos).values({
            id: photo.id,
            inspectionId: photo.inspectionId,
            artworkId: photo.artworkId,
            localPath: photo.localPath,
            remoteUrl: photo.remoteUrl,
            uploadStatus: photo.uploadStatus,
            label: photo.label,
            order: photo.order,
            deviceId: photo.deviceId,
            updatedAt: photo.updatedAt,
            syncedAt: photo.syncedAt,
            deletedAt: photo.deletedAt,
        });
    }

    async updateUploadStatus(id: string, status: Photo['uploadStatus'], remoteUrl?: string): Promise<void> {
        await this.db.update(photos)
            .set({
                uploadStatus: status,
                remoteUrl: remoteUrl || null,
                updatedAt: new Date().toISOString()
            })
            .where(eq(photos.id, id));
    }

    async findUnsyncedPhotos(): Promise<Photo[]> {
        return await this.db.select().from(photos).where(
            and(
                eq(photos.uploadStatus, 'pending'),
                isNull(photos.deletedAt)
            )
        ) as Photo[];
    }

    async softDelete(id: string): Promise<void> {
        await this.db.update(photos)
            .set({
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .where(eq(photos.id, id));
    }
}
