import { CreateArtworkUseCase } from '../domain/usecases/CreateArtworkUseCase';
import { ArtworkRepository } from '../domain/repositories/ArtworkRepository';
import { PhotoRepository } from '../domain/repositories/PhotoRepository';
import { Artwork } from '../domain/entities/Artwork';

describe('CreateArtworkUseCase', () => {
    let mockArtworkRepo: jest.Mocked<ArtworkRepository>;
    let mockPhotoRepo: jest.Mocked<PhotoRepository>;
    let useCase: CreateArtworkUseCase;

    beforeEach(() => {
        mockArtworkRepo = {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn(),
            findNearby: jest.fn(),
            save: jest.fn().mockResolvedValue(undefined),
            update: jest.fn(),
            softDelete: jest.fn(),
            findUnsynced: jest.fn(),
        };

        mockPhotoRepo = {
            findByInspectionId: jest.fn(),
            findByArtworkId: jest.fn(),
            findById: jest.fn(),
            save: jest.fn().mockResolvedValue(undefined),
            update: jest.fn(),
            updateUploadStatus: jest.fn(),
            findUnsyncedPhotos: jest.fn(),
            findUnsynced: jest.fn(),
            softDelete: jest.fn(),
        };

        useCase = new CreateArtworkUseCase(
            mockArtworkRepo,
            () => 'device-123',
            () => 'uuid-123',
            () => '2026-01-01T00:00:00.000Z',
            mockPhotoRepo
        );
    });

    it('deve salvar a obra e uma foto inicial caso photoLocalPath seja provido', async () => {
        const input = {
            name: 'Mona Lisa',
            type: 'painting' as const,
            conservationStatus: 'good' as const,
            photoLocalPath: 'file:///local/photo.jpg',
        };

        const result = await useCase.execute(input);

        expect(result.artwork.name).toBe('Mona Lisa');
        expect(mockArtworkRepo.save).toHaveBeenCalledTimes(1);
        expect(mockPhotoRepo.save).toHaveBeenCalledTimes(1);
        expect(mockPhotoRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            artworkId: 'uuid-123',
            localPath: 'file:///local/photo.jpg',
            uploadStatus: 'pending',
            label: 'front',
        }));
    });

    it('não deve chamar photoRepository.save caso photoLocalPath não seja provido', async () => {
        const input = {
            name: 'David',
            type: 'sculpture' as const,
            conservationStatus: 'good' as const,
        };

        await useCase.execute(input);

        expect(mockArtworkRepo.save).toHaveBeenCalledTimes(1);
        expect(mockPhotoRepo.save).not.toHaveBeenCalled();
    });
});
