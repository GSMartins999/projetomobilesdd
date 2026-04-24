import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { MapScreen } from '../MapScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import * as Location from 'expo-location';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock Location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getCurrentPositionAsync: jest.fn().mockResolvedValue({
        coords: { latitude: -23.5505, longitude: -46.6333 }
    }),
}));

describe('MapScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const Wrapper = ({ children, mockDI }: any) => (
        <DIProvider values={mockDI}>
            {children}
        </DIProvider>
    );

    it('renders properly and shows artworks', async () => {
        const artworks = [
            { id: 'art-1', name: 'Monumento', conservationStatus: 'good', latitude: 10, longitude: 20 },
        ];
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue(artworks) },
        };

        const { findByText } = render(<MapScreen navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        await findByText('Monumento');
        expect(await findByText('10.0000, 20.0000')).toBeTruthy();
    });

    it('navigates to ArtworkForm on fab press', async () => {
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue([]) },
        };

        const { getByTestId, findByText } = render(<MapScreen navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        await findByText('Nenhuma obra registrada');
        
        const fab = getByTestId('map-fab');
        fireEvent.press(fab);
        expect(mockNavigate).toHaveBeenCalledWith('ArtworkForm');
    });

    it('handles location permission denied', async () => {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
        
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue([]) },
        };

        const { queryByText } = render(<MapScreen navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        // location should not be displayed
        await waitFor(() => {
            expect(queryByText(/-23.5505/)).toBeNull();
        });
    });

    it('renders fallback for missing data', async () => {
        const artworks = [
            { id: '1', name: 'Unknown', conservationStatus: 'unknown' as any, artist: '', type: 'test' },
        ];
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue(artworks) },
        };

        const { findByText } = render(<MapScreen navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        expect(await findByText(/Artista desconhecido/)).toBeTruthy();
        expect(await findByText('Regular')).toBeTruthy(); // unknown fallback
    });
});
