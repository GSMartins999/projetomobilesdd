import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraService, PhotoCaptureResult } from '../../domain/services/CameraService';

export class CameraServiceImpl implements CameraService {
    private cameraRef: CameraView | null = null;

    setCameraRef(ref: CameraView | null) {
        this.cameraRef = ref;
    }

    async hasPermissions(): Promise<boolean> {
        // useCameraPermissions é um hook — não pode ser chamado aqui.
        // Usamos a API imperativa do módulo expo-modules-core via getCameraPermissionsAsync
        // que ainda está disponível fora de componentes React.
        const { Camera } = await import('expo-camera');
        const { status } = await (Camera as any).getCameraPermissionsAsync?.() ??
            { status: 'undetermined' };
        return status === 'granted';
    }

    async requestPermissions(): Promise<boolean> {
        const { Camera } = await import('expo-camera');
        const { status } = await (Camera as any).requestCameraPermissionsAsync?.() ??
            { status: 'denied' };
        return status === 'granted';
    }

    async takePicture(): Promise<PhotoCaptureResult> {
        if (!this.cameraRef) {
            throw new Error('Câmera não inicializada. Certifique-se de que o componente Câmera está montado.');
        }

        const result = await this.cameraRef.takePictureAsync({
            quality: 0.8,
            skipProcessing: false,
        });

        if (!result) {
            throw new Error('Falha ao capturar foto.');
        }

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
        };
    }

    async processImage(uri: string): Promise<PhotoCaptureResult> {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1200 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
        };
    }
}
