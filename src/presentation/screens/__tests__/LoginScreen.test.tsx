import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { AuthProvider, useAuth } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';

// Mocks
jest.mock('../../../infrastructure/auth/AuthContext', () => {
    const actual = jest.requireActual('../../../infrastructure/auth/AuthContext');
    return {
        ...actual,
        useAuth: jest.fn(),
    };
});

const mockUseAuth = useAuth as jest.Mock;

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar os campos de e-mail e senha e o botão de entrar', () => {
        mockUseAuth.mockReturnValue({
            login: jest.fn(),
            isLoading: false,
        });

        const { getByPlaceholderText, getByText } = render(<LoginScreen />);

        expect(getByPlaceholderText('E-mail')).toBeTruthy();
        expect(getByPlaceholderText('Senha')).toBeTruthy();
        expect(getByText('Entrar')).toBeTruthy();
    });

    it('deve exibir erro se os campos estiverem vazios ao clicar em entrar', async () => {
        mockUseAuth.mockReturnValue({
            login: jest.fn(),
            isLoading: false,
        });

        const { getByText } = render(<LoginScreen />);
        const loginButton = getByText('Entrar');

        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(getByText('E-mail e senha são obrigatórios')).toBeTruthy();
        });
    });

    it('deve chamar a função de login com as credenciais corretas', async () => {
        const loginSpy = jest.fn().mockResolvedValue(undefined);
        mockUseAuth.mockReturnValue({
            login: loginSpy,
            isLoading: false,
        });

        const { getByPlaceholderText, getByText } = render(<LoginScreen />);

        fireEvent.changeText(getByPlaceholderText('E-mail'), 'test@curata.app');
        fireEvent.changeText(getByPlaceholderText('Senha'), 'password123');
        fireEvent.press(getByText('Entrar'));

        await waitFor(() => {
            expect(loginSpy).toHaveBeenCalledWith('test@curata.app', 'password123');
        });
    });

    it('deve exibir estado de loading quando o login estiver em processamento', () => {
        mockUseAuth.mockReturnValue({
            login: jest.fn(),
            isLoading: true,
        });

        const { getByText, queryByText } = render(<LoginScreen />);

        expect(getByText('Carregando...')).toBeTruthy();
        expect(queryByText('Entrar')).toBeNull();
    });

    it('deve exibir erro retornado pelo serviço de login', async () => {
        const loginSpy = jest.fn().mockRejectedValue(new Error('Credenciais inválidas'));
        mockUseAuth.mockReturnValue({
            login: loginSpy,
            isLoading: false,
        });

        const { getByPlaceholderText, getByText } = render(<LoginScreen />);

        fireEvent.changeText(getByPlaceholderText('E-mail'), 'wrong@test.com');
        fireEvent.changeText(getByPlaceholderText('Senha'), 'wrong');
        fireEvent.press(getByText('Entrar'));

        await waitFor(() => {
            expect(getByText('Credenciais inválidas')).toBeTruthy();
        });
    });
});
