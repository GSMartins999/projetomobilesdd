import { ConservationStatus } from './Artwork';

export type PhotoLabel = 'front' | 'detail' | 'context';
export type UploadStatus = 'pending' | 'uploading' | 'done' | 'failed';

export interface Photo {
    id: string;
    inspectionId: string;
    artworkId: string;
    localPath: string;
    remoteUrl: string | null;
    uploadStatus: UploadStatus;
    label: PhotoLabel;
    order: number;
    deviceId: string;
    updatedAt: string;
    syncedAt: string | null;
    deletedAt: string | null;
}

export interface TechnicalFormV1 {
    structuralCondition: string;
    surfaceCondition: string;
    deteriorationAgents: string[];
    urgencyLevel: 1 | 2 | 3 | 4 | 5;
    recommendation: string;
    statusAtVisit: ConservationStatus;
}

export interface Inspection {
    id: string;
    artworkId: string;
    technicalForm: TechnicalFormV1;
    formVersion: number;
    deviceId: string;
    updatedAt: string;
    syncedAt: string | null;
    deletedAt: string | null;
}

export interface CreateInspectionInput {
    artworkId: string;
    technicalForm: TechnicalFormV1;
}
