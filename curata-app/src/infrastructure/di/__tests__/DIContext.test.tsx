import React from 'react';
import { renderHook } from '@testing-library/react-native';
import {
    DIProvider,
    useDI,
    useArtworkRepository,
    useInspectionRepository,
    usePhotoRepository,
    useAuthRepository,
    useSyncService,
} from '../DIContext';

const mockValues: any = {
    artworkRepository: { findAll: jest.fn() },
    inspectionRepository: { findByArtworkId: jest.fn() },
    photoRepository: { findByInspectionId: jest.fn() },
    authRepository: { getCurrentUser: jest.fn() },
    syncService: { sync: jest.fn() },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider values={mockValues}>{children}</DIProvider>
);

describe('DIContext', () => {
    it('useDI lança erro quando usado fora de um DIProvider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => renderHook(() => useDI())).toThrow('useDI deve ser usado dentro de um DIProvider');
        spy.mockRestore();
    });

    it('useDI retorna o contexto injetado pelo DIProvider', () => {
        const { result } = renderHook(() => useDI(), { wrapper });
        expect(result.current.artworkRepository).toBe(mockValues.artworkRepository);
        expect(result.current.syncService).toBe(mockValues.syncService);
    });

    it('useArtworkRepository retorna o repositório injetado', () => {
        const { result } = renderHook(() => useArtworkRepository(), { wrapper });
        expect(result.current).toBe(mockValues.artworkRepository);
    });

    it('useInspectionRepository retorna o repositório injetado', () => {
        const { result } = renderHook(() => useInspectionRepository(), { wrapper });
        expect(result.current).toBe(mockValues.inspectionRepository);
    });

    it('usePhotoRepository retorna o repositório injetado', () => {
        const { result } = renderHook(() => usePhotoRepository(), { wrapper });
        expect(result.current).toBe(mockValues.photoRepository);
    });

    it('useAuthRepository retorna o repositório injetado', () => {
        const { result } = renderHook(() => useAuthRepository(), { wrapper });
        expect(result.current).toBe(mockValues.authRepository);
    });

    it('useSyncService retorna o service injetado', () => {
        const { result } = renderHook(() => useSyncService(), { wrapper });
        expect(result.current).toBe(mockValues.syncService);
    });
});
