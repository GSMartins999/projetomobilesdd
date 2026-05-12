import { CapturePhotoUseCase } from '../CapturePhotoUseCase';
import { CameraService } from '../../services/CameraService';

describe('CapturePhotoUseCase', () => {
    let useCase: CapturePhotoUseCase;
    let mockCameraService: jest.Mocked<CameraService>;

    beforeEach(() => {
        mockCameraService = {
            requestPermissions: jest.fn(),
            hasPermissions: jest.fn(),
            takePicture: jest.fn(),
            processImage: jest.fn(),
            setCameraRef: jest.fn(),
        } as any;

        useCase = new CapturePhotoUseCase(mockCameraService);
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

    it('should capture, process and return photo entity without saving', async () => {
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
        expect(result.localPath).toBe('file://compressed.jpg');
        expect(result.label).toBe('front');
        expect(result.artworkId).toBe('a1');
        expect(result.inspectionId).toBe('i1');
    });
});

