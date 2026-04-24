import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { SearchScreen } from '../SearchScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';

// Mocks
const mockArtworks = [
    { id: '1', name: 'Mona Lisa', artist: 'Da Vinci', type: 'painting', conservationStatus: 'good' },
    { id: '2', name: 'David', artist: 'Michelangelo', type: 'sculpture', conservationStatus: 'fair' },
];

const mockRepository: any = {
    findAll: jest.fn().mockResolvedValue(mockArtworks),
};

const mockNavigate = jest.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
        <DIProvider values={{ artworkRepository: mockRepository } as any}>
            {children}
        </DIProvider>
    </NavigationContainer>
);

describe('SearchScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockProps = {
        navigation: {
            navigate: mockNavigate,
        },
        route: {},
    };

    it('should show artworks after loading', async () => {
        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });
        await waitFor(() => expect(mockRepository.findAll).toHaveBeenCalled());
        const mona = await screen.findByText(/Mona Lisa/i);
        expect(mona).toBeTruthy();
    });

    it('should filter artworks by search query', async () => {
        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });
        await screen.findByText(/Mona Lisa/i);
        const searchInput = screen.getByPlaceholderText(/Pesquisar/i);

        await act(async () => {
            fireEvent.changeText(searchInput, 'David');
            fireEvent(searchInput, 'submitEditing');
        });

        await waitFor(() => {
            expect(screen.queryByText(/Mona Lisa/i)).toBeNull();
            expect(screen.queryByText(/David/i)).toBeTruthy();
        });
    });

    it('should toggle and untoggle status filters', async () => {
        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });
        await screen.findByText(/Mona Lisa/i);

        const goodBtn = screen.getByText('Bom');
        
        // Toggle on
        await act(async () => { fireEvent.press(goodBtn); });
        expect(screen.queryByText(/David/i)).toBeNull();
        
        // Toggle off (line 102 branch)
        await act(async () => { fireEvent.press(goodBtn); });
        expect(screen.queryByText(/David/i)).toBeTruthy();
    });

    it('should toggle and untoggle type filters', async () => {
        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });
        await screen.findByText(/Mona Lisa/i);

        const sculptureBtn = screen.getByText('Escultura');
        
        // Toggle on
        await act(async () => { fireEvent.press(sculptureBtn); });
        expect(screen.queryByText(/Mona Lisa/i)).toBeNull();
        
        // Toggle off (line 126 branch)
        await act(async () => { fireEvent.press(sculptureBtn); });
        expect(screen.queryByText(/Mona Lisa/i)).toBeTruthy();
    });

    it('should show empty state with current filters', async () => {
        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });
        await screen.findByText(/Mona Lisa/i);

        const searchInput = screen.getByPlaceholderText(/Pesquisar/i);
        await act(async () => {
            fireEvent.changeText(searchInput, 'NonExistent');
            fireEvent(searchInput, 'submitEditing');
        });

        expect(await screen.findByText(/Nenhuma obra encontrada/i)).toBeTruthy();
    });
    it('renders fallback for unknown data', async () => {
        const unknownArt = [
            { id: '3', name: 'Unknown Art', artist: null, type: 'painting', conservationStatus: 'unknown' as any },
        ];
        mockRepository.findAll.mockResolvedValueOnce(unknownArt);

        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });
        
        expect(await screen.findByText('REGULAR')).toBeTruthy();
        expect(await screen.findByText('Artista desconhecido')).toBeTruthy();
    });
});
