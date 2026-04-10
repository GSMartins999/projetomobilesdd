import { Inspection, CreateInspectionInput, PhotoLabel } from '../entities/Inspection';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { ArtworkRepository } from '../repositories/ArtworkRepository';
import { PhotoRepository } from '../repositories/PhotoRepository';
import { InspectionFormSchemaV1 } from '../schemas/InspectionFormSchema';

export interface CreateInspectionWithPhotosInput extends CreateInspectionInput {
    photos?: { localPath: string; label: PhotoLabel }[];
}

export class CreateInspectionUseCase {
    constructor(
        private readonly inspectionRepository: InspectionRepository,
        private readonly artworkRepository: ArtworkRepository,
        private readonly photoRepository: PhotoRepository,
        private readonly generateId: () => string,
        private readonly generatePhotoId: () => string,
        private readonly getDeviceId: () => string,
        private readonly now: () => string = () => new Date().toISOString(),
    ) { }

    async execute(input: CreateInspectionWithPhotosInput): Promise<Inspection> {
        // 1. Validação da Obra
        const artwork = await this.artworkRepository.findById(input.artworkId);
        if (!artwork) {
            throw new Error('Obra não encontrada');
        }

        // 2. Validação do Formulário (Zod)
        const formValidation = InspectionFormSchemaV1.safeParse(input.technicalForm);
        if (!formValidation.success) {
            throw new Error('Dados da inspeção inválidos: ' + formValidation.error.message);
        }

        const inspectionId = this.generateId();
        const timestamp = this.now();
        const deviceId = this.getDeviceId();

        const inspection: Inspection = {
            id: inspectionId,
            artworkId: input.artworkId,
            technicalForm: formValidation.data,
            formVersion: 1,
            deviceId,
            updatedAt: timestamp,
            syncedAt: null,
            deletedAt: null,
        };

        // 3. Salvar Fotos (se houver)
        if (input.photos && input.photos.length > 0) {
            for (let i = 0; i < input.photos.length; i++) {
                const p = input.photos[i];
                await this.photoRepository.save({
                    id: this.generatePhotoId(),
                    inspectionId,
                    artworkId: input.artworkId,
                    localPath: p.localPath,
                    remoteUrl: null,
                    uploadStatus: 'pending',
                    label: p.label,
                    order: i,
                    deviceId,
                    updatedAt: timestamp,
                    syncedAt: null,
                    deletedAt: null,
                });
            }
        }

        // 4. Salvar Inspeção
        await this.inspectionRepository.save(inspection);

        // 5. Atualizar Status da Obra-Mãe
        artwork.conservationStatus = formValidation.data.statusAtVisit;
        artwork.updatedAt = timestamp;
        artwork.syncedAt = null; // Marcar para re-sync
        await this.artworkRepository.update(artwork);

        return inspection;
    }
}
