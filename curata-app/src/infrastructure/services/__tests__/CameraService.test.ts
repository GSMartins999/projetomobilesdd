import { CameraServiceImpl } from '../CameraServiceImpl';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('expo-camera', () => ({
    Camera: {
        getCameraPermissionsAsync: jest.fn(),
        requestCameraPermissionsAsync: jest.fn(),
    }
}));

jest.mock('expo-image-manipulator', () => ({
    manipulateAsync: jest.fn(),
    SaveFormat: { JPEG: 'jpeg' },
}));

describe('CameraServiceImpl', () => {
    let service: CameraServiceImpl;

    beforeEach(() => {
        service = new CameraServiceImpl();
        jest.clearAllMocks();
    });

    it('should check permissions', async () => {
        (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
        const result = await service.hasPermissions();
        expect(result).toBe(true);
    });

    it('should request permissions', async () => {
        (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
        const result = await service.requestPermissions();
        expect(result).toBe(true);
    });

    it('should throw error if camera ref is not set', async () => {
        await expect(service.takePicture()).rejects.toThrow('Câmera não inicializada');
    });

    it('should take picture when ref is set', async () => {
        const mockRef = {
            takePictureAsync: jest.fn().mockResolvedValueOnce({
                uri: 'file://raw.jpg',
                width: 1000,
                height: 800
            })
        };
        service.setCameraRef(mockRef);
        const result = await service.takePicture();
        expect(mockRef.takePictureAsync).toHaveBeenCalled();
        expect(result.uri).toBe('file://raw.jpg');
    });

    it('should process image with compression', async () => {
        const mockResult = { uri: 'file://comp.jpg', width: 1200, height: 900 };
        (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValueOnce(mockResult);

        const result = await service.processImage('file://raw.jpg');

        expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
            'file://raw.jpg',
            [{ resize: { width: 1200 } }],
            expect.any(Object)
        );
        expect(result.uri).toBe('file://comp.jpg');
    });
});
