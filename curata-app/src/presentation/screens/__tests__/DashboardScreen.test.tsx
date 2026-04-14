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

const makeArtworkRepo = (artworks: any[]) => ({
    findAll: jest.fn().mockResolvedValue(artworks),
    findUnsynced: jest.fn().mockResolvedValue([]),
});

const makeSyncService = () => ({
    sync: jest.fn().mockResolvedValue({ success: true, count: 0 }),
});

const Wrapper = ({ artworkRepo, syncService }: { artworkRepo: any; syncService: any }) =>
    ({ children }: { children: React.ReactNode }) => (
        <DIProvider values={{ artworkRepository: artworkRepo, syncService } as any}>
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
    });

    it('exibe estatísticas após carregamento', async () => {
        const RECENT = new Date().toISOString();
        const OLD = new Date(2020, 1, 1).toISOString();

        const artworks = [
            { id: '1', conservationStatus: 'good', updatedAt: RECENT },
            { id: '2', conservationStatus: 'urgent', updatedAt: OLD },
            { id: '3', conservationStatus: 'fair', updatedAt: RECENT },
        ];

        const artworkRepo = makeArtworkRepo(artworks);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepo, syncService }),
        });

        await waitFor(() => {
            expect(screen.getByText('03')).toBeTruthy(); // totalArtworks padded
        });
    });

    it('exibe estado de conexão', async () => {
        const artworkRepo = makeArtworkRepo([]);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepo, syncService }),
        });

        await waitFor(() => {
            // O mock de NetInfo retorna isConnected=true por padrão
            expect(screen.getByText('Conectado')).toBeTruthy();
        });
    });

    it('navega para Notifications ao clicar no sino', async () => {
        const artworkRepo = makeArtworkRepo([]);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepo, syncService }),
        });

        await waitFor(() => expect(artworkRepo.findAll).toHaveBeenCalled());

        // Finds the notification touchable via testID
        const btn = screen.getByTestId('notification-button');

        await act(async () => {
            fireEvent.press(btn);
        });

        expect(mockNavigate).toHaveBeenCalledWith('Notifications');
    });

    it('exibe botão de sync quando totalUnsynced > 0 e dispara sync ao clicar', async () => {
        const artworks = [{ id: '1', conservationStatus: 'fair', updatedAt: new Date().toISOString() }];
        const unsyncedArtworks = [{ id: '1', syncedAt: null }];

        const artworkRepo = {
            findAll: jest.fn().mockResolvedValue(artworks),
            findUnsynced: jest.fn().mockResolvedValue(unsyncedArtworks),
        };
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepo, syncService }),
        });

        const syncBtn = await screen.findByTestId('sync-button');
        expect(syncBtn).toBeTruthy();

        await act(async () => {
            fireEvent.press(syncBtn);
        });

        expect(syncService.sync).toHaveBeenCalled();
    });

    it('exibe "Meu Mapa de Obras" no header', async () => {
        const artworkRepo = makeArtworkRepo([]);
        const syncService = makeSyncService();

        render(<DashboardScreen />, {
            wrapper: Wrapper({ artworkRepo, syncService }),
        });

        await waitFor(() => {
            expect(screen.getByText('Meu Mapa de Obras')).toBeTruthy();
        });
    });
});
