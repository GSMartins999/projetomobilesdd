import { eq } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { InspectionRepository } from '../../domain/repositories/InspectionRepository';
import { Inspection } from '../../domain/entities/Inspection';
import { inspections } from '../db/schema';
import * as schema from '../db/schema';

export class InspectionRepositoryImpl implements InspectionRepository {
    constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) { }

    async findByArtworkId(artworkId: string): Promise<Inspection[]> {
        const result = await this.db.select().from(inspections).where(eq(inspections.artworkId, artworkId));
        return result.map((item) => ({
            ...item,
            technicalForm: JSON.parse(item.technicalForm),
        })) as Inspection[];
    }

    async findById(id: string): Promise<Inspection | null> {
        const result = await this.db.select().from(inspections).where(eq(inspections.id, id)).limit(1);
        if (!result[0]) return null;
        return {
            ...result[0],
            technicalForm: JSON.parse(result[0].technicalForm),
        } as Inspection;
    }

    async save(inspection: Inspection): Promise<void> {
        await this.db.insert(inspections).values({
            id: inspection.id,
            artworkId: inspection.artworkId,
            technicalForm: JSON.stringify(inspection.technicalForm),
            formVersion: inspection.formVersion,
            deviceId: inspection.deviceId,
            updatedAt: inspection.updatedAt,
            syncedAt: inspection.syncedAt,
            deletedAt: inspection.deletedAt,
        });
    }

    async softDelete(id: string): Promise<void> {
        await this.db.update(inspections)
            .set({
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .where(eq(inspections.id, id));
    }

    async findUnsynced(): Promise<Inspection[]> {
        const result = await this.db.select().from(inspections).where(eq(inspections.syncedAt, null));
        return result.map((item) => ({
            ...item,
            technicalForm: JSON.parse(item.technicalForm),
        })) as Inspection[];
    }
}
