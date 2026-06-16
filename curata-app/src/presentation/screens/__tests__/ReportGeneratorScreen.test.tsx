import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ReportGeneratorScreen } from '../ReportGeneratorScreen';
import { NavigationContainer } from '@react-navigation/native';
import { DIProvider } from '../../../infrastructure/di/DIContext';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ goBack: mockGoBack }),
}));

const mockArtworkRepo = {
    findById: jest.fn().mockResolvedValue(null),
};
const mockInspectionRepo = {
    findByArtworkId: jest.fn().mockResolvedValue([]),
};
const mockPhotoRepo = {
    findByInspectionId: jest.fn().mockResolvedValue([]),
    findByArtworkId: jest.fn().mockResolvedValue([]),
};

describe('ReportGeneratorScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const Wrapper = ({ children }: any) => (
        <DIProvider values={{
            artworkRepository: mockArtworkRepo,
            inspectionRepository: mockInspectionRepo,
            photoRepository: mockPhotoRepo,
        } as any}>
            <NavigationContainer>{children}</NavigationContainer>
        </DIProvider>
    );

    it('renders and can change export format', () => {
        const { getByText, getAllByText } = render(<ReportGeneratorScreen />, { wrapper: Wrapper });
        
        // Botão de exportar está na tela com a chave de i18n
        expect(getByText('Excel')).toBeTruthy();

        const excelBtn = getByText('Excel');
        fireEvent.press(excelBtn);
        // Após selecionar Excel, o texto do botão muda
        expect(getByText('Excel')).toBeTruthy();
        
        const dateText = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString();
        const dateBtns = getAllByText(dateText);
        if (dateBtns.length > 0) fireEvent.press(dateBtns[0]);
    });

    it('should test navigation and generating action', () => {
        const { UNSAFE_root } = render(<ReportGeneratorScreen />, { wrapper: Wrapper });
        
        // click goBack via arrow-back icon
        const backBtn = UNSAFE_root.find((node: any) => node.props?.name === 'arrow-back');
        if (backBtn) fireEvent.press(backBtn.parent!);
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('should toggle different sections', () => {
        const { getByText } = render(<ReportGeneratorScreen />, { wrapper: Wrapper });
        
        // Os títulos das seções também são chaves de i18n
        const sections = [
            'report.section_summary',
            'report.section_status',
            'report.section_photos',
            'report.section_geo',
            'report.section_history',
        ];

        sections.forEach(section => {
            const btn = getByText(section);
            fireEvent.press(btn);
        });
    });

    it('should generate and share CSV report when CSV format is selected', async () => {
        const mockRoute = { params: { artworkId: 'artwork-123' } };
        const mockArtwork = {
            id: 'artwork-123',
            name: 'Monalisa',
            artist: 'Leonardo da Vinci',
            type: 'painting',
            conservationStatus: 'good',
            address: 'Paris, France',
        };
        const mockInspections = [
            {
                id: 'inspection-456',
                artworkId: 'artwork-123',
                technicalForm: {
                    structuralCondition: 'Estável',
                    surfaceCondition: 'Sujidade leve',
                    recommendation: 'Limpeza superficial',
                    urgencyLevel: 2,
                    statusAtVisit: 'good',
                },
                deviceId: 'device-test',
                updatedAt: '2026-06-16T12:00:00Z',
            }
        ];

        mockArtworkRepo.findById.mockResolvedValue(mockArtwork);
        mockInspectionRepo.findByArtworkId.mockResolvedValue(mockInspections);

        const FileSystem = require('expo-file-system/legacy');
        const Sharing = require('expo-sharing');
        const RN = require('react-native');

        const { getByText } = render(<ReportGeneratorScreen route={mockRoute} />, { wrapper: Wrapper });

        // Select CSV format
        const csvBtn = getByText('CSV');
        fireEvent.press(csvBtn);

        // Click generate button
        // The generate button text depends on format. It should say 'report.export' or just contain the format name 'CSV'
        // Let's find button by testID or by text containing CSV.
        // The text is t('report.export', { format: 'CSV' }) which evaluates to 'report.export' in translation mock
        const generateBtn = getByText('report.export');
        fireEvent.press(generateBtn);

        // Wait for async actions in handleGenerate
        await waitFor(() => {
            expect(RN.Alert.alert).toHaveBeenCalledWith('Sucesso', 'Relatório gerado com sucesso!');
        });

        // Verify FileSystem.writeAsStringAsync was called
        expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
            expect.stringContaining('.csv'),
            expect.stringContaining('\ufeff'), // BOM
            expect.any(Object)
        );

        // Verify content contains artwork and inspection info
        const csvCallArg = FileSystem.writeAsStringAsync.mock.calls[0][1];
        expect(csvCallArg).toContain('Monalisa');
        expect(csvCallArg).toContain('Leonardo da Vinci');
        expect(csvCallArg).toContain('Estável');
        expect(csvCallArg).toContain('Limpeza superficial');

        // Verify Sharing.shareAsync was called
        expect(Sharing.shareAsync).toHaveBeenCalledWith(
            expect.stringContaining('.csv'),
            expect.objectContaining({ mimeType: 'text/csv' })
        );
    });
});
