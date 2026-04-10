import React from 'react';
import { render } from '@testing-library/react-native';
import { NotificationsScreen } from '../NotificationsScreen';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import { AuthProvider } from '../../../__mocks__/AuthContextMock';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigation = {
    navigate: jest.fn(),
    setOptions: jest.fn(),
    goBack: jest.fn(),
};

const mockRepos = {
    artworkRepository: { findById: jest.fn().mockResolvedValue({ id: '1', name: 'Test', conservationStatus: 'good', type: 'painting', updatedAt: new Date().toISOString() }), findAll: jest.fn().mockResolvedValue([]), findNearby: jest.fn().mockResolvedValue([]) },
    inspectionRepository: { findByArtworkId: jest.fn().mockResolvedValue([]), findById: jest.fn().mockResolvedValue(null) },
    photoRepository: { findByInspectionId: jest.fn().mockResolvedValue([]), findUnsyncedPhotos: jest.fn().mockResolvedValue([]) },
    authRepository: { getCurrentUser: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com' }) },
    syncService: { sync: jest.fn().mockResolvedValue({ uploadedCount: 0, downloadedCount: 0, errors: [] }) },
};

describe('NotificationsScreen', () => {
    it('deve renderizar sem quebrar', async () => {
        render(
            <NavigationContainer>
                <DIProvider values={mockRepos as any}>
                    <AuthProvider>
                        <NotificationsScreen navigation={mockNavigation as any} route={{ params: { id: '1' } } as any} />
                    </AuthProvider>
                </DIProvider>
            </NavigationContainer>
        );
    });
});
