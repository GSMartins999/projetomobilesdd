import { SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';

const JWT_STORE_KEY = 'curata_jwt';

export class AuthRepositoryImpl implements AuthRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user || !data.session) {
            throw new Error(error?.message || 'Erro ao realizar login');
        }

        const user: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Gestor',
            email: data.user.email!,
            avatarUrl: data.user.user_metadata?.avatar_url || null,
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
        };

        const token = data.session.access_token;
        await SecureStore.setItemAsync(JWT_STORE_KEY, token);

        return { user, token };
    }

    async signUp(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error || !data.user || !data.session) {
            throw new Error(error?.message || 'Erro ao criar conta');
        }

        const user: User = {
            id: data.user.id,
            name: name || data.user.email?.split('@')[0] || 'Gestor',
            email: data.user.email!,
            avatarUrl: null,
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
        };

        const token = data.session.access_token;
        await SecureStore.setItemAsync(JWT_STORE_KEY, token);

        return { user, token };
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
        await SecureStore.deleteItemAsync(JWT_STORE_KEY);
    }

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return null;

        return {
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Gestor',
            email: user.email!,
            avatarUrl: user.user_metadata?.avatar_url || null,
            updatedAt: new Date().toISOString(), // Mock local
            syncedAt: new Date().toISOString(),
        };
    }

    async refreshToken(): Promise<string | null> {
        const { data, error } = await this.supabase.auth.refreshSession();
        if (error || !data.session) return null;

        const token = data.session.access_token;
        await SecureStore.setItemAsync(JWT_STORE_KEY, token);
        return token;
    }

    async isTokenValid(): Promise<boolean> {
        const token = await SecureStore.getItemAsync(JWT_STORE_KEY);
        if (!token) return false;

        const expiresAt = await this.getTokenExpiresAt();
        if (!expiresAt) return true; // Se não houver expiração no token, assume-se válido (ex: token fixo)

        const now = new Date();
        // Se o token expirou, permite uso por mais 7 dias (grace period)
        const gracePeriodEnd = new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        return now <= gracePeriodEnd;
    }

    async getTokenExpiresAt(): Promise<Date | null> {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session?.expires_at) return null;
        return new Date(session.expires_at * 1000);
    }
}
