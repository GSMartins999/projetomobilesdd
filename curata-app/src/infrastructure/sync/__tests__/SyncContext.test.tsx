import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { SyncProvider, useSync } from '../SyncContext';
import { DIProvider } from '../../di/DIContext';
import NetInfo from '@react-native-community/netinfo';

// Permitir controlar isSupabaseConfigured nos testes
const mockSupabaseClient = jest.requireMock('../../../data/supabaseClient');

const mockSyncService: any = {
    sync: jest.fn(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider values={{ syncService: mockSyncService } as any}>
        <SyncProvider>
            {children}
        </SyncProvider>
    </DIProvider>
);

describe('SyncContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Padrão: supabase configurado para os testes
        mockSupabaseClient.isSupabaseConfigured = true;
    });

    it('should initialize with online status', async () => {
        const { result } = renderHook(() => useSync(), { wrapper });
        expect(result.current.isOnline).toBe(true);
    });

    it('should handle connectivity changes and auto-sync', async () => {
        mockSyncService.sync.mockResolvedValue({ success: true, count: 0 });
        const { result } = renderHook(() => useSync(), { wrapper });

        const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];

        // Go offline
        await act(async () => {
            handler({ isConnected: false, isInternetReachable: false });
        });
        expect(result.current.isOnline).toBe(false);

        // Go online again — triggers state update
        await act(async () => {
            handler({ isConnected: true, isInternetReachable: true });
        });
        expect(result.current.isOnline).toBe(true);

        // After online, triggerSync should be callable
        await act(async () => {
            await result.current.triggerSync();
        });
        expect(mockSyncService.sync).toHaveBeenCalled();
    });

    it('should trigger manual sync', async () => {
        mockSyncService.sync.mockResolvedValueOnce({ success: true, count: 5 });
        const { result } = renderHook(() => useSync(), { wrapper });

        await act(async () => {
            await result.current.triggerSync();
        });

        expect(mockSyncService.sync).toHaveBeenCalled();
        expect(result.current.lastSyncResult).toEqual({ success: true, count: 5 });
    });

    it('should handle sync error gracefully', async () => {
        mockSyncService.sync.mockRejectedValueOnce(new Error('Sync failed'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useSync(), { wrapper });

        await act(async () => {
            await result.current.triggerSync();
        });

        expect(result.current.isSyncing).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('[SyncContext] Sync failed:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('should not sync if offline', async () => {
        const { result } = renderHook(() => useSync(), { wrapper });
        const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];

        await act(async () => {
            handler({ isConnected: false, isInternetReachable: false });
        });

        jest.clearAllMocks();

        await act(async () => {
            await result.current.triggerSync();
        });

        expect(mockSyncService.sync).not.toHaveBeenCalled();
    });

    it('não deve chamar sync quando Supabase não está configurado', async () => {
        mockSupabaseClient.isSupabaseConfigured = false;
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const { result } = renderHook(() => useSync(), { wrapper });

        await act(async () => {
            await result.current.triggerSync();
        });

        expect(mockSyncService.sync).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[SyncContext] Supabase não configurado')
        );

        consoleSpy.mockRestore();
    });

    it('deve chamar sync quando Supabase está configurado', async () => {
        mockSupabaseClient.isSupabaseConfigured = true;
        mockSyncService.sync.mockResolvedValueOnce({ success: true, count: 0 });

        const { result } = renderHook(() => useSync(), { wrapper });

        await act(async () => {
            await result.current.triggerSync();
        });

        expect(mockSyncService.sync).toHaveBeenCalledTimes(1);
    });
});
