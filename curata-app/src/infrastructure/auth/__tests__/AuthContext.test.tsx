import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { DIProvider } from '../../di/DIContext';
import { User } from '../../../domain/entities/User';

const mockAuthRepository: any = {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider values={{ authRepository: mockAuthRepository } as any}>
        <AuthProvider>
            {children}
        </AuthProvider>
    </DIProvider>
);

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with current user from repository', async () => {
        const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User', avatarUrl: null, updatedAt: '2026-01-01', syncedAt: null };
        mockAuthRepository.getCurrentUser.mockResolvedValueOnce(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Initially loading
        expect(result.current.isLoading).toBe(true);

        // Wait for initialize
        await act(async () => {
            // Wait for useEffect
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle login successfully', async () => {
        mockAuthRepository.getCurrentUser.mockResolvedValueOnce(null);
        const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User', avatarUrl: null, updatedAt: '2026-01-01', syncedAt: null };
        mockAuthRepository.signIn.mockResolvedValueOnce({ user: mockUser, token: 'fake-token' });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(mockAuthRepository.signIn).toHaveBeenCalledWith('test@example.com', 'password');
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle register successfully', async () => {
        mockAuthRepository.getCurrentUser.mockResolvedValueOnce(null);
        const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User', avatarUrl: null, updatedAt: '2026-01-01', syncedAt: null };
        mockAuthRepository.signUp.mockResolvedValueOnce({ user: mockUser, token: 'fake-token' });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.register('test@example.com', 'password', 'Test User');
        });

        expect(mockAuthRepository.signUp).toHaveBeenCalledWith('test@example.com', 'password', 'Test User');
        expect(result.current.user).toEqual(mockUser);
    });

    it('should handle logout successfully', async () => {
        const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User', avatarUrl: null, updatedAt: '2026-01-01', syncedAt: null };
        mockAuthRepository.getCurrentUser.mockResolvedValueOnce(mockUser);
        mockAuthRepository.signOut.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockAuthRepository.signOut).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should throw error if used outside AuthProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useAuth())).toThrow('useAuth deve ser usado dentro de um AuthProvider');
        consoleSpy.mockRestore();
    });


    it('should handle session recovery error gracefully', async () => {
        mockAuthRepository.getCurrentUser.mockRejectedValueOnce(new Error('Auth error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            // Wait for init
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('[AuthContext] Error recovering session:', expect.any(Error));

        consoleSpy.mockRestore();
    });
});
