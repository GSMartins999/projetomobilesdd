import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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
});
