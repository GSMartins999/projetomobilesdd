import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../domain/entities/User';
import { useDI } from '../di/DIContext';
import { isSupabaseConfigured } from '../../data/supabaseClient';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSupabaseReady: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
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
                // Se o Supabase não estiver configurado, não tenta recuperar sessão
                if (!isSupabaseConfigured) {
                    console.log('[AuthContext] Supabase não configurado — sessão ignorada.');
                    setIsLoading(false);
                    return;
                }

                const currentUser = await authRepository.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('[AuthContext] Error recovering session:', error);
            } finally {
                setIsLoading(false);
            }
        }
        init();
    }, [authRepository]);

    const login = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            throw new Error(
                'Supabase não configurado. Crie o arquivo .env com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.'
            );
        }
        const result = await authRepository.signIn(email, password);
        setUser(result.user);
    };

    const register = async (email: string, password: string, name: string) => {
        if (!isSupabaseConfigured) {
            throw new Error(
                'Supabase não configurado. Crie o arquivo .env com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.'
            );
        }
        const result = await authRepository.signUp(email, password, name);
        if (!result.token) {
            throw new Error(
                'Conta criada com sucesso! Por favor, confirme seu e-mail (verifique a caixa de entrada/spam) antes de entrar.'
            );
        }
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
            isSupabaseReady: isSupabaseConfigured,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
