import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Mock AuthRepository para desenvolvimento sem Supabase.
 * Aceita qualquer e-mail/senha e retorna um usuário fictício.
 */
export class MockAuthRepositoryImpl implements AuthRepository {
    private currentUser: User | null = null;
    private currentToken: string | null = null;

    async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
        // Simula um delay de rede
        await this.delay(500);

        const user: User = {
            id: generateId(),
            name: email.split('@')[0] || 'Gestor',
            email,
            avatarUrl: null,
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
        };

        const token = `mock-token-${Date.now()}`;
        this.currentUser = user;
        this.currentToken = token;

        return { user, token };
    }

    async signUp(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
        await this.delay(500);

        const user: User = {
            id: generateId(),
            name: name || email.split('@')[0] || 'Gestor',
            email,
            avatarUrl: null,
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
        };

        const token = `mock-token-${Date.now()}`;
        this.currentUser = user;
        this.currentToken = token;

        return { user, token };
    }

    async signOut(): Promise<void> {
        await this.delay(200);
        this.currentUser = null;
        this.currentToken = null;
    }

    async getCurrentUser(): Promise<User | null> {
        return this.currentUser;
    }

    async refreshToken(): Promise<string | null> {
        if (!this.currentToken) return null;
        this.currentToken = `mock-token-${Date.now()}`;
        return this.currentToken;
    }

    async isTokenValid(): Promise<boolean> {
        return this.currentToken !== null;
    }

    async getTokenExpiresAt(): Promise<Date | null> {
        if (!this.currentToken) return null;
        // Token "expira" em 24h
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
