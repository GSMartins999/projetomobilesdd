import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Artwork } from '../entities/Artwork';
import { Inspection, Photo } from '../entities/Inspection';
import { PhotoRepository } from '../repositories/PhotoRepository';

export class GenerateReportUseCase {
    constructor(private readonly photoRepository?: PhotoRepository) {}

    async execute(artwork: Artwork, inspections: Inspection[]): Promise<void> {
        // Carregar fotos para cada inspeção se o repositório estiver disponível
        const inspectionsWithPhotos = await Promise.all(inspections.map(async (insp) => {
            let photos: Photo[] = [];
            if (this.photoRepository) {
                photos = await this.photoRepository.findByInspectionId(insp.id);
            }
            return { ...insp, photos };
        }));

        const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.6; }
            .header { background-color: #1A1A2E; color: white; padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px; }
            .header h1 { margin: 0; font-size: 28px; }
            .container { padding: 20px; max-width: 800px; margin: 0 auto; }
            .section { background: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #E8E0D8; }
            .section-title { color: #E8752A; font-size: 18px; font-weight: bold; border-bottom: 2px solid #FDF0E6; padding-bottom: 8px; margin-bottom: 15px; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 140px; color: #666; }
            .value { flex: 1; color: #1A1A2E; }
            .photo-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
            .photo { width: 180px; height: 180px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
            .status-badge { display: inline-block; padding: 4px 12px; borderRadius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status-good { background-color: #ECFDF5; color: #2D6A4F; }
            .status-fair { background-color: #FEFCE8; color: #D4883A; }
            .status-poor { background-color: #FFF5EB; color: #FB8500; }
            .status-urgent { background-color: #FDF0F0; color: #E63946; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Conservação</h1>
            <p>${artwork.name}</p>
          </div>

          <div class="container">
            <div class="section">
              <div class="section-title">Informações Gerais</div>
              <div class="row"><span class="label">Artista:</span> <span class="value">${artwork.artist || 'Desconhecido'}</span></div>
              <div class="row"><span class="label">Tipo:</span> <span class="value">${artwork.type}</span></div>
              <div class="row"><span class="label">Status Atual:</span> <span class="value">${artwork.conservationStatus.toUpperCase()}</span></div>
              <div class="row"><span class="label">Endereço:</span> <span class="value">${artwork.address || 'Não informado'}</span></div>
            </div>
            
            <h2 style="color: #1A1A2E; font-size: 20px; margin: 30px 0 15px 0;">Histórico de Inspeções</h2>
            ${inspectionsWithPhotos.map(i => `
              <div class="section">
                <div class="section-title">Inspeção em ${new Date(i.updatedAt).toLocaleDateString()}</div>
                <div class="row"><span class="label">Condição Estrutural:</span> <span class="value">${i.technicalForm.structuralCondition}</span></div>
                <div class="row"><span class="label">Condição Superficial:</span> <span class="value">${i.technicalForm.surfaceCondition}</span></div>
                <div class="row"><span class="label">Recomendação:</span> <span class="value">${i.technicalForm.recommendation}</span></div>
                
                ${i.photos.length > 0 ? `
                  <div class="photo-grid">
                    ${i.photos.map(p => `<img src="${p.localPath}" class="photo" />`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
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
