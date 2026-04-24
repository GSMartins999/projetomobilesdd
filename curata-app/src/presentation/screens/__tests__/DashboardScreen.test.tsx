import React from 'react';
import { render, waitFor, act, screen, fireEvent } from '@testing-library/react-native';
import { DashboardScreen } from '../DashboardScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { SyncProvider } from '../../../infrastructure/sync/SyncContext';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock NetInfo with ability to trigger listeners
let netInfoCallback: any = null;
jest.mock('@react-native-community/netinfo', () => ({
    useNetInfo: jest.fn().mockReturnValue({ isConnected: true, isInternetReachable: true }),
    addEventListener: jest.fn().mockImplementation((cb) => {
        netInfoCallback = cb;
        return () => { netInfoCallback = null; };
    }),
}));

const makeArtworkRepo = (artworks: any[], unsynced: any[] = []) => ({
    findAll: jest.fn().mockResolvedValue(artworks),
    findUnsynced: jest.fn().mockResolvedValue(unsynced),
});

const makeSyncService = () => ({
    sync: jest.fn().mockResolvedValue({ success: true, count: 0 }),
});

const Wrapper = (deps: any) =>
    ({ children }: { children: React.ReactNode }) => (
        <DIProvider values={deps}>
            <SyncProvider>
                <NavigationContainer>
                    {children}
                </NavigationContainer>
            </SyncProvider>
        </DIProvider>
    );

describe('DashboardScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        netInfoCallback = null;
    });

    it('exibe estatísticas após carregamento', async () => {
        const artworks = [{ id: '1', conservationStatus: 'good', updatedAt: new Date().toISOString() }];
        const artworkRepo = makeArtworkRepo(artworks);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepository: artworkRepo, syncService }),
        });

        await waitFor(() => {
            expect(screen.getByText('TOTAL DE OBRAS')).toBeTruthy();
            expect(screen.getAllByText('01').length).toBeGreaterThan(0);
        });
    });

    it('shows pending sync count when unsynced artworks exist', async () => {
        const artworks = [{ id: '1', conservationStatus: 'good', updatedAt: new Date().toISOString() }];
        const unsynced = [{ id: '1' }];

        const artworkRepo = makeArtworkRepo(artworks, unsynced);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepository: artworkRepo, syncService }),
        });

        expect(await screen.findByText(/Sincronizar 1/)).toBeTruthy();
    });

    it('exibe texto de offline quando desconectado', async () => {
        const artworks = [{ id: '1' }];
        const artworkRepo = makeArtworkRepo(artworks);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepository: artworkRepo, syncService }),
        });

        // Trigger offline state via the listener callback that SyncProvider uses
        act(() => {
            if (netInfoCallback) {
                netInfoCallback({ isConnected: false, isInternetReachable: false });
            }
        });

        expect(await screen.findByText(/Offline/)).toBeTruthy();
    });

    it('navega para Notifications ao clicar no sino', async () => {
        const artworkRepo = makeArtworkRepo([]);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepository: artworkRepo, syncService }),
        });

        await waitFor(() => expect(artworkRepo.findAll).toHaveBeenCalled());
        const btn = screen.getByTestId('notification-button');

        await act(async () => {
            fireEvent.press(btn);
        });

        expect(mockNavigate).toHaveBeenCalledWith('Notifications');
    });

    it('exibe botão de sync e dispara ao clicar', async () => {
        const artworks = [{ id: '1' }];
        const unsynced = [{ id: '1' }];

        const artworkRepo = makeArtworkRepo(artworks, unsynced);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepository: artworkRepo, syncService }),
        });

        const syncBtn = await screen.findByTestId('sync-button');
        await act(async () => {
            fireEvent.press(syncBtn);
        });

        expect(syncService.sync).toHaveBeenCalled();
    });
});
