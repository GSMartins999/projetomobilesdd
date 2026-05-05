import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDI } from '../di/DIContext';
import { SyncService, SyncResult } from '../../domain/services/SyncService';

interface SyncContextData {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncResult: SyncResult | null;
    triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextData>({} as SyncContextData);

export function SyncProvider({ children }: { children: React.ReactNode }) {
    const { syncService } = useDI();
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

    useEffect(() => {
        // Monitorar conectividade
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = !!state.isConnected && !!state.isInternetReachable;
            setIsOnline(online);

            // Auto-sync ao voltar a ficar online
            if (online && !isSyncing) {
                triggerSync();
            }
        });

        return () => unsubscribe();
    }, []);

    const triggerSync = async () => {
        if (isSyncing || !isOnline) return;

        // Guarda: não executar sync se as credenciais do Supabase não estiverem configuradas
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
        if (supabaseUrl.includes('placeholder')) {
            console.log('[SyncContext] Supabase não configurado — sync ignorado. Defina EXPO_PUBLIC_SUPABASE_URL no .env');
            return;
        }

        setIsSyncing(true);
        try {
            const result = await syncService.sync();
            setLastSyncResult(result);
        } catch (error) {
            console.error('[SyncContext] Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <SyncContext.Provider value={{ isOnline, isSyncing, lastSyncResult, triggerSync }}>
            {children}
        </SyncContext.Provider>
    );
}

export const useSync = () => useContext(SyncContext);
