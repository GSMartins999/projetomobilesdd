import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../RegisterScreen';
import { AuthProvider } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';

// Mocks
const mockRegister = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

const mockAuthRepository: any = {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    signUp: mockRegister,
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
        <DIProvider values={{ authRepository: mockAuthRepository } as any}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </DIProvider>
    </NavigationContainer>
);

describe('RegisterScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show error when required fields are empty', async () => {
        const { findByText, getByText } = render(<RegisterScreen />, { wrapper: TestWrapper });
        const registerButton = await findByText('Cadastrar');

        fireEvent.press(registerButton);

        await waitFor(() => {
            expect(getByText('Todos os campos são obrigatórios')).toBeTruthy();
        });
    });

    it('should show error when passwords do not match', async () => {
        const { findByText, getByText, getByPlaceholderText } = render(<RegisterScreen />, { wrapper: TestWrapper });

        await findByText('Cadastrar');

        fireEvent.changeText(getByPlaceholderText('Seu nome completo'), 'John Doe');
        fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Repita a senha'), 'different');

        fireEvent.press(getByText('Cadastrar'));

        await waitFor(() => {
            expect(getByText('As senhas não coincidem')).toBeTruthy();
        });
    });

    it('should show error when password is too short', async () => {
        const { findByText, getByText, getByPlaceholderText } = render(<RegisterScreen />, { wrapper: TestWrapper });

        await findByText('Cadastrar');

        fireEvent.changeText(getByPlaceholderText('Seu nome completo'), 'John Doe');
        fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), '123');
        fireEvent.changeText(getByPlaceholderText('Repita a senha'), '123');

        fireEvent.press(getByText('Cadastrar'));

        await waitFor(() => {
            expect(getByText('A senha deve ter no mínimo 6 caracteres')).toBeTruthy();
        });
    });

    it('should call register function on success', async () => {
        mockRegister.mockResolvedValueOnce({ user: { id: '1', email: 'john@example.com' } });
        const { findByTestId, getByText, getByPlaceholderText } = render(<RegisterScreen />, { wrapper: TestWrapper });

        const registerBtn = await findByTestId('register-button');

        fireEvent.changeText(getByPlaceholderText('Seu nome completo'), 'John Doe');
        fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Repita a senha'), 'password123');

        fireEvent.press(registerBtn);

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
        });
    });

    it('should navigate back to login', async () => {
        const { findByText } = render(<RegisterScreen />, { wrapper: TestWrapper });
        const loginLink = await findByText('Entrar');

        fireEvent.press(loginLink);

        expect(mockGoBack).toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
        mockRegister.mockRejectedValueOnce(new Error('Email already in use'));
        const { findByText, getByText, getByPlaceholderText } = render(<RegisterScreen />, { wrapper: TestWrapper });

        await findByText('Cadastrar');

        fireEvent.changeText(getByPlaceholderText('Seu nome completo'), 'John Doe');
        fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Repita a senha'), 'password123');

        fireEvent.press(getByText('Cadastrar'));

        await waitFor(() => {
            expect(getByText('Email already in use')).toBeTruthy();
        });
    });
});
