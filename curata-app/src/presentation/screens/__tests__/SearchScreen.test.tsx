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

        // Wait for it to be called
        await waitFor(() => expect(mockRepository.findAll).toHaveBeenCalled());

        // Use findBy to wait for the element to appear
        const mona = await screen.findByText(/Mona Lisa/i);
        expect(mona).toBeTruthy();
    });

    it('should filter artworks by search query', async () => {
        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });

        await screen.findByText(/Mona Lisa/i);

        const searchInput = screen.getByPlaceholderText(/Pesquisar/i);

        await act(async () => {
            fireEvent.changeText(searchInput, 'David');
        });

        // SearchScreen triggers search on onSubmitEditing
        await act(async () => {
            fireEvent(searchInput, 'submitEditing');
        });

        await waitFor(() => {
            expect(screen.queryByText(/Mona Lisa/i)).toBeNull();
            expect(screen.queryByText(/David/i)).toBeTruthy();
        });
    });

    it('should navigate to artwork detail', async () => {
        render(<SearchScreen {...mockProps} />, { wrapper: TestWrapper });

        const artworkItem = await screen.findByText(/Mona Lisa/i);

        await act(async () => {
            fireEvent.press(artworkItem);
        });

        expect(mockNavigate).toHaveBeenCalledWith('ArtworkDetail', expect.objectContaining({ id: '1' }));
    });
});
