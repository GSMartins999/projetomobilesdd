import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// Nome do arquivo do banco de dados local
const DATABASE_NAME = 'curata.db';

export const expoDb = openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expoDb, { schema });

/**
 * Inicializa o banco de dados e aplica migrations se necessário.
 * Em um app real, o drizzle-kit gera arquivos SQL que são lidos aqui.
 * Para o spike v1, vamos apenas garantir que a conexão está aberta.
 */
export async function initializeDatabase() {
    console.log('[Database] Inicializando banco de dados...');
    // No Expo SDK 52 + drizzle-orm, as migrations podem ser aplicadas via `migrate` helper d do drizzle orm.
    // Por enquanto, apenas retornamos a conexão pronta.
    return db;
}
