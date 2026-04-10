import React from 'react';

export const AuthContext = React.createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const value = {
        user: { id: '1', email: 'test@test.com' },
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return {
        user: { id: '1', email: 'test@test.com' },
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
    };
};
