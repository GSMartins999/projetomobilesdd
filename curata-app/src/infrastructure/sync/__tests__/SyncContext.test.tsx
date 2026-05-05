import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { SyncProvider, useSync } from '../SyncContext';
import { DIProvider } from '../../di/DIContext';
import NetInfo from '@react-native-community/netinfo';

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
        // Reset env para URL placeholder (padrão de dev)
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    });

    it('should initialize with online status', async () => {
        const { result } = renderHook(() => useSync(), { wrapper });
        expect(result.current.isOnline).toBe(true);
    });

    it('should handle connectivity changes and auto-sync', async () => {
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
        const { result } = renderHook(() => useSync(), { wrapper });

        const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];

        // Go offline
        await act(async () => {
            handler({ isConnected: false, isInternetReachable: false });
        });
        expect(result.current.isOnline).toBe(false);

        // Go online again
        await act(async () => {
            handler({ isConnected: true, isInternetReachable: true });
        });
        expect(result.current.isOnline).toBe(true);

        // Wait for auto-sync triggered by online transition
        await waitFor(() => expect(mockSyncService.sync).toHaveBeenCalled());
    });

    it('should trigger manual sync', async () => {
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
        mockSyncService.sync.mockResolvedValueOnce({ success: true, count: 5 });
        const { result } = renderHook(() => useSync(), { wrapper });

        await act(async () => {
            await result.current.triggerSync();
        });

        expect(mockSyncService.sync).toHaveBeenCalled();
        expect(result.current.lastSyncResult).toEqual({ success: true, count: 5 });
    });

    it('should handle sync error gracefully', async () => {
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
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

    it('não deve chamar sync quando URL do Supabase é placeholder', async () => {
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
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

    it('deve chamar sync quando URL do Supabase é real', async () => {
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
        mockSyncService.sync.mockResolvedValueOnce({ success: true, count: 0 });

        const { result } = renderHook(() => useSync(), { wrapper });

        await act(async () => {
            await result.current.triggerSync();
        });

        expect(mockSyncService.sync).toHaveBeenCalledTimes(1);
    });
});
