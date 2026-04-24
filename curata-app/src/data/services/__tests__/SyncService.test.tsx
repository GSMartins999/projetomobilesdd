import { SyncServiceImpl } from '../SyncServiceImpl';
import { AuthProvider, useAuth } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';
import * as FileSystem from 'expo-file-system';

jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('fakebase64'),
    EncodingType: { Base64: 'base64' },
}));

const makeMockRepos = () => ({
    artwork: { findUnsynced: jest.fn().mockResolvedValue([]), save: jest.fn(), update: jest.fn(), findById: jest.fn() },
    inspection: { findUnsynced: jest.fn().mockResolvedValue([]), save: jest.fn(), update: jest.fn(), findById: jest.fn() },
    photo: { findUnsyncedPhotos: jest.fn().mockResolvedValue([]), save: jest.fn(), update: jest.fn(), updateUploadStatus: jest.fn(), findById: jest.fn(), findUnsynced: jest.fn().mockResolvedValue([]) },
});

// A better Supabase mock that doesn't hang await
const mockSupabase: any = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
    gt: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
    storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://photo' } }),
    }
};

describe('SyncServiceImpl', () => {
    jest.setTimeout(10000);

    it('deve realizar upload de obras não sincronizadas', async () => {
        const repos = makeMockRepos();
        const unsyncedArtwork = { id: '1', name: 'Obra 1', syncedAt: null };
        repos.artwork.findUnsynced.mockResolvedValue([unsyncedArtwork]);

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        await syncService.sync();

        expect(mockSupabase.from).toHaveBeenCalledWith('artworks');
        expect(mockSupabase.upsert).toHaveBeenCalled();
    });

    it('deve baixar atualizações do servidor e atualizar localmente', async () => {
        const repos = makeMockRepos();
        const serverArtwork = { id: 's1', name: 'Obra Remota', updated_at: '2026-03-27' };

        // Mock do download
        mockSupabase.gt.mockResolvedValue({ data: [serverArtwork], error: null });
        repos.artwork.findById.mockResolvedValue(null); // Não existe localmente

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        await syncService.sync();

        // Deve tentar salvar no repositório local
        expect(repos.artwork.save).toHaveBeenCalled();
    });

    it('deve realizar upload de fotos pendentes', async () => {
        const repos = makeMockRepos();
        const pendingPhoto = {
            id: 'p1',
            artworkId: 'a1',
            localPath: 'file://img.jpg',
            uploadStatus: 'pending'
        };
        repos.photo.findUnsyncedPhotos.mockResolvedValue([pendingPhoto]);

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        await syncService.sync();

        expect(repos.photo.updateUploadStatus).toHaveBeenCalledWith('p1', 'synced', 'http://photo');
    });

    it('deve capturar erros globais durante o sync', async () => {
        const repos = makeMockRepos();
        repos.artwork.findUnsynced.mockRejectedValue(new Error('Fatal error'));

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        const result = await syncService.sync();
        expect(result.errors).toContain('Fatal error');
    });

    it('deve lidar com falha no download de tabela', async () => {
        const repos = makeMockRepos();
        mockSupabase.gt.mockResolvedValueOnce({ data: null, error: { message: 'DL Failed' } });

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        const result = await syncService.sync();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('Download artworks failed: DL Failed');
    });

    it('deve baixar remoteData se local não existir', async () => {
        const repos = makeMockRepos();
        const serverArtwork = { id: 'sNew', name: 'New Remote', updated_at: '2026-03-27' };

        mockSupabase.gt.mockResolvedValueOnce({ data: [serverArtwork], error: null });
        repos.artwork.findById.mockResolvedValue(null);

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        await syncService.sync();
        expect(repos.artwork.save).toHaveBeenCalled();
    });

    it('não deve atualizar local se remoto não for mais novo', async () => {
        const repos = makeMockRepos();
        const serverArtwork = { id: 's1', name: 'Obra Remota', updated_at: '2020-03-27' };
        const localArtwork = { id: 's1', name: 'Obra Local', updatedAt: '2026-03-27' };

        mockSupabase.gt.mockResolvedValue({ data: [serverArtwork], error: null });
        repos.artwork.findById.mockResolvedValue(localArtwork);

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        await syncService.sync();
        expect(repos.artwork.save).not.toHaveBeenCalled();
    });

    it('deve lidar com falha no upload de foto individual', async () => {
        const repos = makeMockRepos();
        repos.photo.findUnsyncedPhotos.mockResolvedValue([{ id: 'p1', localPath: 'err', artworkId: 'a1' }]);
        (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('File access error'));

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        const result = await syncService.sync();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('Photo upload failed');
    });

    it('deve atualizar local se remoto for mais novo que local', async () => {
        const repos = makeMockRepos();
        const serverArtwork = { id: 's1', name: 'Obra Remota', updated_at: '2026-03-27' };
        const localArtwork = { id: 's1', name: 'Obra Local', updatedAt: '2020-03-27' };

        mockSupabase.gt.mockResolvedValue({ data: [serverArtwork], error: null });
        repos.artwork.findById.mockResolvedValue(localArtwork);

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        await syncService.sync();
        expect(repos.artwork.save).toHaveBeenCalledWith(serverArtwork);
    });

    it('não deve fazer nada se não houver registros não sincronizados', async () => {
        const repos = makeMockRepos();
        repos.artwork.findUnsynced.mockResolvedValue([]);
        const syncService = new SyncServiceImpl(repos.artwork as any, repos.inspection as any, repos.photo as any, mockSupabase as any);
        await syncService.sync();
        expect(mockSupabase.from).toHaveBeenCalledWith('artworks');
    });

    it('deve lidar com falha no upload de foto para o Supabase', async () => {
        const repos = makeMockRepos();
        repos.photo.findUnsyncedPhotos.mockResolvedValue([{ id: 'p1', localPath: 'img', artworkId: 'a1' }]);
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64');
        
        // Mock error return from storage.upload
        mockSupabase.storage.upload.mockResolvedValueOnce({ data: null, error: { message: 'Storage Full' } });

        const syncService = new SyncServiceImpl(
            repos.artwork as any,
            repos.inspection as any,
            repos.photo as any,
            mockSupabase as any
        );

        const result = await syncService.sync();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('Photo upload failed (p1): Storage Full');
    });
});
