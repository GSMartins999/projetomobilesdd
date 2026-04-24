import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportGeneratorScreen } from '../ReportGeneratorScreen';
import { NavigationContainer } from '@react-navigation/native';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ goBack: mockGoBack }),
}));

describe('ReportGeneratorScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const Wrapper = ({ children }: any) => (
        <NavigationContainer>{children}</NavigationContainer>
    );

    it('renders and can change export format', () => {
        const { getByText, getAllByText } = render(<ReportGeneratorScreen />, { wrapper: Wrapper });
        
        expect(getByText('Gerar Relatório')).toBeTruthy();

        const excelBtn = getByText('Excel');
        fireEvent.press(excelBtn);
        expect(getByText('Exportar Excel')).toBeTruthy();
        
        const dateBtns = getAllByText('01/04/2026');
        if (dateBtns.length > 0) fireEvent.press(dateBtns[0]);
    });

    it('should test navigation and generating action', () => {
        global.alert = jest.fn();
        const { getByText, UNSAFE_root } = render(<ReportGeneratorScreen />, { wrapper: Wrapper });
        
        // click goBack
        const backBtn = UNSAFE_root.find((node: any) => node.props?.name === 'arrow-back');
        if (backBtn) fireEvent.press(backBtn.parent!);
        expect(mockGoBack).toHaveBeenCalled();

        // Click sections (covers map toggler if any was clickable, wait sections is just read but they are wrapped in touchable)
        const checkBtn = getByText('Resumo Executivo');
        fireEvent.press(checkBtn);

        // Click generate export
        const expBtn = getByText('Exportar PDF');
        fireEvent.press(expBtn);
        expect(global.alert).toHaveBeenCalled();
    });

    it('should toggle different sections', () => {
        const { getByText } = render(<ReportGeneratorScreen />, { wrapper: Wrapper });
        
        const sections = [
            'Resumo Executivo',
            'Status de Conservação',
            'Fotos das Inspeções',
            'Geolocalização',
            'Histórico de Intervenções'
        ];

        sections.forEach(section => {
            const btn = getByText(section);
            fireEvent.press(btn);
        });
    });
});
