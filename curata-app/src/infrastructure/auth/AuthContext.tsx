import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../domain/entities/User';
import { useDI } from '../di/DIContext';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            user: { id: 'device-id-123', name: 'Curador', email: 'curador@curata.app', avatarUrl: null, updatedAt: new Date().toISOString(), syncedAt: null },
            isAuthenticated: true,
            isLoading: false,
            login: async () => {},
            register: async () => {},
            logout: async () => {},
        };
    }
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const { authRepository } = useDI();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check initial session
        async function init() {
            try {
                const currentUser = await authRepository.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('[AuthContext] Error recovery session:', error);
            } finally {
                setIsLoading(false);
            }
        }
        init();
    }, [authRepository]);

    const login = async (email: string, password: string) => {
        const result = await authRepository.signIn(email, password);
        setUser(result.user);
    };

    const register = async (email: string, password: string, name: string) => {
        const result = await authRepository.signUp(email, password, name);
        setUser(result.user);
    };

    const logout = async () => {
        await authRepository.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
