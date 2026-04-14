import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraService, PhotoCaptureResult } from '../../domain/services/CameraService';

export class CameraServiceImpl implements CameraService {
    private cameraRef: any = null;

    setCameraRef(ref: any) {
        this.cameraRef = ref;
    }

    async hasPermissions(): Promise<boolean> {
        const { status } = await Camera.getCameraPermissionsAsync();
        return status === 'granted';
    }

    async requestPermissions(): Promise<boolean> {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return status === 'granted';
    }

    async takePicture(): Promise<PhotoCaptureResult> {
        if (!this.cameraRef) {
            throw new Error('Câmera não inicializada. Certifique-se de que o componente Camera está montado.');
        }

        const result = await this.cameraRef.takePictureAsync({
            quality: 0.8,
            skipProcessing: false,
        });

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
        };
    }

    async processImage(uri: string): Promise<PhotoCaptureResult> {
        // REQ: Mandatory image compression (1200px max width/height)
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1200 } }], // ImageManipulator handles aspect ratio
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
        };
    }
}
