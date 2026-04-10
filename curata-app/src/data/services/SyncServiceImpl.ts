import { SupabaseClient } from '@supabase/supabase-js';
import { ArtworkRepository } from '../../domain/repositories/ArtworkRepository';
import { InspectionRepository } from '../../domain/repositories/InspectionRepository';
import { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import { SyncService, SyncResult } from '../../domain/services/SyncService';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export class SyncServiceImpl implements SyncService {
    constructor(
        private readonly artworkRepo: ArtworkRepository,
        private readonly inspectionRepo: InspectionRepository,
        private readonly photoRepo: PhotoRepository,
        private readonly supabase: SupabaseClient
    ) { }

    async sync(): Promise<SyncResult> {
        const result: SyncResult = { uploadedCount: 0, downloadedCount: 0, errors: [] };

        try {
            // 1. Upload de Fotos (Binários) pendentes
            await this.uploadPendingPhotos(result);

            // 2. Sincronizar Artworks (LWW)
            await this.syncTable('artworks', this.artworkRepo, result);

            // 3. Sincronizar Inspections
            await this.syncTable('inspections', this.inspectionRepo, result);

            // 4. Sincronizar Photos (Metadata)
            await this.syncTable('photos', this.photoRepo, result);

        } catch (error: any) {
            result.errors.push(error.message);
        }

        return result;
    }

    private async syncTable(tableName: string, repo: any, result: SyncResult) {
        // A. Upload: Local -> Server (unsynced items)
        const unsynced = await repo.findUnsynced();
        if (unsynced.length > 0) {
            const { error } = await this.supabase.from(tableName).upsert(unsynced.map((item: any) => ({
                ...item,
                syncedAt: new Date().toISOString() // Marcar como sincronizado no servidor
            })));
            if (error) throw new Error(`Upload ${tableName} failed: ${error.message}`);

            // Atualizar localmente
            for (const item of unsynced) {
                await repo.update({ ...item, syncedAt: new Date().toISOString() });
            }
            result.uploadedCount += unsynced.length;
        }

        // B. Download: Server -> Local (newer items)
        // No MVP, buscamos tudo que mudou desde o último sync (simplificado p/ v1)
        const { data: remoteData, error: dlError } = await this.supabase
            .from(tableName)
            .select('*')
            .gt('updated_at', '2020-01-01'); // v2: Usar last_sync_timestamp persistido

        if (dlError) throw new Error(`Download ${tableName} failed: ${dlError.message}`);

        if (remoteData) {
            for (const remoteItem of remoteData) {
                const localItem = await repo.findById(remoteItem.id);
                if (!localItem || new Date(remoteItem.updated_at) > new Date(localItem.updatedAt)) {
                    // LWW: remoto é mais novo ou não existe localmente
                    await repo.save(remoteItem);
                    result.downloadedCount++;
                }
            }
        }
    }

    private async uploadPendingPhotos(result: SyncResult) {
        const pendingPhotos = await this.photoRepo.findUnsyncedPhotos();
        for (const photo of pendingPhotos) {
            try {
                const fileBase64 = await FileSystem.readAsStringAsync(photo.localPath, { encoding: FileSystem.EncodingType.Base64 });
                const filePath = `photos/${photo.artworkId}/${photo.id}.jpg`;

                const { data, error } = await this.supabase.storage
                    .from('curata-media')
                    .upload(filePath, decode(fileBase64), { contentType: 'image/jpeg', upscale: false });

                if (error) throw error;

                const { data: { publicUrl } } = this.supabase.storage.from('curata-media').getPublicUrl(filePath);
                await this.photoRepo.updateUploadStatus(photo.id, 'synced', publicUrl);
                result.uploadedCount++;
            } catch (err: any) {
                result.errors.push(`Photo upload failed (${photo.id}): ${err.message}`);
            }
        }
    }
}
