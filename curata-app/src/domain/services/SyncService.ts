export interface SyncService {
    /**
     * Executa o ciclo completo de sincronização:
     * 1. Upload de fotos pendentes.
     * 2. Upload de dados locais (artworks, inspections, photos).
     * 3. Download de mudanças do servidor.
     */
    sync(): Promise<SyncResult>;
}

export interface SyncResult {
    uploadedCount: number;
    downloadedCount: number;
    errors: string[];
}
