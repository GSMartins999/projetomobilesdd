import { Photo } from '../entities/Inspection';
import { CameraService } from '../services/CameraService';

export interface CapturePhotoInput {
    artworkId: string;
    inspectionId: string;
    label: 'front' | 'detail' | 'context';
}

export class CapturePhotoUseCase {
    constructor(
        private readonly cameraService: CameraService,
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

        // 4. Criar Entidade Photo (sem salvar — o CreateInspectionUseCase salva com o inspectionId correto)
        const photo: Photo = {
            id: Math.random().toString(36).substring(7),
            artworkId: input.artworkId,
            inspectionId: input.inspectionId,
            localPath: processedPhoto.uri,
            remoteUrl: null,
            uploadStatus: 'pending',
            label: input.label,
            order: 0,
            deviceId: 'device-1',
            updatedAt: new Date().toISOString(),
            syncedAt: null,
            deletedAt: null,
        };

        // Nota: NÃO salvar aqui — as fotos são salvas pelo CreateInspectionUseCase
        // com o inspectionId definitivo gerado no momento de salvar a inspeção.

        return photo;
    }
}
