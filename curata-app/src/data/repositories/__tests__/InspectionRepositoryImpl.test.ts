import { InspectionRepositoryImpl } from '../InspectionRepositoryImpl';
import { mockDb } from './mockDb';
import { Inspection } from '../../../domain/entities/Inspection';
import { inspections } from '../../db/schema';

describe('InspectionRepositoryImpl', () => {
    let repository: InspectionRepositoryImpl;

    const mockInspection: Inspection = {
        id: '101',
        artworkId: '1',
        technicalForm: {
            structuralCondition: 'Estável',
            surfaceCondition: 'Limpa',
            deteriorationAgents: [],
            urgencyLevel: 1,
            recommendation: 'Ok',
            statusAtVisit: 'good',
        },
        formVersion: 1,
        deviceId: 'dev',
        updatedAt: '2026-03-27T00:00:00Z',
        syncedAt: null,
        deletedAt: null,
    };

    const dbRow = {
        ...mockInspection,
        technicalForm: JSON.stringify(mockInspection.technicalForm),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new InspectionRepositoryImpl(mockDb as any);
    });

    it('findById deve retornar inspeção com JSON parseado', async () => {
        (mockDb.select() as any).mockResolvedValue([dbRow]);

        const result = await repository.findById('101');
        expect(result).toEqual(mockInspection);
        expect(typeof result?.technicalForm).toBe('object');
    });

    it('findByArtworkId deve retornar lista de inspeções parseadas', async () => {
        (mockDb.select() as any).mockResolvedValue([dbRow]);

        const result = await repository.findByArtworkId('1');
        expect(result).toEqual([mockInspection]);
    });

    it('save deve inserir inspeção com JSON stringified', async () => {
        await repository.save(mockInspection);
        expect(mockDb.insert).toHaveBeenCalledWith(inspections);
        // Verifica se o valor passado para o insert tem a string JSON
        const valuesCall = (mockDb.insert().values as jest.Mock).mock.calls[0][0];
        expect(typeof valuesCall.technicalForm).toBe('string');
        expect(JSON.parse(valuesCall.technicalForm)).toEqual(mockInspection.technicalForm);
    });

    it('findUnsynced deve retornar registros pendentes', async () => {
        (mockDb.select() as any).mockResolvedValue([dbRow]);
        const result = await repository.findUnsynced();
        expect(result).toEqual([mockInspection]);
    });

    it('softDelete deve atualizar deletedAt e updatedAt', async () => {
        await repository.softDelete('101');
        expect(mockDb.update).toHaveBeenCalledWith(inspections);
    });

    it('findById deve retornar null se não encontrar', async () => {
        (mockDb.select() as any).mockResolvedValue([]);
        const result = await repository.findById('999');
        expect(result).toBeNull();
    });
});
