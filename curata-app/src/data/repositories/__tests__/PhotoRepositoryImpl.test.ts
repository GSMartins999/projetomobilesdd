import { PhotoRepositoryImpl } from '../PhotoRepositoryImpl';
import { mockDb } from './mockDb';
import { Photo } from '../../../domain/entities/Inspection';
import { photos } from '../../db/schema';

describe('PhotoRepositoryImpl', () => {
    let repository: PhotoRepositoryImpl;

    const mockPhoto: Photo = {
        id: 'p1',
        inspectionId: 'i1',
        artworkId: 'a1',
        localPath: 'path/to/img.jpg',
        remoteUrl: null,
        uploadStatus: 'pending',
        label: 'front',
        order: 0,
        deviceId: 'dev',
        updatedAt: '2026-03-27T00:00:00Z',
        syncedAt: null,
        deletedAt: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new PhotoRepositoryImpl(mockDb as any);
    });

    it('findByInspectionId deve retornar fotos não deletadas', async () => {
        (mockDb.select() as any).mockResolvedValue([mockPhoto]);
        const result = await repository.findByInspectionId('i1');
        expect(result).toEqual([mockPhoto]);
    });

    it('save deve inserir uma nova foto', async () => {
        await repository.save(mockPhoto);
        expect(mockDb.insert).toHaveBeenCalledWith(photos);
    });

    it('updateUploadStatus deve atualizar status e url', async () => {
        await repository.updateUploadStatus('p1', 'done', 'http://remote.jpg');
        expect(mockDb.update).toHaveBeenCalledWith(photos);
    });

    it('updateUploadStatus deve funcionar sem remoteUrl', async () => {
        await repository.updateUploadStatus('p1', 'failed');
        expect(mockDb.update).toHaveBeenCalledWith(photos);
    });

    it('findUnsyncedPhotos deve retornar fotos pendentes', async () => {
        (mockDb.select() as any).mockResolvedValue([mockPhoto]);
        const result = await repository.findUnsyncedPhotos();
        expect(result).toEqual([mockPhoto]);
    });

    it('softDelete deve marcar foto como deletada', async () => {
        await repository.softDelete('p1');
        expect(mockDb.update).toHaveBeenCalledWith(photos);
    });
});
