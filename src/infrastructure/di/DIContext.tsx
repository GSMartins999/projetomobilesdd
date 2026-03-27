import React, { createContext, useContext, ReactNode } from 'react';
import { ArtworkRepository } from '../../domain/repositories/ArtworkRepository';
import { InspectionRepository } from '../../domain/repositories/InspectionRepository';
import { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

interface DIContextType {
    artworkRepository: ArtworkRepository;
    inspectionRepository: InspectionRepository;
    photoRepository: PhotoRepository;
    authRepository: AuthRepository;
}

const DIContext = createContext<DIContextType | null>(null);

export function useDI() {
    const context = useContext(DIContext);
    if (!context) {
        throw new Error('useDI deve ser usado dentro de um DIProvider');
    }
    return context;
}

// Hooks específicos para facilitar o consumo
export const useArtworkRepository = () => useDI().artworkRepository;
export const useInspectionRepository = () => useDI().inspectionRepository;
export const usePhotoRepository = () => useDI().photoRepository;
export const useAuthRepository = () => useDI().authRepository;

export function DIProvider({ children, values }: { children: ReactNode; values: DIContextType }) {
    return <DIContext.Provider value={values}>{children}</DIContext.Provider>;
}
