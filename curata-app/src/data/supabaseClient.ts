import { createClient } from '@supabase/supabase-js';

// Para desenvolvimento local, use variáveis de ambiente ou valores mock.
// Em produção, esses valores devem vir de variáveis de ambiente seguras.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
    },
});
