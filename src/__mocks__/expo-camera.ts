// Mock expo-camera
const mockRequestCameraPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
const mockGetCameraPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });

export const Camera = {
    requestCameraPermissionsAsync: mockRequestCameraPermissionsAsync,
    getCameraPermissionsAsync: mockGetCameraPermissionsAsync,
    Constants: { Type: { back: 'back', front: 'front' } },
};

export const CameraView = 'CameraView';
export const useCameraPermissions = jest.fn(() => [
    { granted: true, status: 'granted' },
    mockRequestCameraPermissionsAsync,
]);

export default { Camera, CameraView, useCameraPermissions };
