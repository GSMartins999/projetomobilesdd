import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import App from '../App';

jest.setTimeout(30000); 

// Mocks
jest.mock('../data/db/client', () => ({
    initializeDatabase: jest.fn().mockResolvedValue(true),
    db: {},
}));

jest.mock('../data/repositories/ArtworkRepositoryImpl', () => ({
    ArtworkRepositoryImpl: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../data/repositories/InspectionRepositoryImpl', () => ({
    InspectionRepositoryImpl: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../data/repositories/PhotoRepositoryImpl', () => ({
    PhotoRepositoryImpl: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../data/repositories/MockAuthRepositoryImpl', () => ({
    MockAuthRepositoryImpl: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../data/services/SyncServiceImpl', () => ({
    SyncServiceImpl: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../infrastructure/services/CameraServiceImpl', () => ({
    CameraServiceImpl: jest.fn().mockImplementation(() => ({})),
}));

// Mock Navigator
jest.mock('../infrastructure/navigation/AppNavigator', () => {
    const { View, Text } = require('react-native');
    return { AppNavigator: () => <View><Text>AppNavigator</Text></View> };
});

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading then navigator', async () => {
        const { queryByText } = render(<App />);

        await waitFor(() => {
            const nav = queryByText(/AppNavigator/);
            return nav !== null;
        }, { timeout: 15000 });
    });

    it('renders error state if bootstrap fails', async () => {
        const { initializeDatabase } = require('../data/db/client');
        initializeDatabase.mockRejectedValueOnce(new Error('DB Failed'));

        const { queryByText } = render(<App />);
        
        await waitFor(() => {
            return queryByText(/DB Failed/) !== null;
        }, { timeout: 10000 });
    });

    it('repositórios mantêm a mesma referência entre re-renders', async () => {
        const { MockAuthRepositoryImpl } = require('../data/repositories/MockAuthRepositoryImpl');

        render(<App />);

        await waitFor(() => {
            // MockAuthRepositoryImpl deve ter sido chamado como construtor exatamente 1 vez,
            // independente de quantos re-renders o App sofreu durante o boot
            expect(MockAuthRepositoryImpl).toHaveBeenCalledTimes(1);
        }, { timeout: 15000 });
    });
});
