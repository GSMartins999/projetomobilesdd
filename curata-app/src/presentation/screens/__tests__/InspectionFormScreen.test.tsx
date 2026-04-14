import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { InspectionFormScreen } from '../InspectionFormScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';

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

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
        <DIProvider values={{
            inspectionRepository: mockInspectionRepo,
            artworkRepository: mockArtworkRepo,
            photoRepository: mockPhotoRepo
        } as any}>
            {children}
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
            expect(mockInspectionRepo.save).toHaveBeenCalled();
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
            onCapture: expect.any(Function)
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

        if (navCall && navCall[1].onCapture) {
            await act(async () => {
                navCall[1].onCapture('new-photo-uri');
            });
        }

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
});
