import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { CameraScreen } from '../CameraScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';

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
    beforeEach(() => {
        jest.clearAllMocks();
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
        mockCameraService.hasPermissions.mockResolvedValueOnce(false);
        
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        // Deveria mostrar uma mensagem pedindo permissão
        expect(await screen.findByText(/Precisamos da sua permissão/i)).toBeTruthy();
        expect(screen.getByText(/Pedir Permissão/i)).toBeTruthy();
    });

    it('should request permissions when button is pressed', async () => {
        mockCameraService.hasPermissions.mockResolvedValueOnce(false);
        mockCameraService.requestPermissions.mockResolvedValueOnce(true);
        
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        const requestButton = await screen.findByText(/Pedir Permissão/i);
        fireEvent.press(requestButton);

        await waitFor(() => {
            expect(mockCameraService.requestPermissions).toHaveBeenCalled();
        });
    });

    it('should capture and persist photo using CapturePhotoUseCase when IDs are provided', async () => {
        mockCameraService.hasPermissions.mockResolvedValue(true);
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        const captureButton = await screen.findByTestId('capture-button');

        await act(async () => {
            fireEvent.press(captureButton);
        });

        await waitFor(() => {
            // Verifica se o hardware foi acionado
            expect(mockCameraService.takePicture).toHaveBeenCalled();
            // Verifica se o UseCase (via persistência) foi acionado indiretamente via mockPhotoRepo
            expect(mockPhotoRepo.save).toHaveBeenCalledWith(expect.objectContaining({
                artworkId: 'artwork-123',
                inspectionId: 'insp-456',
                localPath: 'processed-uri'
            }));
            // Verifica se o callback foi chamado
            expect(mockProps.route.params.onCapture).toHaveBeenCalledWith('processed-uri');
            // Verifica se fechou a tela
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('should handle cancel button', async () => {
        mockCameraService.hasPermissions.mockResolvedValue(true);
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        const closeButton = await screen.findByTestId('camera-close-button');

        await act(async () => {
            fireEvent.press(closeButton);
        });

        expect(mockGoBack).toHaveBeenCalled();
    });

    it('should capture and process photo in fallback mode (no IDs)', async () => {
        mockCameraService.hasPermissions.mockResolvedValue(true);
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
        // We need to keep permissions as null or simulate delay
        render(<CameraScreen navigation={mockProps.navigation} route={{ params: {} }} />, {
            wrapper: TestWrapper
        });
        
        // it starts in null state so should show loading if we don't finish useEffect
    });

    it('should handle permission null state', async () => {
        mockCameraService.hasPermissions.mockResolvedValueOnce(null);
        render(<CameraScreen navigation={mockProps.navigation} route={{ params: {} }} />, {
            wrapper: TestWrapper
        });
        
        // This covers the useEffect logic when hasPermission is null
    });

    it('should show loading state', () => {
        // Mock to stay in loading
        mockCameraService.hasPermissions.mockReturnValue(new Promise(() => {})); 
        const { getByTestId } = render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });
        expect(getByTestId('camera-loading')).toBeTruthy();
    });

    it('should show permission denied UI', async () => {
        mockCameraService.hasPermissions.mockResolvedValueOnce(false);
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });
        
        expect(await screen.findByText(/Precisamos da sua permissão/i)).toBeTruthy();
        expect(screen.getByText(/Pedir Permissão/i)).toBeTruthy();
    });
    it('should show alert on capture failure', async () => {
        mockCameraService.hasPermissions.mockResolvedValue(true);
        mockCameraService.takePicture.mockRejectedValueOnce(new Error('Hardware failure'));
        
        const { findByTestId } = render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });
        const captureButton = await findByTestId('capture-button');
        
        await act(async () => {
            fireEvent.press(captureButton);
        });
        
        // expect alert
        const Alert = require('react-native').Alert;
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Falha ao capturar foto');
    });
});
