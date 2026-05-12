import { SupabaseClient } from '@supabase/supabase-js';
import { ArtworkRepository } from '../../domain/repositories/ArtworkRepository';
import { InspectionRepository } from '../../domain/repositories/InspectionRepository';
import { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import { SyncService, SyncResult } from '../../domain/services/SyncService';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

function mapToSnakeCase(tableName: string, item: any): any {
    const base = {
        id: item.id,
        device_id: item.deviceId,
        updated_at: item.updatedAt,
        synced_at: new Date().toISOString(),
        deleted_at: item.deletedAt,
    };
    if (tableName === 'artworks') {
        return {
            ...base,
            display_id: item.displayId,
            name: item.name,
            artist: item.artist,
            type: item.type,
            conservation_status: item.conservationStatus,
            notes: item.notes,
            latitude: item.latitude,
            longitude: item.longitude,
            address: item.address,
        };
    }
    if (tableName === 'inspections') {
        return {
            ...base,
            artwork_id: item.artworkId,
            technical_form: typeof item.technicalForm === 'string' ? item.technicalForm : JSON.stringify(item.technicalForm),
            form_version: item.formVersion,
        };
    }
    if (tableName === 'photos') {
        return {
            ...base,
            inspection_id: item.inspectionId,
            artwork_id: item.artworkId,
            local_path: item.localPath,
            remote_url: item.remoteUrl,
            upload_status: item.uploadStatus,
            label: item.label,
            order: item.order,
        };
    }
    return base;
}

function mapToCamelCase(tableName: string, item: any): any {
    const base = {
        id: item.id,
        deviceId: item.device_id,
        updatedAt: item.updated_at,
        syncedAt: item.synced_at,
        deletedAt: item.deleted_at,
    };
    if (tableName === 'artworks') {
        return {
            ...base,
            displayId: item.display_id,
            name: item.name,
            artist: item.artist,
            type: item.type,
            conservationStatus: item.conservation_status,
            notes: item.notes,
            latitude: item.latitude,
            longitude: item.longitude,
            address: item.address,
        };
    }
    if (tableName === 'inspections') {
        let parsedForm = item.technical_form;
        if (typeof parsedForm === 'string') {
            try { parsedForm = JSON.parse(parsedForm); } catch(e){}
        }
        return {
            ...base,
            artworkId: item.artwork_id,
            technicalForm: parsedForm,
            formVersion: item.form_version,
        };
    }
    if (tableName === 'photos') {
        return {
            ...base,
            inspectionId: item.inspection_id,
            artworkId: item.artwork_id,
            localPath: item.local_path,
            remoteUrl: item.remote_url,
            uploadStatus: item.upload_status,
            label: item.label,
            order: item.order,
        };
    }
    return base;
}

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
            const upsertPayload = unsynced.map((item: any) => mapToSnakeCase(tableName, item));
            const { error } = await this.supabase.from(tableName).upsert(upsertPayload);
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
                    await repo.save(mapToCamelCase(tableName, remoteItem));
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
                await this.photoRepo.updateUploadStatus(photo.id, 'done', publicUrl);
                result.uploadedCount++;
            } catch (err: any) {
                result.errors.push(`Photo upload failed (${photo.id}): ${err.message}`);
            }
        }
    }
}
