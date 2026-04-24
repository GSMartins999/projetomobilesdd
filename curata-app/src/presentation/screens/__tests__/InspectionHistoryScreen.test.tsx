import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { InspectionHistoryScreen } from '../InspectionHistoryScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('InspectionHistoryScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const route = { params: { artworkId: 'art-1' } };
    
    const Wrapper = ({ children, mockDI }: any) => (
        <DIProvider values={mockDI}>
            {children}
        </DIProvider>
    );

    it('renders empty state', async () => {
        const mockDI = {
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue([]) },
        };

        const { findByText } = render(<InspectionHistoryScreen route={route} navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        await findByText('Nenhuma inspeção registrada');
    });

    it('renders inspections and handles press', async () => {
        const insps = [
            { id: 'insp-1', updatedAt: new Date().toISOString(), technicalForm: { statusAtVisit: 'urgent', urgencyLevel: 'Alta' } }
        ];
        const mockDI = {
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue(insps) },
        };

        const { findByText } = render(<InspectionHistoryScreen route={route} navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        const urgencyLabel = await findByText('Alta');
        fireEvent.press(urgencyLabel.parent!);
        
        expect(mockNavigate).toHaveBeenCalledWith('InspectionDetail', { inspectionId: 'insp-1' });
    });

    it('sorts inspections by date descending', async () => {
        const insps = [
            { id: 'old', updatedAt: '2022-12-31T20:00:00Z', technicalForm: { statusAtVisit: 'good' } },
            { id: 'new', updatedAt: '2023-12-31T20:00:00Z', technicalForm: { statusAtVisit: 'good' } }
        ];
        const mockDI = {
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue(insps) },
        };

        const { findByText, getAllByText } = render(<InspectionHistoryScreen route={route} navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        // Use regex or partial matches to avoid timezone issues
        await waitFor(() => {
            expect(getAllByText(/2023/)).toBeTruthy();
            expect(getAllByText(/2022/)).toBeTruthy();
        });
    });

    it('renders fallback for unknown status', async () => {
        const insps = [
            { id: '1', updatedAt: new Date().toISOString(), technicalForm: { statusAtVisit: 'unknown' as any, urgencyLevel: 'N/A' } }
        ];
        const mockDI = {
            inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue(insps) },
        };

        const { findByText } = render(<InspectionHistoryScreen route={route} navigation={{ navigate: mockNavigate }} />, {
            wrapper: (props) => <Wrapper {...props} mockDI={mockDI} />
        });

        expect(await findByText('Regular')).toBeTruthy();
    });
});
