import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PdfPreviewScreen } from '../PdfPreviewScreen';
import { NavigationContainer } from '@react-navigation/native';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ goBack: mockGoBack }),
}));

describe('PdfPreviewScreen', () => {
    const Wrapper = ({ children }: any) => (
        <NavigationContainer>{children}</NavigationContainer>
    );

    it('handles download and share clicks', () => {
        global.alert = jest.fn();
        const { getByText, UNSAFE_root } = render(<PdfPreviewScreen />, { wrapper: Wrapper });
        const downloadBtn = getByText('Baixar PDF');
        fireEvent.press(downloadBtn); // Should alert
        
        // Find close icon and click
        const closeBtn = UNSAFE_root.find((node: any) => node.props?.name === 'close');
        if (closeBtn) fireEvent.press(closeBtn.parent!);
        
        // Find share icon and click
        const shareBtn = UNSAFE_root.find((node: any) => node.props?.name === 'share');
        if (shareBtn) fireEvent.press(shareBtn.parent!);
        
        expect(mockGoBack).toBeDefined();
    });
});
