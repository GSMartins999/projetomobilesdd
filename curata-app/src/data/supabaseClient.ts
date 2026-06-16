import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Indica se o Supabase está configurado com credenciais reais.
 * Usado pelos guards de auth e sync para evitar chamadas a URLs inválidas.
 */
export const isSupabaseConfigured = Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    !SUPABASE_ANON_KEY.includes('placeholder') &&
    SUPABASE_URL.startsWith('https://')
);

if (!isSupabaseConfigured) {
    console.warn(
        '[Supabase] ⚠️ Credenciais do Supabase NÃO configuradas.\n' +
        'Crie o arquivo curata-app/.env com:\n' +
        '  EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co\n' +
        '  EXPO_PUBLIC_SUPABASE_ANON_KEY=SEU_ANON_KEY\n' +
        'Auth e Sync serão desabilitados até a configuração.'
    );
}

// Cria o cliente mesmo com valores vazios — os guards em AuthContext e SyncContext
// impedirão chamadas reais quando isSupabaseConfigured === false.
export const supabase = createClient(
    SUPABASE_URL || 'https://not-configured.supabase.co',
    SUPABASE_ANON_KEY || 'not-configured',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);
