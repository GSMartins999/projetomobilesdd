import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AppNavigator } from '../AppNavigator';
import { DIProvider } from '../../di/DIContext';

// Mock de todas as screens para isolar o navigator
jest.mock('../../../presentation/screens/LoginScreen', () => ({
    LoginScreen: () => null,
}));
jest.mock('../../../presentation/screens/MapScreen', () => ({
    MapScreen: () => null,
}));
jest.mock('../../../presentation/screens/SearchScreen', () => ({
    SearchScreen: () => null,
}));
jest.mock('../../../presentation/screens/DashboardScreen', () => ({
    DashboardScreen: () => null,
}));
jest.mock('../../../presentation/screens/ProfileScreen', () => ({
    ProfileScreen: () => null,
}));
jest.mock('../../../presentation/screens/ArtworkFormScreen', () => ({
    ArtworkFormScreen: () => null,
}));
jest.mock('../../../presentation/screens/InspectionFormScreen', () => ({
    InspectionFormScreen: () => null,
}));
jest.mock('../../../presentation/screens/InspectionHistoryScreen', () => ({
    InspectionHistoryScreen: () => null,
}));
jest.mock('../../../presentation/screens/InspectionDetailScreen', () => ({
    InspectionDetailScreen: () => null,
}));
jest.mock('../../../presentation/screens/OnboardingScreen', () => ({
    OnboardingScreen: () => null,
}));
jest.mock('../../../presentation/screens/RegisterScreen', () => ({
    RegisterScreen: () => null,
}));
jest.mock('../../../presentation/screens/ArtworkDetailScreen', () => ({
    ArtworkDetailScreen: () => null,
}));
jest.mock('../../../presentation/screens/NotificationsScreen', () => ({
    NotificationsScreen: () => null,
}));
jest.mock('../../../presentation/screens/ReportGeneratorScreen', () => ({
    ReportGeneratorScreen: () => null,
}));
jest.mock('../../../presentation/screens/PdfPreviewScreen', () => ({
    PdfPreviewScreen: () => null,
}));
jest.mock('../../../presentation/screens/CameraScreen', () => ({
    CameraScreen: () => null,
}));

// Mock do AuthContext com isLoading = true (estado de carregamento)
const mockAuthContext = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
};

jest.mock('../../auth/AuthContext', () => ({
    useAuth: () => mockAuthContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockDIValues: any = {
    artworkRepository: {},
    inspectionRepository: {},
    photoRepository: {},
    authRepository: { getCurrentUser: jest.fn().mockResolvedValue(null) },
    syncService: {},
    cameraService: {},
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider values={mockDIValues}>{children}</DIProvider>
);

describe('AppNavigator', () => {
    it('exibe ActivityIndicator enquanto isLoading é true', async () => {
        mockAuthContext.isLoading = true;

        const { getByTestId } = render(
            <Wrapper>
                <AppNavigator />
            </Wrapper>
        );

        await waitFor(() => {
            // Deve exibir o indicador de loading enquanto o AuthContext resolve
            expect(getByTestId('app-loading-indicator')).toBeTruthy();
        });
    });

    it('não exibe tela em branco — sempre renderiza algo durante o boot', async () => {
        mockAuthContext.isLoading = true;

        const { toJSON } = render(
            <Wrapper>
                <AppNavigator />
            </Wrapper>
        );

        // A árvore não deve ser null (bug anterior: return null)
        expect(toJSON()).not.toBeNull();
    });
});
