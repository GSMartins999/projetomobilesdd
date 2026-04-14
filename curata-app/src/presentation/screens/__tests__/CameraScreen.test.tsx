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

    it('should capture and persist photo using CapturePhotoUseCase when IDs are provided', async () => {
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
        render(<CameraScreen {...mockProps} />, { wrapper: TestWrapper });

        const closeButton = await screen.findByTestId('camera-close-button');

        await act(async () => {
            fireEvent.press(closeButton);
        });

        expect(mockGoBack).toHaveBeenCalled();
    });
});
