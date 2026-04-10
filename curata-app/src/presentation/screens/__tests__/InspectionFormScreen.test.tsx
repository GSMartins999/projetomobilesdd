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

    it('should navigate to camera for photo capture', async () => {
        render(<InspectionFormScreen {...mockProps} />, { wrapper: TestWrapper });

        const photoButton = await screen.findByText('Adicionar');

        await act(async () => {
            fireEvent.press(photoButton);
        });

        expect(mockNavigate).toHaveBeenCalledWith('Camera', expect.any(Object));
    });
});
