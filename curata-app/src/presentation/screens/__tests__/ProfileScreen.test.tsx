import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';
import { AuthProvider } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { Alert } from 'react-native';

let mockLocalLang = 'pt-BR';
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue?: string) => defaultValue || key,
        i18n: {
            language: mockLocalLang,
            changeLanguage: jest.fn((lng: string) => { mockLocalLang = lng; }),
        },
    }),
}));

describe('ProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalLang = 'pt-BR';
    });

    const mockAuthRepo = {
        getCurrentUser: jest.fn().mockResolvedValue({ name: 'Test', email: 'test@test.com' }),
        signOut: jest.fn().mockResolvedValue(undefined),
    };

    const Wrapper = ({ children }: any) => (
        <DIProvider values={{ authRepository: mockAuthRepo } as any}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </DIProvider>
    );

    it('renders profile details', async () => {
        const { findByText } = render(<ProfileScreen />, { wrapper: Wrapper });
        await findByText('Test');
        await findByText('test@test.com');
    });

    it('calls logout when pressing logout after confirmation', async () => {
        const spyAlert = jest.spyOn(Alert, 'alert');
        const { findByText } = render(<ProfileScreen />, { wrapper: Wrapper });
        const logoutBtn = await findByText('Sair da conta');
        
        fireEvent.press(logoutBtn);
        
        expect(spyAlert).toHaveBeenCalled();
        
        // Trigger the onPress of the second button (Sair)
        const buttons = spyAlert.mock.calls[0][2] as any;
        if (buttons && buttons[1] && buttons[1].onPress) {
            await act(async () => {
                buttons[1].onPress();
            });
        }

        await waitFor(() => {
            expect(mockAuthRepo.signOut).toHaveBeenCalled();
        });
        spyAlert.mockRestore();
    });

    it('can toggle language', async () => {
        const { findByText, getByText, rerender } = render(<ProfileScreen />, { wrapper: Wrapper });
        await findByText('Test');
        
        const ptBtn = getByText('PT');
        fireEvent.press(ptBtn); 
        rerender(<ProfileScreen />);
        
        const enBtn = getByText('EN');
        fireEvent.press(enBtn);
        rerender(<ProfileScreen />);
    });

    it('renders default info when user is null', async () => {
        mockAuthRepo.getCurrentUser.mockResolvedValueOnce(null);
        const { findByText } = render(<ProfileScreen />, { wrapper: Wrapper });
        await findByText('Curador');
    });

    it('shows correct language names', async () => {
        const { findByText, getByText, rerender } = render(<ProfileScreen />, { wrapper: Wrapper });
        
        // Initial PT
        await findByText(/Portugu/);
        
        // Switch to EN
        const enBtn = getByText('EN');
        fireEvent.press(enBtn);
        
        // Manually trigger re-render as mock variable change doesn't trigger state update
        rerender(<ProfileScreen />);
        
        // Should show English (line 50 branch)
        await findByText(/English/);
    });
});
