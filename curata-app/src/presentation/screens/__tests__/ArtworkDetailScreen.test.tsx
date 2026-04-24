import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { ArtworkDetailScreen } from '../ArtworkDetailScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

describe('ArtworkDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const route = { params: { id: 'art-1' } };
    
    const Wrapper = ({ children, mockDI }: any) => (
        <DIProvider values={mockDI}>
            <NavigationContainer>
                {children}
            </NavigationContainer>
        </DIProvider>
    );

    it('renders loading state initially then shows artwork', async () => {
        const art = { id: 'art-1', name: 'Mona Lisa', type: 'painting', conservationStatus: 'good' };
        const insp = [{ id: 'insp-1', updatedAt: new Date().toISOString(), technicalForm: { structuralCondition: 'Ok', statusAtVisit: 'good' } }];
        const mockDI = {
            artworkRepository: { findById: jest.fn().mockResolvedValue(art) },
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue(insp) },
        };

        const { getByText, findByText } = render(<ArtworkDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        await findByText('Mona Lisa');
        expect(getByText('painting')).toBeTruthy(); // the type might be rendered
    });

    it('handles no inspections state', async () => {
        const art = { id: 'art-1', name: 'Mona Lisa', type: 'painting', conservationStatus: 'good' };
        const mockDI = {
            artworkRepository: { findById: jest.fn().mockResolvedValue(art) },
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue([]) },
        };

        const { findByText } = render(<ArtworkDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        await findByText('Nenhuma inspeção registrada');
    });

    it('handles all navigation actions', async () => {
        const art = { id: 'art-1', name: 'Mona Lisa', type: 'painting', conservationStatus: 'good' };
        const insp = [{ id: 'insp-1', updatedAt: new Date().toISOString(), technicalForm: { structuralCondition: 'Ok', statusAtVisit: 'good' } }];
        const mockDI = {
            artworkRepository: { findById: jest.fn().mockResolvedValue(art) },
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue(insp) },
        };

        const { getByText, UNSAFE_root } = render(<ArtworkDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        // let initial load finish
        await waitFor(() => {
            expect(mockDI.artworkRepository.findById).toHaveBeenCalled();
        });

        // find back arrow and click
        const backBtn = UNSAFE_root.find((node: any) => node.props?.name === 'arrow-back');
        if (backBtn) fireEvent.press(backBtn.parent!);
        expect(mockGoBack).toHaveBeenCalled();

        // find 'Ver todas' and click
        fireEvent.press(getByText('Ver todas'));
        expect(mockNavigate).toHaveBeenCalledWith('InspectionHistory', { artworkId: 'art-1' });

        // click on individual inspection card
        fireEvent.press(getByText('Ok'));
        expect(mockNavigate).toHaveBeenCalledWith('InspectionDetail', { inspectionId: 'insp-1' });

        // click 'Gerar Relatório'
        fireEvent.press(getByText('Gerar Relatório'));
        expect(mockNavigate).toHaveBeenCalledWith('ReportGenerator');
        
        // click 'Nova Inspeção' (was already tested but might as well group it here)
        fireEvent.press(getByText('Nova Inspeção'));
    });

    it('renders placeholder when address is missing', async () => {
        const art = { id: 'art-1', name: 'Mona Lisa', type: 'painting', conservationStatus: 'good', address: '' };
        const mockDI = {
            artworkRepository: { findById: jest.fn().mockResolvedValue(art) },
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue([]) },
        };

        const { findByText } = render(<ArtworkDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        expect(await findByText('Endereço não informado')).toBeTruthy();
    });

    it('renders maximum 3 inspections in preview', async () => {
        const art = { id: 'art-1', name: 'Mona Lisa', type: 'painting', conservationStatus: 'good' };
        const insp = [
            { id: '1', updatedAt: new Date().toISOString(), technicalForm: { structuralCondition: 'Ok1' } },
            { id: '2', updatedAt: new Date().toISOString(), technicalForm: { structuralCondition: 'Ok2' } },
            { id: '3', updatedAt: new Date().toISOString(), technicalForm: { structuralCondition: 'Ok3' } },
            { id: '4', updatedAt: new Date().toISOString(), technicalForm: { structuralCondition: 'Ok4' } },
        ];
        const mockDI = {
            artworkRepository: { findById: jest.fn().mockResolvedValue(art) },
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue(insp) },
        };

        const { findByText, queryByText } = render(<ArtworkDetailScreen route={route} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        await findByText('Ok1');
        await findByText('Ok2');
        await findByText('Ok3');
        expect(queryByText('Ok4')).toBeNull();
    });
});
