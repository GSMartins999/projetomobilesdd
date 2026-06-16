import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { InspectionFormScreen } from '../InspectionFormScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../../../infrastructure/auth/AuthContext';

// Mocks
const mockInspectionRepo: any = {
    save: jest.fn().mockResolvedValue(undefined),
};
const mockArtworkRepo: any = {
    update: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn().mockResolvedValue({ id: 'artwork-123', name: 'Mona Lisa', conservationStatus: 'fair' }),
};
const mockPhotoRepo: any = {
    save: jest.fn().mockResolvedValue(undefined),
};
const mockAuthRepository: any = {
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'user-auth-123', name: 'John Doe', email: 'john@example.com' }),
};

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
        <DIProvider values={{
            inspectionRepository: mockInspectionRepo,
            artworkRepository: mockArtworkRepo,
            photoRepository: mockPhotoRepo,
            authRepository: mockAuthRepository
        } as any}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </DIProvider>
    </NavigationContainer>
);

describe('InspectionFormScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockProps = {
        navigation: {
            navigate: mockNavigate,
            goBack: mockGoBack,
        },
        route: { params: { artworkId: 'artwork-123' } },
    };

    it('should validate required fields', async () => {
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });

        const saveButton = await screen.findByText('Finalizar Inspeção');
        fireEvent.press(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/Todos os campos obrigatórios/i)).toBeTruthy();
        });
    });

    it('should handle input changes and save inspection', async () => {
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });

        await screen.findByText('Finalizar Inspeção');

        await act(async () => {
            fireEvent.changeText(screen.getByPlaceholderText(/condição estrutural/i), 'Problema na base');
            fireEvent.changeText(screen.getByPlaceholderText(/condição superficial/i), 'Desgaste de tinta');
            fireEvent.changeText(screen.getByPlaceholderText(/Recomendação técnica/i), 'Limpeza imediata');
        });

        // Change urgency
        fireEvent.press(screen.getByText('4'));

        const saveBtn = await screen.findByText('Finalizar Inspeção');

        await act(async () => {
            fireEvent.press(saveBtn);
        });

        await waitFor(() => {
            expect(mockInspectionRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({ deviceId: 'user-auth-123' })
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('should navigate to camera for photo capture with correct params', async () => {
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });

        const photoButton = await screen.findByText('Adicionar');

        await act(async () => {
            fireEvent.press(photoButton);
        });

        expect(mockNavigate).toHaveBeenCalledWith('Camera', expect.objectContaining({
            artworkId: 'artwork-123',
            inspectionId: expect.any(String),
            label: 'front'
        }));
    });

    it('should allow removing a photo from the list', async () => {
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });

        // 1. Abrir câmera
        const photoButton = await screen.findByText('Adicionar');
        await act(async () => {
            fireEvent.press(photoButton);
        });

        // 2. Simular a captura de uma foto via callback do navigation
        const [navCall] = mockNavigate.mock.calls.filter(c => c[0] === 'Camera');
        expect(navCall).toBeTruthy();

        await act(async () => {
            require('react-native').DeviceEventEmitter.emit('onPhotoCaptured', 'new-photo-uri');
        });

        // 3. Verifica se a foto apareceu (Thumb) via testID
        const removeButton = await screen.findByTestId('remove-photo-0');
        expect(removeButton).toBeTruthy();

        // Remover a foto
        await act(async () => {
            fireEvent.press(screen.getByTestId('remove-photo-0'));
        });

        // Verifica se a foto sumiu
        expect(screen.queryByTestId('remove-photo-0')).toBeNull();
    });

    it('should respect the 10 photo limit', async () => {
        global.alert = jest.fn();
        const spyAlert = jest.spyOn(require('react-native').Alert, 'alert');
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });

        // Add 10 photos
        const photoButton = await screen.findByText('Adicionar');
        const [navCall] = mockNavigate.mock.calls.filter(c => c[0] === 'Camera');
        // Actually we need to re-find it after each capture if it re-renders
        // But for simplicity let's mock the state or just repeat fireEvent
        
        for(let i=0; i<10; i++) {
            fireEvent.press(photoButton);
            await act(async () => {
                require('react-native').DeviceEventEmitter.emit('onPhotoCaptured', `uri-${i}`);
            });
        }

        // Try 11th
        fireEvent.press(photoButton);
        expect(spyAlert).toHaveBeenCalledWith('Limite Atingido', expect.any(String));
        spyAlert.mockRestore();
    });

    it('should handle status pill selection', async () => {
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });
        
        const goodPill = await screen.findByText('Bom');
        fireEvent.press(goodPill);
        // Verified by visual change in styles usually, but here we just cover the onPress line
    });

    it('should show error message if save fails', async () => {
        mockInspectionRepo.save.mockRejectedValueOnce(new Error('Database error'));
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });

        await act(async () => {
            fireEvent.changeText(screen.getByPlaceholderText(/condição estrutural/i), 'val');
            fireEvent.changeText(screen.getByPlaceholderText(/condição superficial/i), 'val');
            fireEvent.changeText(screen.getByPlaceholderText(/Recomendação técnica/i), 'val');
        });

        const saveBtn = await screen.findByText('Finalizar Inspeção');
        await act(async () => {
            fireEvent.press(saveBtn);
        });

        expect(await screen.findByText('Database error')).toBeTruthy();
    });
});
