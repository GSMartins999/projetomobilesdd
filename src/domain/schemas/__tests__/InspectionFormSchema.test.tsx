import { InspectionFormSchemaV1, getInspectionFormSchema } from '../InspectionFormSchema';

describe('InspectionFormSchemaV1', () => {
    const validForm = {
        structuralCondition: 'Fissuras leves na base',
        surfaceCondition: 'Destacamento de pintura em 20% da área',
        deteriorationAgents: ['umidade', 'vandalismo'],
        urgencyLevel: 3 as const,
        recommendation: 'Limpeza e consolidação da camada pictórica',
        statusAtVisit: 'poor' as const,
    };

    it('valida formulário completo e correto', () => {
        const result = InspectionFormSchemaV1.safeParse(validForm);
        expect(result.success).toBe(true);
    });

    it('rejeita urgencyLevel fora do intervalo 1-5', () => {
        const result = InspectionFormSchemaV1.safeParse({ ...validForm, urgencyLevel: 6 });
        expect(result.success).toBe(false);
    });

    it('rejeita urgencyLevel = 0', () => {
        const result = InspectionFormSchemaV1.safeParse({ ...validForm, urgencyLevel: 0 });
        expect(result.success).toBe(false);
    });

    it('rejeita structuralCondition vazio', () => {
        const result = InspectionFormSchemaV1.safeParse({ ...validForm, structuralCondition: '' });
        expect(result.success).toBe(false);
    });

    it('rejeita recommendation vazio', () => {
        const result = InspectionFormSchemaV1.safeParse({ ...validForm, recommendation: '' });
        expect(result.success).toBe(false);
    });

    it('usa array vazio como valor padrão para deteriorationAgents', () => {
        const { deteriorationAgents, ...withoutAgents } = validForm;
        const result = InspectionFormSchemaV1.safeParse(withoutAgents);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.deteriorationAgents).toEqual([]);
        }
    });

    it('rejeita statusAtVisit inválido', () => {
        const result = InspectionFormSchemaV1.safeParse({ ...validForm, statusAtVisit: 'destroyed' });
        expect(result.success).toBe(false);
    });
});

describe('getInspectionFormSchema', () => {
    it('retorna schema v1 para versão 1', () => {
        const schema = getInspectionFormSchema(1);
        expect(schema).toBe(InspectionFormSchemaV1);
    });

    it('lança erro para versão desconhecida', () => {
        expect(() => getInspectionFormSchema(99)).toThrow('Schema de inspeção versão 99 não encontrado');
    });
});
