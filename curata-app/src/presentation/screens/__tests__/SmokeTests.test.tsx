import React from 'react';
import { render } from '@testing-library/react-native';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { AuthProvider } from '../../../infrastructure/auth/AuthContext';
import { SyncProvider } from '../../../infrastructure/sync/SyncContext';
import { NavigationContainer } from '@react-navigation/native';

// Screens
import { DashboardScreen } from '../DashboardScreen';
import { SearchScreen } from '../SearchScreen';
import { ArtworkDetailScreen } from '../ArtworkDetailScreen';
import { InspectionDetailScreen } from '../InspectionDetailScreen';
import { OnboardingScreen } from '../OnboardingScreen';
import { NotificationsScreen } from '../NotificationsScreen';
import { ProfileScreen } from '../ProfileScreen';
import { MapScreen } from '../MapScreen';
import { LoginScreen } from '../LoginScreen';
import { RegisterScreen } from '../RegisterScreen';
import { ArtworkFormScreen } from '../ArtworkFormScreen';
import { CameraScreen } from '../CameraScreen';
import { InspectionFormScreen } from '../InspectionFormScreen';
import { InspectionHistoryScreen } from '../InspectionHistoryScreen';
import { PdfPreviewScreen } from '../PdfPreviewScreen';
import { ReportGeneratorScreen } from '../ReportGeneratorScreen';

// Mock values for DI
const mockDIValues: any = {
    artworkRepository: {
        findAll: jest.fn().mockResolvedValue([]),
        findById: jest.fn().mockResolvedValue(null),
        findNearby: jest.fn().mockResolvedValue([]),
        findUnsynced: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue({ id: '1' }),
        update: jest.fn().mockResolvedValue(undefined),
    },
    inspectionRepository: {
        findByArtworkId: jest.fn().mockResolvedValue([]),
        findById: jest.fn().mockResolvedValue(null),
        findUnsynced: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue({ id: '1' }),
    },
    photoRepository: {
        findByInspectionId: jest.fn().mockResolvedValue([]),
        findUnsyncedPhotos: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue({ id: '1' }),
    },
    authRepository: {
        getCurrentUser: jest.fn().mockResolvedValue(null),
        isTokenValid: jest.fn().mockResolvedValue(false),
        signIn: jest.fn().mockResolvedValue({ user: { id: '1' }, token: 't' }),
        signUp: jest.fn().mockResolvedValue({ user: { id: '1' }, token: 't' }),
        signOut: jest.fn().mockResolvedValue(undefined),
    },
    syncService: {
        sync: jest.fn().mockResolvedValue(undefined),
    },
};

const mockRoute = { params: {} };
const mockRouteWithId = { params: { id: '1', artworkId: '1' } };

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider values={mockDIValues}>
        <AuthProvider>
            <SyncProvider>
                <NavigationContainer>
                    {children}
                </NavigationContainer>
            </SyncProvider>
        </AuthProvider>
    </DIProvider>
);

describe('Presentation Smoke Tests', () => {
    it('DashboardScreen renders', () => { render(<Wrapper><DashboardScreen /></Wrapper>); });
    it('OnboardingScreen renders', () => { render(<Wrapper><OnboardingScreen /></Wrapper>); });
    it('SearchScreen renders', () => { render(<Wrapper><SearchScreen /></Wrapper>); });
    it('NotificationsScreen renders', () => { render(<Wrapper><NotificationsScreen /></Wrapper>); });
    it('ProfileScreen renders', () => { render(<Wrapper><ProfileScreen /></Wrapper>); });
    it('LoginScreen renders', () => { render(<Wrapper><LoginScreen /></Wrapper>); });
    it('RegisterScreen renders', () => { render(<Wrapper><RegisterScreen /></Wrapper>); });

    it('ArtworkDetailScreen renders', () => { render(<Wrapper><ArtworkDetailScreen route={mockRouteWithId as any} /></Wrapper>); });
    it('ArtworkFormScreen renders', () => { render(<Wrapper><ArtworkFormScreen route={mockRoute as any} /></Wrapper>); });
    it('CameraScreen renders', () => { render(<Wrapper><CameraScreen onCapture={() => { }} onClose={() => { }} /></Wrapper>); });
    it('InspectionDetailScreen renders', () => { render(<Wrapper><InspectionDetailScreen route={mockRouteWithId as any} /></Wrapper>); });
    it('InspectionFormScreen renders', () => { render(<Wrapper><InspectionFormScreen route={mockRouteWithId as any} /></Wrapper>); });
    it('InspectionHistoryScreen renders', () => { render(<Wrapper><InspectionHistoryScreen route={mockRouteWithId as any} /></Wrapper>); });
    it('MapScreen renders', () => { render(<Wrapper><MapScreen /></Wrapper>); });
    it('PdfPreviewScreen renders', () => { render(<Wrapper><PdfPreviewScreen route={mockRoute as any} /></Wrapper>); });
    it('ReportGeneratorScreen renders', () => { render(<Wrapper><ReportGeneratorScreen /></Wrapper>); });
});
