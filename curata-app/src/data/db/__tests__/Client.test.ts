import { initializeDatabase, db, expoDb } from '../client';

jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn().mockReturnValue({
        execSync: jest.fn(),
    }),
}));

describe('Database Client', () => {
    it('should initialize database and create tables', async () => {
        const result = await initializeDatabase();

        expect(result).toBe(db);
        expect(expoDb.execSync).toHaveBeenCalled();
        expect(expoDb.execSync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS users'));
    });
});
