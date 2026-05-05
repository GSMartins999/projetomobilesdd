import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { useCameraService, usePhotoRepository } from '../../infrastructure/di/DIContext';
import { CameraServiceImpl } from '../../infrastructure/services/CameraServiceImpl';
import { CapturePhotoUseCase } from '../../domain/usecases/CapturePhotoUseCase';

export function CameraScreen({ navigation, route, ...props }: any) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const cameraService = useCameraService() as CameraServiceImpl;
    const photoRepository = usePhotoRepository();

    const capturePhotoUseCase = useMemo(() =>
        new CapturePhotoUseCase(cameraService, photoRepository),
        [cameraService, photoRepository]);

    const cameraRef = useRef<CameraView>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    // Params de navegação
    const { artworkId, inspectionId, label = 'front' } = route?.params || {};
    const onCapture = props.onCapture || route?.params?.onCapture;
    const onClose = props.onClose || route?.params?.onClose || (() => navigation?.goBack());

    // Sincroniza o ref da câmera com o serviço (é limpo no unmount)
    useEffect(() => {
        return () => {
            cameraService.setCameraRef(null);
        };
    }, []);

    const handleRequestPermission = async () => {
        await requestPermission();
    };

    const takePicture = async () => {
        if (isCapturing || !isCameraReady) return;

        if (!cameraRef.current) {
            Alert.alert(t('common.error', 'Erro'), 'Aguarde a câmera inicializar.');
            return;
        }

        setIsCapturing(true);
        try {
            if (artworkId && inspectionId) {
                const photo = await capturePhotoUseCase.execute({
                    artworkId,
                    inspectionId,
                    label: label as any
                });
                if (onCapture) onCapture(photo.localPath);
            } else {
                const raw = await cameraService.takePicture();
                const processed = await cameraService.processImage(raw.uri);
                if (onCapture) onCapture(processed.uri);
            }

            if (onClose) onClose();
        } catch (error: any) {
            console.error('Error taking picture:', error);
            Alert.alert(t('common.error', 'Erro'), t('camera.capture_failed', 'Falha ao capturar foto'));
        } finally {
            setIsCapturing(false);
        }
    };

    // Aguardando resolução de permissão
    if (!permission) {
        return <View style={styles.container} testID="camera-loading" />;
    }

    // Permissão negada
    if (!permission.granted) {
        return (
            <View style={[styles.permissionContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <MaterialIcons name="camera-alt" size={64} color="#E8752A" />
                <Text style={styles.message}>Precisamos da sua permissão para acessar a câmera</Text>
                <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
                    <Text style={styles.buttonText}>Pedir Permissão</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, { marginTop: 10, backgroundColor: 'transparent' }]}
                    onPress={onClose}
                >
                    <Text style={[styles.buttonText, { color: '#E8752A' }]}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                ref={cameraRef}
                onCameraReady={() => {
                    setIsCameraReady(true);
                    if (cameraRef.current) cameraService.setCameraRef(cameraRef.current);
                }}
            />

            {/* Botão fechar — respeita safe area no topo */}
            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    testID="camera-close-button"
                >
                    <MaterialIcons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Botão de captura — respeita safe area no fundo */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={[styles.captureButton, (!isCameraReady || isCapturing) && styles.captureButtonDisabled]}
                    onPress={takePicture}
                    disabled={!isCameraReady || isCapturing}
                    testID="capture-button"
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>
            </View>
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
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    captureButtonDisabled: {
        opacity: 0.4,
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    message: {
        textAlign: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        color: '#333',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#E8752A',
        padding: 15,
        borderRadius: 8,
        alignSelf: 'center',
        minWidth: 180,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#F8F5F0',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
