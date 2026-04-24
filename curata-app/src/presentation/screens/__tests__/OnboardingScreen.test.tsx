import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingScreen } from '../OnboardingScreen';

import { AuthProvider } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';

// Mock permissions
jest.mock('expo-camera', () => ({
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' })
}));
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' })
}));
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('../../../infrastructure/notifications/NotificationService', () => ({
    requestNotificationPermission: jest.fn().mockResolvedValue(true)
}));

const mockDIValues: any = {
    authRepository: {
        getCurrentUser: jest.fn().mockResolvedValue(null),
    }
};

const TestWrapper = ({ children }: any) => (
    <DIProvider values={mockDIValues}>
        <AuthProvider>
            {children}
        </AuthProvider>
    </DIProvider>
);

describe('OnboardingScreen', () => {
    beforeEach(() => {
        // Mock the FlatList methods that crash in tests
        jest.spyOn(require('react-native').FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});
    });

    it('renders welcome slide', () => {
        const { getByText } = render(<OnboardingScreen />, { wrapper: TestWrapper });
        expect(getByText('Fotografe obras de arte')).toBeTruthy();
    });

    it('handles next slide and finish', async () => {
        const onFinishMock = jest.fn();
        const { getByText, findByText } = render(<OnboardingScreen onFinish={onFinishMock} />, { wrapper: TestWrapper });

        // Camera permissao
        const camBtn = await findByText('Permitir câmera');
        fireEvent.press(camBtn);
        
        // Location permissao
        const locBtn = await findByText('Permitir localização');
        fireEvent.press(locBtn);
        
        // Finish button
        const startBtn = await findByText('Começar');
        fireEvent.press(startBtn);

        await waitFor(() => {
            expect(onFinishMock).toHaveBeenCalled();
        });
    });

    it('handles skipping onboarding', async () => {
        const onFinishMock = jest.fn();
        const { findByText } = render(<OnboardingScreen onFinish={onFinishMock} />, { wrapper: TestWrapper });

        const skipBtn = await findByText('Pular');
        fireEvent.press(skipBtn);

        await waitFor(() => {
            expect(onFinishMock).toHaveBeenCalled();
        });
    });

    it('shows alert when camera permission is denied', async () => {
        const camMock = require('expo-camera').requestCameraPermissionsAsync;
        camMock.mockResolvedValueOnce({ status: 'denied' });
        const spyAlert = jest.spyOn(require('react-native').Alert, 'alert');

        const { findByText } = render(<OnboardingScreen />, { wrapper: TestWrapper });
        const camBtn = await findByText('Permitir câmera');
        fireEvent.press(camBtn);

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Permissão Negada', expect.stringContaining('câmera'));
        });
        spyAlert.mockRestore();
    });

    it('shows alert when location permission is denied', async () => {
        // move to location slide first
        const { findByText } = render(<OnboardingScreen />, { wrapper: TestWrapper });
        
        // Grant camera first to move
        fireEvent.press(await findByText('Permitir câmera'));

        const locMock = require('expo-location').requestForegroundPermissionsAsync;
        locMock.mockResolvedValueOnce({ status: 'denied' });
        const spyAlert = jest.spyOn(require('react-native').Alert, 'alert');

        const locBtn = await findByText('Permitir localização');
        fireEvent.press(locBtn);

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Permissão Negada', expect.stringContaining('localização'));
        });
        spyAlert.mockRestore();
    });

    it('logs error when secure store fails', async () => {
        const storeMock = require('expo-secure-store').setItemAsync;
        storeMock.mockRejectedValueOnce(new Error('Storage failure'));
        const spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { findByText } = render(<OnboardingScreen />, { wrapper: TestWrapper });
        const skipBtn = await findByText('Pular');
        fireEvent.press(skipBtn);

        await waitFor(() => {
            expect(spyConsole).toHaveBeenCalled();
        });
        spyConsole.mockRestore();
    });
});
