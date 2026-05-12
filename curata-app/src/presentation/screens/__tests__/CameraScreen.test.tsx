import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { CameraScreen } from '../CameraScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';
import { useCameraPermissions } from 'expo-camera';

// Mocks
const mockCameraService: any = {
    hasPermissions: jest.fn().mockResolvedValue(true),
    requestPermissions: jest.fn().mockResolvedValue(true),
    takePicture: jest.fn().mockResolvedValue({ uri: 'raw-uri' }),
    processImage: jest.fn().mockResolvedValue({ uri: 'processed-uri' }),
    setCameraRef: jest.fn(),
};

const mockPhotoRepo: any = {
    save: jest.fn().mockResolvedValue(undefined),
};

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
        <DIProvider values={{
            cameraService: mockCameraService,
            photoRepository: mockPhotoRepo
        } as any}>
            {children}
        </DIProvider>
    </NavigationContainer>
);

describe('CameraScreen', () => {
    const mockRequestPermission = jest.fn().mockResolvedValue({ status: 'granted', granted: true });

    beforeEach(() => {
        jest.clearAllMocks();
        (useCameraPermissions as jest.Mock).mockReturnValue([
            { status: 'granted', granted: true },
            mockRequestPermission
        ]);
    });

    const mockProps = {
        navigation: {
            navigate: mockNavigate,
            goBack: mockGoBack,
        },
        route: {
            params: {
                artworkId: 'artwork-123',
                inspectionId: 'insp-456',
                onCapture: jest.fn()
            }
        },
    };

    it('should show permission request UI when permissions are not granted', async () => {
        (useCameraPermissions as jest.Mock).mockReturnValue([
            { status: 'denied', granted: false },
            mockRequestPermission
        ]);
        
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        expect(await screen.findByText(/Precisamos da sua permissão/i)).toBeTruthy();
        expect(screen.getByText(/Pedir Permissão/i)).toBeTruthy();
    });

    it('should request permissions when button is pressed', async () => {
        (useCameraPermissions as jest.Mock).mockReturnValue([
            { status: 'denied', granted: false },
            mockRequestPermission
        ]);
        
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        const requestButton = await screen.findByText(/Pedir Permissão/i);
        fireEvent.press(requestButton);

        await waitFor(() => {
            expect(mockRequestPermission).toHaveBeenCalled();
        });
    });

    it('should capture and persist photo using CapturePhotoUseCase when IDs are provided', async () => {
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        const captureButton = await screen.findByTestId('capture-button');

        await act(async () => {
            fireEvent.press(captureButton);
        });

        await waitFor(() => {
            expect(mockCameraService.takePicture).toHaveBeenCalled();
            // CapturePhotoUseCase retorna a entidade sem salvar no repo diretamente
            expect(mockProps.route.params.onCapture).toHaveBeenCalledWith('processed-uri');
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('should handle cancel button', async () => {
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        const closeButton = await screen.findByTestId('camera-close-button');

        await act(async () => {
            fireEvent.press(closeButton);
        });

        expect(mockGoBack).toHaveBeenCalled();
    });

    it('should capture and process photo in fallback mode (no IDs)', async () => {
        const onCapture = jest.fn();
        render(<CameraScreen navigation={mockProps.navigation} route={{ params: { onCapture } }} />, { wrapper: TestWrapper });

        const captureButton = await screen.findByTestId('capture-button');
        await act(async () => {
            fireEvent.press(captureButton);
        });

        expect(mockCameraService.takePicture).toHaveBeenCalled();
        expect(onCapture).toHaveBeenCalledWith('processed-uri');
    });

    it('should show loading indicator when permissions are being checked', () => {
        (useCameraPermissions as jest.Mock).mockReturnValue([null, mockRequestPermission]);
        const { getByTestId } = render(<CameraScreen navigation={mockProps.navigation} route={{ params: {} }} />, {
            wrapper: TestWrapper
        });
        
        expect(getByTestId('camera-loading')).toBeTruthy();
    });

    it('should show alert on capture failure', async () => {
        mockCameraService.takePicture.mockRejectedValueOnce(new Error('Hardware failure'));
        
        const { findByTestId } = render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });
        const captureButton = await findByTestId('capture-button');
        
        await act(async () => {
            fireEvent.press(captureButton);
        });
        
        const Alert = require('react-native').Alert;
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Falha ao capturar foto');
    });
});
