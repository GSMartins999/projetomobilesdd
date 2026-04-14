import { CapturePhotoUseCase } from '../CapturePhotoUseCase';
import { CameraService } from '../../services/CameraService';
import { PhotoRepository } from '../../repositories/PhotoRepository';

describe('CapturePhotoUseCase', () => {
    let useCase: CapturePhotoUseCase;
    let mockCameraService: jest.Mocked<CameraService>;
    let mockPhotoRepo: jest.Mocked<PhotoRepository>;

    beforeEach(() => {
        mockCameraService = {
            requestPermissions: jest.fn(),
            hasPermissions: jest.fn(),
            takePicture: jest.fn(),
            processImage: jest.fn(),
        };

        mockPhotoRepo = {
            findByInspectionId: jest.fn(),
            save: jest.fn(),
            updateUploadStatus: jest.fn(),
            findUnsyncedPhotos: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        useCase = new CapturePhotoUseCase(mockCameraService, mockPhotoRepo);
    });

    it('should throw error if camera permission is denied', async () => {
        mockCameraService.hasPermissions.mockResolvedValueOnce(false);
        mockCameraService.requestPermissions.mockResolvedValueOnce(false);

        await expect(useCase.execute({
            artworkId: 'a1',
            inspectionId: 'i1',
            label: 'front'
        })).rejects.toThrow('Permissão de câmera negada');
    });

    it('should capture, process and save photo successfully', async () => {
        mockCameraService.hasPermissions.mockResolvedValueOnce(true);
        mockCameraService.takePicture.mockResolvedValueOnce({
            uri: 'file://raw.jpg',
            width: 4000,
            height: 3000,
        });
        mockCameraService.processImage.mockResolvedValueOnce({
            uri: 'file://compressed.jpg',
            width: 1200,
            height: 900,
        });

        const result = await useCase.execute({
            artworkId: 'a1',
            inspectionId: 'i1',
            label: 'front'
        });

        expect(mockCameraService.takePicture).toHaveBeenCalled();
        expect(mockCameraService.processImage).toHaveBeenCalledWith('file://raw.jpg');
        expect(mockPhotoRepo.save).toHaveBeenCalled();
        expect(result.localPath).toBe('file://compressed.jpg');
        expect(result.label).toBe('front');
    });
});
