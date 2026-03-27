import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { ArtworkType, ConservationStatus } from '../../domain/entities/Artwork';
import { useDI } from '../../infrastructure/di/DIContext';
import { CreateArtworkUseCase } from '../../domain/usecases/CreateArtworkUseCase';
import { DuplicateDetectionUseCase } from '../../domain/usecases/DuplicateDetectionUseCase';
import { GeocodingService } from '../../infrastructure/services/GeocodingService';

export function ArtworkFormScreen({ navigation, route }: any) {
    const { t } = useTranslation();
    const { artworkRepository } = useDI();

    // Dependências injetadas (manual p/ simplificação no MVP)
    const createArtworkUseCase = new CreateArtworkUseCase(
        artworkRepository,
        () => 'device-id-123', // Mock persistente v1
        () => Math.random().toString(36).substr(2, 9) // Mock ID v1
    );
    const duplicateDetectionUseCase = new DuplicateDetectionUseCase(artworkRepository);
    const geocodingService = new GeocodingService();

    // Estado do Form
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');
    const [type, setType] = useState<ArtworkType>('painting');
    const [status, setStatus] = useState<ConservationStatus>('good');
    const [notes, setNotes] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Capturar GPS ao abrir
    useEffect(() => {
        async function getGPS() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);

                // Geocoding reverso
                const addr = await geocodingService.reverseGeocode(loc.coords.latitude, loc.coords.longitude);
                setAddress(addr);

                // Detecção de duplicatas
                const nearby = await duplicateDetectionUseCase.execute(loc.coords.latitude, loc.coords.longitude);
                if (nearby.length > 0) {
                    Alert.alert(
                        'Obra Próxima Detectada',
                        `Encontramos "${nearby[0].name}" a menos de 30m. Deseja vincular a esta obra ou criar uma nova?`,
                        [
                            { text: 'Vincular', onPress: () => navigation.navigate('ArtworkDetail', { id: nearby[0].id }) },
                            { text: 'Criar Nova', style: 'cancel' }
                        ]
                    );
                }
            }
        }
        getGPS();
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            setError(t('artwork.error_name_required', 'Nome da obra é obrigatório'));
            return;
        }

        try {
            setError(null);
            await createArtworkUseCase.execute({
                name,
                artist,
                type,
                conservationStatus: status,
                notes,
                latitude: location?.coords.latitude,
                longitude: location?.coords.longitude,
            });
            navigation.goBack();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>{t('artwork.name', 'Nome da Obra')}</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('artwork.name')}
            />

            <TouchableOpacity
                style={styles.photoContainer}
                testID="photo-pressable"
                onPress={() => navigation.navigate('Camera', { onCapture: setPhotoUri })}
            >
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                    <Text style={styles.photoPlaceholder}>{t('artwork.add_photo', '+ Adicionar Foto')}</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>{t('artwork.status', 'Estado de Conservação')}</Text>
            <View style={styles.pickerContainer}>
                {['good', 'fair', 'poor', 'urgent'].map((s) => (
                    <TouchableOpacity
                        key={s}
                        style={[styles.pickerItem, status === s && styles.pickerItemActive]}
                        onPress={() => setStatus(s as ConservationStatus)}
                    >
                        <Text style={[styles.pickerText, status === s && styles.pickerTextActive]}>{s}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.addressText}>{address || t('artwork.fetching_location', 'Buscando localização...')}</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t('common.save', 'Salvar')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 },
    photoContainer: { height: 200, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
    photo: { width: '100%', height: '100%', borderRadius: 8 },
    photoPlaceholder: { color: '#666' },
    pickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    pickerItem: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, width: '23%', alignItems: 'center' },
    pickerItemActive: { backgroundColor: '#2A4D69', borderColor: '#2A4D69' },
    pickerText: { fontSize: 12, color: '#333' },
    pickerTextActive: { color: '#fff' },
    addressText: { marginTop: 15, fontSize: 12, color: '#999', fontStyle: 'italic' },
    errorText: { color: 'red', marginTop: 10, textAlign: 'center' },
    saveButton: { backgroundColor: '#2A4D69', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
