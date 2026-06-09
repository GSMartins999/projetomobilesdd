import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDI } from '../di/DIContext';
import { SyncService, SyncResult } from '../../domain/services/SyncService';
import { supabase } from '../../data/supabaseClient';

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

    const isSyncingRef = useRef(isSyncing);
    isSyncingRef.current = isSyncing;

    const isOnlineRef = useRef(isOnline);
    isOnlineRef.current = isOnline;

    const triggerSync = async () => {
        if (isSyncingRef.current || !isOnlineRef.current) return;

        setIsSyncing(true);
        try {
            // Guarda: não executar sync se as credenciais do Supabase não estiverem configuradas
            const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
            if (supabaseUrl.includes('placeholder')) {
                console.log('[SyncContext] Supabase não configurado — sync ignorado. Simulating delay.');
                await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay para mostrar a tela
                setIsSyncing(false);
                return;
            }

            // Guarda: não executar sync se não houver usuário autenticado no Supabase
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('[SyncContext] Usuário não autenticado — sync ignorado.');
                setIsSyncing(false);
                return;
            }


            const result = await syncService.sync();
            setLastSyncResult(result);
        } catch (error) {
            console.error('[SyncContext] Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const triggerSyncRef = useRef(triggerSync);
    triggerSyncRef.current = triggerSync;

    useEffect(() => {
        // Monitorar conectividade
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = !!state.isConnected && !!state.isInternetReachable;
            setIsOnline(online);

            // Auto-sync ao voltar a ficar online
            if (online && !isSyncingRef.current) {
                triggerSyncRef.current();
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <SyncContext.Provider value={{ isOnline, isSyncing, lastSyncResult, triggerSync }}>
            {children}
        </SyncContext.Provider>
    );
}

export const useSync = () => useContext(SyncContext);
