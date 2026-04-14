import { Photo } from '../entities/Inspection';
import { CameraService } from '../services/CameraService';
import { PhotoRepository } from '../repositories/PhotoRepository';

export interface CapturePhotoInput {
    artworkId: string;
    inspectionId: string;
    label: 'front' | 'detail' | 'context';
}

export class CapturePhotoUseCase {
    constructor(
        private readonly cameraService: CameraService,
        private readonly photoRepo: PhotoRepository
    ) { }

    async execute(input: CapturePhotoInput): Promise<Photo> {
        // 1. Verificar permissões
        let hasPermission = await this.cameraService.hasPermissions();
        if (!hasPermission) {
            hasPermission = await this.cameraService.requestPermissions();
        }

        if (!hasPermission) {
            throw new Error('Permissão de câmera negada');
        }

        // 2. Capturar foto
        const rawPhoto = await this.cameraService.takePicture();

        // 3. Processar/Comprimir (REQ: 1200px)
        const processedPhoto = await this.cameraService.processImage(rawPhoto.uri);

        // 4. Criar Entidade Photo
        const photo: Photo = {
            id: Math.random().toString(36).substring(7), // v1: simplificado
            artworkId: input.artworkId,
            inspectionId: input.inspectionId,
            localPath: processedPhoto.uri,
            remoteUrl: null,
            uploadStatus: 'pending',
            label: input.label,
            order: 0, // v1: simplificado
            deviceId: 'device-1', // v1: simplificado
            updatedAt: new Date().toISOString(),
            syncedAt: null,
            deletedAt: null,
        };

        // 5. Salvar Metadata Localmente
        await this.photoRepo.save(photo);

        return photo;
    }
}
