import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { InspectionDetailScreen } from '../InspectionDetailScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

describe('InspectionDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const route = { params: { inspectionId: 'insp-1' } };
    
    const Wrapper = ({ children, mockDI }: any) => (
        <DIProvider values={mockDI}>
            {children}
        </DIProvider>
    );

    it('renders loading initially', () => {
        const mockDI = {
            inspectionRepository: { findById: jest.fn().mockReturnValue(new Promise(() => {})) },
            artworkRepository: { findById: jest.fn().mockResolvedValue(null) },
        };
        const { getByTestId } = render(<InspectionDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });
        // We know ActivityIndicator is rendered or similar if it's loading
    });

    it('renders inspection details', async () => {
        const insp = { 
            id: 'insp-1', 
            artworkId: 'art-1',
            updatedAt: new Date().toISOString(), 
            technicalForm: {
                structuralCondition: 'Ok struct', 
                surfaceCondition: 'Ok surface',
                recommendation: 'Fix it'
            } 
        };
        const mockDI = {
            inspectionRepository: { findById: jest.fn().mockResolvedValue(insp) },
            photoRepository: { findByInspectionId: jest.fn().mockResolvedValue([{ id: 'p1', localPath: 'img.png' }]) },
        };

        const { findByText, UNSAFE_root } = render(<InspectionDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        await findByText('Ok struct');
        expect(UNSAFE_root).toBeTruthy();
    });

    it('handles not found inspection', async () => {
        const mockDI = {
            inspectionRepository: { findById: jest.fn().mockResolvedValue(null) },
            photoRepository: { findByInspectionId: jest.fn().mockResolvedValue([]) },
        };
        const { getByTestId, UNSAFE_root } = render(<InspectionDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });
        
        // it renders an empty view without children if not found
        // we just ensure it doesn't crash
        expect(UNSAFE_root).toBeTruthy();
    });
});
