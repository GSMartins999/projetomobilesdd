import { SyncServiceImpl } from '../SyncServiceImpl';
import { AuthProvider, useAuth } from '../../../infrastructure/auth/AuthContext';
import { DIProvider } from '../../../infrastructure/di/DIContext';

const makeMockRepos = () => ({
    artwork: { findUnsynced: jest.fn().mockResolvedValue([]), save: jest.fn(), update: jest.fn(), findById: jest.fn() },
    inspection: { findUnsynced: jest.fn().mockResolvedValue([]), save: jest.fn(), update: jest.fn() },
    photo: { findUnsyncedPhotos: jest.fn().mockResolvedValue([]), save: jest.fn(), update: jest.fn(), updateUploadStatus: jest.fn() },
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
        expect(repos.artwork.save).toHaveBeenCalledWith(serverArtwork);
    });
});
