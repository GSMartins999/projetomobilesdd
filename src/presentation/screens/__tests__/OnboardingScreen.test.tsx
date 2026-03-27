import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { OnboardingScreen } from '../OnboardingScreen';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';

// Mock NotificationService explicitly
jest.mock('../../../infrastructure/notifications/NotificationService', () => ({
    requestNotificationPermission: jest.fn().mockResolvedValue(true),
}));

describe('OnboardingScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar 4 slides', () => {
        const { getByText } = render(<OnboardingScreen />);
        expect(getByText(/Bem-vindo ao Curata/i)).toBeTruthy();
    });

    it('deve solicitar permissão de câmera no slide correspondente', async () => {
        const { getByText, getByTestId } = render(<OnboardingScreen />);
        const nextButton = getByTestId('next-button');

        // Simular navegação para o slide de câmera (Slide 2)
        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(getByText(/Conceder Permissão de Câmera/i)).toBeTruthy();
        });

        const permissionButton = getByText(/Conceder Permissão de Câmera/i);
        fireEvent.press(permissionButton);

        await waitFor(() => {
            expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
        });
    });

    it('deve solicitar permissão de localização no slide correspondente', async () => {
        const { getByText, getByTestId } = render(<OnboardingScreen />);
        const nextButton = getByTestId('next-button');

        // Slide 2
        fireEvent.press(nextButton);
        // Slide 3
        await waitFor(() => getByText(/Conceder Permissão de Câmera/i));
        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(getByText(/Conceder Permissão de Localização/i)).toBeTruthy();
        });

        const permissionButton = getByText(/Conceder Permissão de Localização/i);
        fireEvent.press(permissionButton);

        await waitFor(() => {
            expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
        });
    });

    it('deve concluir o onboarding no último slide', async () => {
        const onFinish = jest.fn();
        const { getByText, getAllByText, getByTestId } = render(<OnboardingScreen onFinish={onFinish} />);
        const nextButton = getByTestId('next-button');

        // Navegar até o fim
        fireEvent.press(nextButton);
        await waitFor(() => getByText(/Conceder Permissão de Câmera/i));

        fireEvent.press(nextButton);
        await waitFor(() => getByText(/Conceder Permissão de Localização/i));

        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(getAllByText(/Começar/i).length).toBeGreaterThan(0);
        });

        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(onFinish).toHaveBeenCalled();
        }, { timeout: 5000 });
    });
});
