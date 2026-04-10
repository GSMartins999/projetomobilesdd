import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

jest.mock('expo-print', () => ({
    printToFileAsync: jest.fn().mockResolvedValue({ uri: 'fake-uri' }),
}));
jest.mock('expo-sharing', () => ({
    shareAsync: jest.fn().mockResolvedValue(undefined),
}));
import { GenerateReportUseCase } from '../GenerateReportUseCase';
import { Artwork } from '../../entities/Artwork';
import { Inspection } from '../../entities/Inspection';

describe('GenerateReportUseCase', () => {
    let useCase: GenerateReportUseCase;

    const mockArtwork: Artwork = {
        id: '1',
        displayId: 'ART-2026-001',
        name: 'Obra de Teste',
        artist: 'Artista Fictício',
        type: 'painting',
        conservationStatus: 'good',
        notes: null,
        latitude: null,
        longitude: null,
        address: 'Rua do Teste, 123',
        deviceId: 'dev-1',
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        deletedAt: null,
    };

    const mockInspections: Inspection[] = [
        {
            id: '101',
            artworkId: '1',
            technicalForm: {
                structuralCondition: 'Estável',
                surfaceCondition: 'Limpa',
                deteriorationAgents: [],
                urgencyLevel: 1,
                recommendation: 'Manutenção periódica',
                statusAtVisit: 'good',
            },
            formVersion: 1,
            deviceId: 'dev-1',
            updatedAt: new Date().toISOString(),
            syncedAt: '2026-03-27',
            deletedAt: null,
        }
    ];

    beforeEach(() => {
        useCase = new GenerateReportUseCase();
        jest.clearAllMocks();
    });

    it('should generate a PDF and share it', async () => {
        await useCase.execute(mockArtwork, mockInspections);

        expect(Print.printToFileAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringContaining('Relatório Técnico: Obra de Teste')
            })
        );
        expect(Print.printToFileAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringContaining('Artista:</span> Artista Fictício')
            })
        );
        expect(Print.printToFileAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringContaining('Estável')
            })
        );

        expect(Sharing.shareAsync).toHaveBeenCalledWith('fake-uri', {
            UTI: '.pdf',
            mimeType: 'application/pdf'
        });
    });

    it('should handle display defaults if fields are missing', async () => {
        const incompleteArtwork: Artwork = {
            ...mockArtwork,
            artist: null,
            address: null,
        };

        await useCase.execute(incompleteArtwork, mockInspections);

        expect(Print.printToFileAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringContaining('Artista:</span> Desconhecido')
            })
        );
        expect(Print.printToFileAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringContaining('Endereço:</span> Não informado')
            })
        );
    });

    it('should throw an error if Print.printToFileAsync fails', async () => {
        (Print.printToFileAsync as jest.Mock).mockRejectedValueOnce(new Error('Print error'));

        await expect(useCase.execute(mockArtwork, mockInspections))
            .rejects.toThrow('Falha ao gerar relatório PDF');
    });

    it('should throw an error if Sharing.shareAsync fails', async () => {
        (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('Share error'));

        await expect(useCase.execute(mockArtwork, mockInspections))
            .rejects.toThrow('Falha ao gerar relatório PDF');
    });
});
