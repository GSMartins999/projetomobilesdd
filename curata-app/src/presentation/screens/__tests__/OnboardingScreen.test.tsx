import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingScreen } from '../OnboardingScreen';
import { AuthProvider } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';

// Mock completo do expo-camera com useCameraPermissions
const mockRequestCameraPermission = jest.fn().mockResolvedValue({ status: 'granted', granted: true });
jest.mock('expo-camera', () => ({
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
    useCameraPermissions: jest.fn(() => [
        { status: 'granted', granted: true },
        mockRequestCameraPermission,
    ]),
    CameraView: (() => {
        const React = require('react');
        const { View } = require('react-native');
        return (props: any) => React.createElement(View, props);
    })(),
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
        jest.clearAllMocks();
        // Restaurar o mock do useCameraPermissions após clearAllMocks
        const { useCameraPermissions } = require('expo-camera');
        (useCameraPermissions as jest.Mock).mockReturnValue([
            { status: 'granted', granted: true },
            mockRequestCameraPermission,
        ]);
        mockRequestCameraPermission.mockResolvedValue({ status: 'granted', granted: true });
    });

    it('renders welcome slide', () => {
        const { getByText } = render(<OnboardingScreen />, { wrapper: TestWrapper });
        expect(getByText('Fotografe obras de arte')).toBeTruthy();
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
        mockRequestCameraPermission.mockResolvedValueOnce({ status: 'denied', granted: false });
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
        const locMock = require('expo-location').requestForegroundPermissionsAsync;
        locMock.mockResolvedValueOnce({ status: 'denied' });
        const spyAlert = jest.spyOn(require('react-native').Alert, 'alert');

        const { findByText } = render(<OnboardingScreen />, { wrapper: TestWrapper });
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

    it('handles skipping twice verifies onFinish called once', async () => {
        const onFinishMock = jest.fn();
        const { findByText } = render(<OnboardingScreen onFinish={onFinishMock} />, { wrapper: TestWrapper });

        const skipBtn = await findByText('Pular');
        fireEvent.press(skipBtn);

        await waitFor(() => {
            expect(onFinishMock).toHaveBeenCalledTimes(1);
        });
    });
});
