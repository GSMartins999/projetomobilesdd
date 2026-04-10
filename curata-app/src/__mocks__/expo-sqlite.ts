// Mock expo-sqlite — tabela simples em memória
const tables: Record<string, Record<string, unknown>[]> = {};

const mockDb = {
    execAsync: jest.fn(async (sql: string) => {
        // Captura CREATE TABLE
        const createMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        if (createMatch) {
            const table = createMatch[1];
            if (!tables[table]) tables[table] = [];
        }
    }),
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
    getAllAsync: jest.fn(async () => []),
    getFirstAsync: jest.fn(async () => null),
    closeAsync: jest.fn(async () => { }),
    withTransactionAsync: jest.fn(async (fn: () => Promise<void>) => fn()),
};

export const openDatabaseAsync = jest.fn(async (_name: string) => mockDb);
export const openDatabaseSync = jest.fn((_name: string) => ({
    ...mockDb,
    exec: jest.fn(),
    run: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
    all: jest.fn(() => []),
    get: jest.fn(() => null),
    close: jest.fn(),
    withTransaction: jest.fn((fn: () => void) => fn()),
}));

// Helper para testes: limpar tabelas em memória
export const __clearTables = () => {
    Object.keys(tables).forEach((k) => delete tables[k]);
};
