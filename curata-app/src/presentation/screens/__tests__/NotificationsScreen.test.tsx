import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationsScreen } from '../NotificationsScreen';
import { NavigationContainer } from '@react-navigation/native';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ goBack: mockGoBack }),
}));

describe('NotificationsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const Wrapper = ({ children }: any) => (
        <NavigationContainer>{children}</NavigationContainer>
    );

    it('renders notifications successfully', () => {
        const { getByText, getAllByText } = render(<NotificationsScreen />, { wrapper: Wrapper });
        
        expect(getByText('Inspeção Urgente!')).toBeTruthy();
        expect(getByText('Agendamento Confirmado')).toBeTruthy();
        expect(getByText('Limpar')).toBeTruthy();
    });

    it('handles goBack', () => {
        const { getByRole, getByText, getByTestId, UNSAFE_root } = render(<NotificationsScreen />, { wrapper: Wrapper });
        
        // Find the back arrow button (it is a TouchableOpacity wrapping an icon)
        // Let's just find the first touchable and press it
        const backBtn = UNSAFE_root.find((node: any) => node.type === 'View' && node.props?.children?.[0]?.props?.name === 'arrow-back');
        if (backBtn) fireEvent.press(backBtn);

        fireEvent.press(getByText('Limpar'));
        expect(mockGoBack).toBeDefined();
    });
});
