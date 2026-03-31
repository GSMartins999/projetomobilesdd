import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// Nome do arquivo do banco de dados local
const DATABASE_NAME = 'curata.db';

export const expoDb = openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expoDb, { schema });

/**
 * Inicializa o banco de dados e cria as tabelas se necessário.
 */
export async function initializeDatabase() {
    console.log('[Database] Inicializando banco de dados...');

    // Criar tabelas se não existirem
    expoDb.execSync(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar_url TEXT,
            updated_at TEXT NOT NULL,
            synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS artworks (
            id TEXT PRIMARY KEY,
            display_id TEXT,
            name TEXT NOT NULL,
            artist TEXT,
            type TEXT NOT NULL,
            conservation_status TEXT NOT NULL,
            notes TEXT,
            latitude REAL,
            longitude REAL,
            address TEXT,
            device_id TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            synced_at TEXT,
            deleted_at TEXT
        );

        CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY,
            artwork_id TEXT NOT NULL REFERENCES artworks(id),
            technical_form TEXT NOT NULL,
            form_version INTEGER NOT NULL DEFAULT 1,
            device_id TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            synced_at TEXT,
            deleted_at TEXT
        );

        CREATE TABLE IF NOT EXISTS photos (
            id TEXT PRIMARY KEY,
            inspection_id TEXT NOT NULL REFERENCES inspections(id),
            artwork_id TEXT NOT NULL REFERENCES artworks(id),
            local_path TEXT NOT NULL,
            remote_url TEXT,
            upload_status TEXT NOT NULL,
            label TEXT NOT NULL,
            "order" INTEGER NOT NULL,
            device_id TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            synced_at TEXT,
            deleted_at TEXT
        );
    `);

    console.log('[Database] Tabelas criadas/verificadas com sucesso.');
    return db;
}

