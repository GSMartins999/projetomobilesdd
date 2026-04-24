import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ArtworkFormScreen } from '../ArtworkFormScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Mocks
const mockRepository: any = {
    save: jest.fn().mockResolvedValue({ error: null }),
    findNearby: jest.fn().mockResolvedValue({ data: [], error: null }),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: '1', name: 'Mona Lisa', conservationStatus: 'good' }),
};

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
        <DIProvider values={{ artworkRepository: mockRepository } as any}>
            {children}
        </DIProvider>
    </NavigationContainer>
);

describe('ArtworkFormScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: -23.55052, longitude: -46.633308 },
        });
    });

    const mockProps = {
        navigation: {
            navigate: mockNavigate,
            goBack: mockGoBack,
        },
        route: { params: {} },
    };

    it('should fetch location and address on mount', async () => {
        render(<ArtworkFormScreen {...mockProps} />, { wrapper: TestWrapper });

        await waitFor(() => {
            expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
        });
    });

    it('should show alert if nearby artwork is detected', async () => {
        mockRepository.findAll.mockResolvedValueOnce([{
            id: '1',
            name: 'Mona Lisa',
            latitude: -23.55052,
            longitude: -46.633308,
            deletedAt: null
        }]);

        render(<ArtworkFormScreen {...mockProps} />, { wrapper: TestWrapper });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Obra Próxima Detectada',
                expect.stringContaining('Mona Lisa'),
                expect.any(Array)
            );
        });
    });

    it('should validate required fields', async () => {
        const { getByText, findByText, queryByText } = render(<ArtworkFormScreen {...mockProps} />, { wrapper: TestWrapper });

        const saveButton = await findByText('Salvar Obra');
        
        fireEvent.press(saveButton);

        await waitFor(() => {
            expect(getByText('Nome da obra é obrigatório')).toBeTruthy();
        });
    });

    it('should handle input changes and save artwork', async () => {
        const { getByPlaceholderText, getByText, findByText } = render(<ArtworkFormScreen {...mockProps} />, { wrapper: TestWrapper });

        await findByText('Salvar Obra');

        fireEvent.changeText(getByPlaceholderText('Nome da obra'), 'Nova Escultura');
        fireEvent.changeText(getByPlaceholderText('Nome do artista'), 'Michelangelo');

        // Change status
        fireEvent.press(getByText('Regular'));

        fireEvent.press(getByText('Salvar Obra'));

        await waitFor(() => {
            expect(mockRepository.save).toHaveBeenCalled();
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('should navigate to camera for photo capture', async () => {
        const { findByTestId } = render(<ArtworkFormScreen {...mockProps} />, { wrapper: TestWrapper });

        const photoButton = await findByTestId('photo-pressable');
        fireEvent.press(photoButton);

        expect(mockNavigate).toHaveBeenCalledWith('Camera', expect.any(Object));
    });

    it('should handle save error', async () => {
        mockRepository.save.mockRejectedValueOnce(new Error('Database error'));
        const { getByPlaceholderText, getByText, findByText } = render(<ArtworkFormScreen {...mockProps} />, { wrapper: TestWrapper });

        await findByText('Salvar Obra');
        fireEvent.changeText(getByPlaceholderText('Nome da obra'), 'Nova Escultura');
        
        await act(async () => {
            fireEvent.press(getByText('Salvar Obra'));
        });

        await waitFor(() => {
            expect(getByText('Database error')).toBeTruthy();
        });
    });
});
