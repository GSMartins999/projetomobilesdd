import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { ArtworkType, ConservationStatus } from '../../domain/entities/Artwork';
import { useDI } from '../../infrastructure/di/DIContext';
import { CreateArtworkUseCase } from '../../domain/usecases/CreateArtworkUseCase';
import { DuplicateDetectionUseCase } from '../../domain/usecases/DuplicateDetectionUseCase';
import { GeocodingService } from '../../infrastructure/services/GeocodingService';
import { LoadingOverlay } from '../components/LoadingOverlay';

const statusOptions: { key: ConservationStatus; label: string; color: string; bg: string }[] = [
    { key: 'good', label: 'Bom', color: '#2D6A4F', bg: '#ECFDF5' },
    { key: 'fair', label: 'Regular', color: '#D4883A', bg: '#FEFCE8' },
    { key: 'poor', label: 'Precário', color: '#FB8500', bg: '#FFF5EB' },
    { key: 'urgent', label: 'Urgente', color: '#E63946', bg: '#FDF0F0' },
];

const typeOptions: { key: ArtworkType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: 'painting', label: 'Pintura', icon: 'palette' },
    { key: 'sculpture', label: 'Escultura', icon: 'category' },
    { key: 'mural', label: 'Mural', icon: 'brush' },
    { key: 'tile', label: 'Azulejo', icon: 'grid-on' },
    { key: 'relief', label: 'Relevo', icon: 'texture' },
    { key: 'monument', label: 'Monumento', icon: 'account-balance' },
    { key: 'other', label: 'Outro', icon: 'star' },
];


export function ArtworkFormScreen({ navigation, route }: any) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { artworkRepository, photoRepository } = useDI();

<<<<<<< HEAD
    const createArtworkUseCase = React.useMemo(() => new CreateArtworkUseCase(
        artworkRepository,
        () => 'device-id-123',
        () => Math.random().toString(36).substr(2, 9),
        () => new Date().toISOString(),
        photoRepository
    ), [artworkRepository, photoRepository]);

    const duplicateDetectionUseCase = React.useMemo(() => new DuplicateDetectionUseCase(artworkRepository), [artworkRepository]);
    const geocodingService = React.useMemo(() => new GeocodingService(), []);
=======
    const createArtworkUseCase = useMemo(() => new CreateArtworkUseCase(
        artworkRepository,
        () => 'device-id-123',
        () => Math.random().toString(36).substr(2, 9)
    ), [artworkRepository]);

    const duplicateDetectionUseCase = useMemo(() => new DuplicateDetectionUseCase(artworkRepository), [artworkRepository]);
    const geocodingService = useMemo(() => new GeocodingService(), []);
>>>>>>> cce0061 (feat: implement bounding box duplicate detection, add date pickers to reports, increase auth delay, and integrate expo-notifications)

    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');
    const [type, setType] = useState<ArtworkType>('painting');
    const [status, setStatus] = useState<ConservationStatus>('good');
    const [notes, setNotes] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function getGPS() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
                const addr = await geocodingService.reverseGeocode(loc.coords.latitude, loc.coords.longitude);
                setAddress(addr);
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
    }, [geocodingService, duplicateDetectionUseCase, navigation]);

    const handleSave = async (forceCreate = false) => {
        if (!name.trim()) {
            setError(t('artwork.error_name_required', 'Nome da obra é obrigatório'));
            return;
        }
        try {
            setError(null);
            setIsLoading(true);
            // Pequeno delay artificial para garantir que o Modal tenha tempo de ser renderizado na UI thread
            await new Promise(resolve => setTimeout(resolve, 800));
            
            await createArtworkUseCase.execute({
                name,
                artist,
                type,
                conservationStatus: status,
                notes,
                latitude: location?.coords.latitude,
                longitude: location?.coords.longitude,
<<<<<<< HEAD
                photoLocalPath: photoUri || undefined,
=======
                forceCreate
>>>>>>> cce0061 (feat: implement bounding box duplicate detection, add date pickers to reports, increase auth delay, and integrate expo-notifications)
            });
            navigation.goBack();
        } catch (err: any) {
            if (err.message === 'DUPLICATE_DETECTED') {
                Alert.alert(
                    'Duplicata Detectada',
                    'Encontramos outra obra muito próxima a esta localização. Deseja criar uma duplicata mesmo assim?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Salvar Mesmo Assim', onPress: () => handleSave(true) }
                    ]
                );
                return;
            }
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#F8F5F0' }}
            behavior="padding"
        >
            <LoadingOverlay visible={isLoading} message="Salvando obra..." />
            <ScrollView 
                style={[styles.container, { paddingTop: insets.top + 12 }]} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 40) }}
                keyboardShouldPersistTaps="handled"
            >
            <Text style={styles.headerTitle}>Nova Obra</Text>

            <Text style={styles.label}>{t('artwork.name', 'Nome da Obra')}</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome da obra"
                placeholderTextColor="#B0A898"
            />

            <Text style={styles.label}>Artista</Text>
            <TextInput
                style={styles.input}
                value={artist}
                onChangeText={setArtist}
                placeholder="Nome do artista"
                placeholderTextColor="#B0A898"
            />

            <Text style={styles.label}>Tipo de Obra</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={styles.typeScrollContent}>
                {typeOptions.map((tOpt) => (
                    <TouchableOpacity
                        key={tOpt.key}
                        style={[
                            styles.typeCard,
                            type === tOpt.key && styles.typeCardActive
                        ]}
                        onPress={() => setType(tOpt.key)}
                    >
                        <MaterialIcons 
                            name={tOpt.icon} 
                            size={20} 
                            color={type === tOpt.key ? '#FFFFFF' : '#888'} 
                            style={{ marginBottom: 4 }} 
                        />
                        <Text style={[
                            styles.typeCardText,
                            type === tOpt.key && styles.typeCardTextActive
                        ]}>{tOpt.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.photoContainer}
                testID="photo-pressable"
                onPress={() => navigation.navigate('Camera', { onCapture: setPhotoUri })}
                activeOpacity={0.7}
            >
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholderContent}>
                        <MaterialIcons name="photo-camera" size={36} color="#D4883A" />
                        <Text style={styles.photoPlaceholder}>{t('artwork.add_photo', 'Adicionar Foto')}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>{t('artwork.status', 'Estado de Conservação')}</Text>
            <View style={styles.statusGrid}>
                {statusOptions.map((s) => (
                    <TouchableOpacity
                        key={s.key}
                        style={[
                            styles.statusPill,
                            status === s.key
                                ? { backgroundColor: s.bg, borderColor: s.color }
                                : { backgroundColor: '#FFFFFF', borderColor: '#E8E0D8' },
                        ]}
                        onPress={() => setStatus(s.key)}
                    >
                        <Text style={[
                            styles.statusPillText,
                            { color: status === s.key ? s.color : '#888' },
                        ]}>{s.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color="#B0A898" />
                <Text style={styles.addressText}>
                    {address || t('artwork.fetching_location', 'Buscando localização...')}
                </Text>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                <MaterialIcons name="save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>{t('common.save', 'Salvar Obra')}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#F8F5F0' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 8, marginTop: 16 },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E0D8',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1A1A2E',
    },
    typeScroll: { marginTop: 8 },
    typeScrollContent: { paddingRight: 20 },
    typeCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E0D8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
    },
    typeCardActive: {
        backgroundColor: '#D4883A',
        borderColor: '#D4883A',
    },
    typeCardText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
    },
    typeCardTextActive: {
        color: '#FFFFFF',
    },
    photoContainer: {
        height: 180,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E8E0D8',
        borderStyle: 'dashed',
    },
    photo: { width: '100%', height: '100%', borderRadius: 16 },
    photoPlaceholderContent: { alignItems: 'center' },
    photoPlaceholder: { color: '#B0A898', fontSize: 14, marginTop: 8 },
    statusGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    statusPill: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 3,
        alignItems: 'center',
    },
    statusPillText: { fontSize: 12, fontWeight: 'bold' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 6 },
    addressText: { fontSize: 13, color: '#B0A898', fontStyle: 'italic', flex: 1 },
    errorText: { color: '#E63946', marginTop: 12, textAlign: 'center', fontSize: 13 },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#D4883A',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 17 },
});
