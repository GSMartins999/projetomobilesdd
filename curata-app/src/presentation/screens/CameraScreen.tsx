import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { useCameraService, usePhotoRepository } from '../../infrastructure/di/DIContext';
import { CameraServiceImpl } from '../../infrastructure/services/CameraServiceImpl';
import { CapturePhotoUseCase } from '../../domain/usecases/CapturePhotoUseCase';

export function CameraScreen({ navigation, route, ...props }: any) {
    const { t } = useTranslation();
    const cameraService = useCameraService() as CameraServiceImpl;
    const photoRepository = usePhotoRepository();

    const capturePhotoUseCase = useMemo(() =>
        new CapturePhotoUseCase(cameraService, photoRepository),
        [cameraService, photoRepository]);

    const cameraRef = useRef<CameraView>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    // Params de navegação
    const { artworkId, inspectionId, label = 'front' } = route.params || {};
    const onCapture = props.onCapture || route?.params?.onCapture;
    const onClose = props.onClose || route?.params?.onClose || (() => navigation?.goBack());

    // Sincroniza o ref da câmera com o serviço
    useEffect(() => {
        if (cameraRef.current) {
            cameraService.setCameraRef(cameraRef.current);
        }
    }, [cameraRef.current]);

    const takePicture = async () => {
        if (isCapturing) return;
        setIsCapturing(true);
        try {
            // Se tivermos os IDs necessários, usamos o UseCase para persistência total
            if (artworkId && inspectionId) {
                const photo = await capturePhotoUseCase.execute({
                    artworkId,
                    inspectionId,
                    label: label as any
                });

                if (onCapture) {
                    onCapture(photo.localPath);
                }
            } else {
                // Legado/Fallback: Apenas captura e processa
                const raw = await cameraService.takePicture();
                const processed = await cameraService.processImage(raw.uri);
                if (onCapture) {
                    onCapture(processed.uri);
                }
            }

            if (onClose) {
                onClose();
            }
        } catch (error: any) {
            console.error('Error taking picture:', error);
            Alert.alert(t('common.error', 'Erro'), t('camera.capture_failed', 'Falha ao capturar foto'));
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose} testID="camera-close-button">
                        <MaterialIcons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={takePicture}
                        disabled={isCapturing}
                        testID="capture-button"
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 40,
    },
    captureButton: {
        position: 'absolute',
        bottom: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        left: -20,
        padding: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff',
    },
    button: {
        backgroundColor: '#E8752A',
        padding: 15,
        borderRadius: 8,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
