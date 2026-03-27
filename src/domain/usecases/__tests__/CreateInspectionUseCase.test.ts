import { CreateInspectionUseCase } from '../CreateInspectionUseCase';
import { InspectionRepository } from '../../repositories/InspectionRepository';
import { ArtworkRepository } from '../../repositories/ArtworkRepository';
import { PhotoRepository } from '../../repositories/PhotoRepository';
import { Artwork } from '../../entities/Artwork';
import { Inspection } from '../../entities/Inspection';

const makeMockArtworkRepository = (artwork: Artwork | null): jest.Mocked<ArtworkRepository> => ({
    findById: jest.fn().mockResolvedValue(artwork),
    update: jest.fn(),
    findAll: jest.fn(),
    findNearby: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    findUnsynced: jest.fn(),
} as any);

const makeMockInspectionRepository = (): jest.Mocked<InspectionRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findByArtworkId: jest.fn(),
    softDelete: jest.fn(),
    findUnsynced: jest.fn(),
});

const makeMockPhotoRepository = (): jest.Mocked<PhotoRepository> => ({
    save: jest.fn(),
    findByInspectionId: jest.fn(),
    updateUploadStatus: jest.fn(),
    findUnsyncedPhotos: jest.fn(),
    softDelete: jest.fn(),
});

describe('CreateInspectionUseCase', () => {
    const mockArtwork: Artwork = {
        id: 'art-1', displayId: 'ART-2026-001', name: 'Mural', artist: null,
        type: 'mural', conservationStatus: 'good', notes: null,
        latitude: 0, longitude: 0, address: null, deviceId: 'dev',
        updatedAt: '2026-01-01', syncedAt: null, deletedAt: null,
    };

    const validForm = {
        structuralCondition: 'Ok',
        surfaceCondition: 'Sujo',
        deteriorationAgents: ['umidade'],
        urgencyLevel: 2 as const,
        recommendation: 'Limpar',
        statusAtVisit: 'fair' as const,
    };

    it('deve criar inspeção e atualizar status da obra', async () => {
        const artRepo = makeMockArtworkRepository(mockArtwork);
        const inspRepo = makeMockInspectionRepository();
        const photoRepo = makeMockPhotoRepository();

        const useCase = new CreateInspectionUseCase(
            inspRepo, artRepo, photoRepo,
            () => 'insp-1', () => 'photo-1', () => 'dev-1', () => '2026-03-27'
        );

        const result = await useCase.execute({
            artworkId: 'art-1',
            technicalForm: validForm,
            photos: [{ localPath: 'path/to/img.jpg', label: 'front' }]
        });

        expect(inspRepo.save).toHaveBeenCalled();
        expect(artRepo.update).toHaveBeenCalledWith(expect.objectContaining({
            conservationStatus: 'fair',
            updatedAt: '2026-03-27'
        }));
        expect(photoRepo.save).toHaveBeenCalledTimes(1);
        expect(result.id).toBe('insp-1');
    });

    it('deve falhar se a obra não existir', async () => {
        const artRepo = makeMockArtworkRepository(null);
        const inspRepo = makeMockInspectionRepository();
        const useCase = new CreateInspectionUseCase(inspRepo, artRepo, {} as any, () => 'i', () => 'p', () => 'd');

        await expect(useCase.execute({ artworkId: 'invalid', technicalForm: validForm }))
            .rejects.toThrow('Obra não encontrada');
    });

    it('deve falhar se o formulário for inválido', async () => {
        const artRepo = makeMockArtworkRepository(mockArtwork);
        const useCase = new CreateInspectionUseCase({} as any, artRepo, {} as any, () => 'i', () => 'p', () => 'd');

        await expect(useCase.execute({
            artworkId: 'art-1',
            technicalForm: { ...validForm, urgencyLevel: 99 } as any
        })).rejects.toThrow();
    });
});
