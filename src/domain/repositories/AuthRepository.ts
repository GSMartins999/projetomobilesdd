import { User } from '../entities/User';

export interface AuthRepository {
    signIn(email: string, password: string): Promise<{ user: User; token: string }>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    refreshToken(): Promise<string | null>;
    isTokenValid(): Promise<boolean>;
    getTokenExpiresAt(): Promise<Date | null>;
}
