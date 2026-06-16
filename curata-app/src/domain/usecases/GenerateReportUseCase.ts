import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Artwork } from '../entities/Artwork';
import { Inspection, Photo } from '../entities/Inspection';
import { PhotoRepository } from '../repositories/PhotoRepository';
import { ImageUtils } from '../../infrastructure/utils/ImageUtils';
import * as FileSystem from 'expo-file-system/legacy';
import i18n from '../../infrastructure/i18n';

export class GenerateReportUseCase {
    constructor(private readonly photoRepository?: PhotoRepository) {}

    private async resolveImageUri(path: string | null | undefined): Promise<string | null> {
        if (!path) return null;

        // Se já for uma URL remota (http/https), retorna como está
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        try {
            // Garante que o caminho local comece com file:// para o FileSystem
            let fileUri = path;
            if (!fileUri.startsWith('file://') && fileUri.startsWith('/')) {
                fileUri = `file://${fileUri}`;
            }

            // Corrige a migração do UUID de sandbox do iOS
            if (fileUri.includes('/Documents/')) {
                const filename = fileUri.split('/Documents/').pop();
                if (filename && FileSystem.documentDirectory) {
                    fileUri = `${FileSystem.documentDirectory}${filename}`;
                }
            }
            
            const base64Data = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return `data:image/jpeg;base64,${base64Data}`;
        } catch (error) {
            console.error('[GenerateReportUseCase] Failed to read local image as base64:', error);
            // Fallback para URI file:// em caso de falha
            return path.startsWith('file://') ? path : `file://${path}`;
        }
    }

    async execute(artwork: Artwork, inspections: Inspection[]): Promise<void> {
        // Buscar fotos da obra (capa e outras)
        let coverPhotoUri: string | null = null;
        let otherArtworkPhotos: { resolvedUri: string | null }[] = [];
        if (this.photoRepository) {
            try {
                const artworkPhotos = await this.photoRepository.findByArtworkId(artwork.id);
                const registeredPhotos = artworkPhotos
                    .filter(p => !p.inspectionId)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                
                const coverPhoto = registeredPhotos[0];
                if (coverPhoto) {
                    coverPhotoUri = await this.resolveImageUri(coverPhoto.localPath || coverPhoto.remoteUrl);
                }

                const others = registeredPhotos.slice(1);
                otherArtworkPhotos = await Promise.all(others.map(async (p) => {
                    const resolvedUri = await this.resolveImageUri(p.localPath || p.remoteUrl);
                    return { resolvedUri };
                }));
            } catch (err) {
                console.error('[GenerateReportUseCase] Error loading cover photo:', err);
            }
        }

        // Carregar fotos para cada inspeção se o repositório estiver disponível
        const inspectionsWithPhotos = await Promise.all(inspections.map(async (insp) => {
            let photos: Photo[] = [];
            if (this.photoRepository) {
                photos = await this.photoRepository.findByInspectionId(insp.id);
            }

            const resolvedPhotos = await Promise.all(photos.map(async (p) => {
                const resolvedUri = await this.resolveImageUri(p.localPath || p.remoteUrl);
                return { ...p, resolvedUri };
            }));

            return { ...insp, photos: resolvedPhotos };
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
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status-good { background-color: #ECFDF5; color: #2D6A4F; }
            .status-fair { background-color: #FEFCE8; color: #D4883A; }
            .status-poor { background-color: #FFF5EB; color: #FB8500; }
            .status-urgent { background-color: #FDF0F0; color: #E63946; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Técnico: ${artwork.name}</h1>
          </div>

          <div class="container">
            <div class="section">
              <div class="section-title">Informações Gerais</div>
              ${coverPhotoUri ? `
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="${coverPhotoUri}" style="max-width: 100%; height: 220px; border-radius: 12px; object-fit: cover; border: 1px solid #E8E0D8;" />
                </div>
              ` : ''}
              <div class="row"><span class="label">Artista:</span> <span class="value">${artwork.artist || 'Desconhecido'}</span></div>
              <div class="row"><span class="label">Tipo:</span> <span class="value">${i18n.t(`artwork_type.${artwork.type}`, { defaultValue: artwork.type })}</span></div>
              <div class="row"><span class="label">Status Atual:</span> <span class="value">${i18n.t(`status.${artwork.conservationStatus}`, { defaultValue: artwork.conservationStatus }).toUpperCase()}</span></div>
              <div class="row"><span class="label">Endereço:</span> <span class="value">${artwork.address || 'Não informado'}</span></div>
              
              ${otherArtworkPhotos.length > 0 ? `
                <div style="margin-top: 15px;">
                  <div style="font-weight: bold; font-size: 14px; color: #666; margin-bottom: 10px;">Outras Imagens da Obra:</div>
                  <div class="photo-grid">
                    ${otherArtworkPhotos.map(p => p.resolvedUri ? `<img src="${p.resolvedUri}" class="photo" />` : '').join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <h2 style="color: #1A1A2E; font-size: 20px; margin: 30px 0 15px 0;">Histórico de Inspeções</h2>
            ${inspectionsWithPhotos.map(i => `
              <div class="section">
                <div class="section-title">Inspeção em ${new Date(i.updatedAt).toLocaleDateString('pt-BR')}</div>
                <div class="row"><span class="label">Condição Estrutural:</span> <span class="value">${i.technicalForm.structuralCondition}</span></div>
                <div class="row"><span class="label">Condição Superficial:</span> <span class="value">${i.technicalForm.surfaceCondition}</span></div>
                <div class="row"><span class="label">Recomendação:</span> <span class="value">${i.technicalForm.recommendation}</span></div>
                <div class="row"><span class="label">Nível de Urgência:</span> <span class="value">${i.technicalForm.urgencyLevel} / 5</span></div>
                <div class="row"><span class="label">Status na Visita:</span> <span class="value">${i18n.t(`status.${i.technicalForm.statusAtVisit}`, { defaultValue: i.technicalForm.statusAtVisit })}</span></div>
                
                ${i.photos.length > 0 ? `
                  <div class="photo-grid">
                    ${i.photos.map(p => p.resolvedUri ? `<img src="${p.resolvedUri}" class="photo" />` : '').join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

        try {
            const file = await Print.printToFileAsync({
                html,
                base64: false,
            });
            await Sharing.shareAsync(file.uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('[GenerateReportUseCase] Error generating PDF:', error);
            throw new Error('Falha ao gerar relatório PDF');
        }
    }
}
