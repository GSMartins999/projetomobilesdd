import { Platform } from 'react-native';

/**
 * Utilitário para lidar com caminhos de imagem de forma robusta entre plataformas.
 */
export const ImageUtils = {
    /**
     * Normaliza um caminho de arquivo ou URL para ser usado no componente Image.
     * Garante que caminhos locais no Android tenham o prefixo file://.
     */
    getImageUri(path: string | null | undefined): string | null {
        if (!path) return null;

        // Se já for uma URL remota (http/https), retorna como está
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        // Se for um caminho local
        if (Platform.OS === 'android') {
            // No Android, caminhos locais capturados pela câmera/manipulator 
            // costumam vir como "file:///..." ou apenas "/data/...".
            // Garantimos que tenha file://
            if (!path.startsWith('file://') && path.startsWith('/')) {
                return `file://${path}`;
            }
        }

        return path;
    }
};
