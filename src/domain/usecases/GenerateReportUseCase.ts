import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Artwork } from '../entities/Artwork';
import { Inspection } from '../entities/Inspection';

export class GenerateReportUseCase {
    async execute(artwork: Artwork, inspections: Inspection[]): Promise<void> {
        const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #2A4D69; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Relatório Técnico: ${artwork.name}</h1>
          <div class="section">
            <p><span class="label">Artista:</span> ${artwork.artist || 'Desconhecido'}</p>
            <p><span class="label">Status Atual:</span> ${artwork.conservationStatus}</p>
            <p><span class="label">Endereço:</span> ${artwork.address || 'Não informado'}</p>
          </div>
          
          <h2>Histórico de Inspeções</h2>
          ${inspections.map(i => `
            <div class="section">
              <p><span class="label">Data:</span> ${new Date(i.updatedAt).toLocaleDateString()}</p>
              <p><span class="label">Condição Estrutural:</span> ${i.technicalForm.structuralCondition}</p>
              <p><span class="label">Recomendação:</span> ${i.technicalForm.recommendation}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('[GenerateReportUseCase] Error generating PDF:', error);
            throw new Error('Falha ao gerar relatório PDF');
        }
    }
}
