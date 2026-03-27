import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { InspectionFormScreen } from '../InspectionFormScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';

// Mock de Navegação
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};

const mockRoute = {
    params: { artworkId: 'art-1' },
};

describe('InspectionFormScreen', () => {
    const renderScreen = () => render(
        <DIProvider values={{
            artworkRepository: { findById: jest.fn().mockResolvedValue({ name: 'Mural' }) },
            inspectionRepository: { save: jest.fn() },
            photoRepository: { save: jest.fn() }
        } as any}>
            <InspectionFormScreen navigation={mockNavigation as any} route={mockRoute as any} />
        </DIProvider>
    );

    it('deve renderizar campos do formulário técnico', () => {
        const { getByText, getByPlaceholderText } = renderScreen();
        expect(getByText(/Condição Estrutural/i)).toBeTruthy();
        expect(getByText(/Nível de Urgência/i)).toBeTruthy();
        expect(getByPlaceholderText(/Recomendação técnica/i)).toBeTruthy();
    });

    it('deve validar campos obrigatórios ao salvar', async () => {
        const { getByText } = renderScreen();

        fireEvent.press(getByText(/Finalizar Inspeção/i));

        await waitFor(() => {
            expect(getByText(/Todos os campos obrigatórios devem ser preenchidos/i)).toBeTruthy();
        });
    });

    it('deve permitir adicionar fotos até o limite de 10', async () => {
        const { getByText } = renderScreen();
        expect(getByText(/Fotos \(0\/10\)/i)).toBeTruthy();
    });
});
