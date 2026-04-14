export interface PhotoCaptureResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
}

export interface CameraService {
    requestPermissions(): Promise<boolean>;
    hasPermissions(): Promise<boolean>;
    takePicture(): Promise<PhotoCaptureResult>;
    processImage(uri: string): Promise<PhotoCaptureResult>; // For compression/rotation
}
