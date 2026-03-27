import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ArtworkFormScreen } from '../ArtworkFormScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';

// Mocks
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};

const mockArtworkRepository = {
    save: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
} as any;

describe('ArtworkFormScreen', () => {
    const renderScreen = () => render(
        <DIProvider values={{ artworkRepository: mockArtworkRepository } as any}>
            <ArtworkFormScreen navigation={mockNavigation as any} />
        </DIProvider>
    );

    it('deve renderizar campos obrigatórios', () => {
        const { getByPlaceholderText, getByText } = renderScreen();
        expect(getByPlaceholderText(/artwork.name/i)).toBeTruthy();
        expect(getByText(/Estado de Conservação/i)).toBeTruthy();
        expect(getByText(/Salvar/i)).toBeTruthy();
    });

    it('deve validar campos obrigatórios ao salvar', async () => {
        const { getByText } = renderScreen();

        fireEvent.press(getByText(/Salvar/i));

        await waitFor(() => {
            expect(getByText(/Nome da obra é obrigatório/i)).toBeTruthy();
        });
    });

    it('deve navegar para a câmera ao clicar no placeholder de foto', () => {
        const { getByTestId } = renderScreen();
        const photoButton = getByTestId('photo-pressable');

        fireEvent.press(photoButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Camera', expect.any(Object));
    });
});
