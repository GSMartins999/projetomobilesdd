const { defaults } = require('jest-config');

/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
    setupFilesAfterEnv: [
        '@testing-library/jest-native/extend-expect',
        '<rootDir>/src/__mocks__/setup.ts'
    ],
    setupFiles: [],
    moduleNameMapper: {
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@data/(.*)$': '<rootDir>/src/data/$1',
        '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
        '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    },
    // testPathPattern: undefined,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/**/__mocks__/**',
    ],
    coverageThreshold: {
        'src/domain/**': { lines: 80, functions: 80 },
        'src/data/**': { lines: 70, functions: 70 },
        'src/presentation/**': { lines: 70, functions: 70 },
    },
    // testEnvironment: 'node',
};
