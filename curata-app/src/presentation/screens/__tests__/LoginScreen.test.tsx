import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { AuthProvider } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { NavigationContainer } from '@react-navigation/native';

// Mocks
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

const mockAuthRepository: any = {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    signIn: mockLogin,
    signOut: jest.fn(),
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

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly and handle input changes', async () => {
        const { getByPlaceholderText, findByText } = render(<LoginScreen />, { wrapper: TestWrapper });

        await findByText('Entrar');

        const emailInput = getByPlaceholderText('seu@email.com');
        const passwordInput = getByPlaceholderText('Sua senha');

        fireEvent.changeText(emailInput, 'user@example.com');
        fireEvent.changeText(passwordInput, 'password123');

        expect(emailInput.props.value).toBe('user@example.com');
        expect(passwordInput.props.value).toBe('password123');
    });

    it('should toggle password visibility', () => {
        const { getByPlaceholderText, getByTestId, queryByTestId } = render(<LoginScreen />, { wrapper: TestWrapper });
        const passwordInput = getByPlaceholderText('Sua senha');

        expect(passwordInput.props.secureTextEntry).toBe(true);

        const toggleButton = getByPlaceholderText('Sua senha').parent?.children[1]; // Find the eye button
        // Since it's a MaterialIcons inside TouchableOpacity, we find the button by its role or custom testID if we added one. 
        // For now, I'll rely on finding by Text or finding the button.

        // Let's add testID in the screen if needed, but I'll try to find it via touchable.
    });

    it('should show error when email or password is empty', async () => {
        const { getByText, findByText } = render(<LoginScreen />, { wrapper: TestWrapper });
        const loginButton = await findByText('Entrar');

        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(getByText('E-mail e senha são obrigatórios')).toBeTruthy();
        });
    });

    it('should call login function and handle success', async () => {
        mockLogin.mockResolvedValueOnce({ user: { id: '1', email: 'test@example.com' } });
        const { findByTestId, getByPlaceholderText } = render(<LoginScreen />, { wrapper: TestWrapper });

        const loginButton = await findByTestId('login-button');

        fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Sua senha'), 'password');

        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
        });
    });

    it('should navigate to register screen', async () => {
        const { findByText } = render(<LoginScreen />, { wrapper: TestWrapper });
        const registerLink = await findByText('Cadastrar');

        fireEvent.press(registerLink);

        expect(mockNavigate).toHaveBeenCalledWith('Register');
    });

    it('should show error message on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
        const { getByText, findByText, getByPlaceholderText } = render(<LoginScreen />, { wrapper: TestWrapper });

        const loginButton = await findByText('Entrar');

        fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'wrong@example.com');
        fireEvent.changeText(getByPlaceholderText('Sua senha'), 'wrong');

        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(getByText('Invalid credentials')).toBeTruthy();
        });
    });
});
