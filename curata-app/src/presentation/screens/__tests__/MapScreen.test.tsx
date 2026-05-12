import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
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
            { id: 'art-1', name: 'Monumento', conservationStatus: 'good', latitude: 10, longitude: 20, type: 'monument' },
        ];
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue(artworks) },
            photoRepository: { findByArtworkId: jest.fn().mockResolvedValue([]) },
        };

        const { findByText, getByTestId } = render(<MapScreen navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        const annotation = await waitFor(() => getByTestId('annotation-art-1'));
        fireEvent(annotation, 'onSelected');

        await findByText('Monumento');
    });

    it('navigates to ArtworkForm on fab press', async () => {
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue([]) },
            photoRepository: { findByArtworkId: jest.fn().mockResolvedValue([]) },
        };

        const { getByTestId } = render(<MapScreen navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        const fab = await waitFor(() => getByTestId('map-fab'));
        fireEvent.press(fab);
        expect(mockNavigate).toHaveBeenCalledWith('ArtworkForm');
    });

    it('handles location permission denied', async () => {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
        
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue([]) },
            photoRepository: { findByArtworkId: jest.fn().mockResolvedValue([]) },
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
            { id: 'art-2', name: 'Unknown', conservationStatus: 'unknown' as any, artist: '', type: 'other', latitude: 10, longitude: 20 },
        ];
        const mockDI = {
            artworkRepository: { findAll: jest.fn().mockResolvedValue(artworks) },
            photoRepository: { findByArtworkId: jest.fn().mockResolvedValue([]) },
        };

        const { findByText, getByTestId } = render(<MapScreen navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        const annotation = await waitFor(() => getByTestId('annotation-art-2'));
        fireEvent(annotation, 'onSelected');

        expect(await findByText('map.unknown_artist')).toBeTruthy();
        expect(await findByText('Desconhecido')).toBeTruthy(); // unknown fallback status label
    });
});
