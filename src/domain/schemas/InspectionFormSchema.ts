import { z } from 'zod';

export const InspectionFormSchemaV1 = z.object({
    structuralCondition: z.string().min(1, 'Condição estrutural é obrigatória'),
    surfaceCondition: z.string().min(1, 'Condição superficial é obrigatória'),
    deteriorationAgents: z.array(z.string()).default([]),
    urgencyLevel: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
    ]),
    recommendation: z.string().min(1, 'Recomendação é obrigatória'),
    statusAtVisit: z.enum(['good', 'fair', 'poor', 'urgent', 'unknown']),
});

export type InspectionFormV1 = z.infer<typeof InspectionFormSchemaV1>;

// Mapa de schemas por versão — permite ler formulários de versões antigas
export const INSPECTION_FORM_SCHEMAS: Record<number, z.ZodSchema> = {
    1: InspectionFormSchemaV1,
};

export function getInspectionFormSchema(version: number): z.ZodSchema {
    const schema = INSPECTION_FORM_SCHEMAS[version];
    if (!schema) {
        throw new Error(`Schema de inspeção versão ${version} não encontrado`);
    }
    return schema;
}
