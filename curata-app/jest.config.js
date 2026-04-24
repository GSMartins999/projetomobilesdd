const { defaults } = require('jest-config');

/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
    setupFilesAfterEnv: [
        '@testing-library/react-native/matchers',
        '<rootDir>/src/__mocks__/setup.ts'
    ],
    setupFiles: [],
    moduleNameMapper: {
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@data/(.*)$': '<rootDir>/src/data/$1',
        '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
        '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/**/__mocks__/**',
        '!src/data/db/schema.ts',
        '!src/data/supabaseClient.ts',
        '!src/infrastructure/i18n/index.ts',
        '!src/infrastructure/navigation/AppNavigator.tsx',
    ],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        }
    },
};
