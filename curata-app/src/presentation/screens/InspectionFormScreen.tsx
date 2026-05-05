import React, { useState } from 'react';
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
import { useDI } from '../../infrastructure/di/DIContext';
import { CreateInspectionUseCase } from '../../domain/usecases/CreateInspectionUseCase';
import { ConservationStatus } from '../../domain/entities/Artwork';
import { PhotoLabel } from '../../domain/entities/Inspection';

const statusOptions: { key: ConservationStatus; label: string; color: string; bg: string }[] = [
    { key: 'good', label: 'Bom', color: '#2D6A4F', bg: '#ECFDF5' },
    { key: 'fair', label: 'Regular', color: '#D4883A', bg: '#FEFCE8' },
    { key: 'poor', label: 'Precário', color: '#FB8500', bg: '#FFF5EB' },
    { key: 'urgent', label: 'Urgente', color: '#E63946', bg: '#FDF0F0' },
];

export function InspectionFormScreen({ navigation, route }: any) {
    const { artworkId } = route.params;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { inspectionRepository, artworkRepository, photoRepository } = useDI();

    const createInspectionUseCase = new CreateInspectionUseCase(
        inspectionRepository,
        artworkRepository,
        photoRepository,
        () => Math.random().toString(36).substr(2, 9),
        () => Math.random().toString(36).substr(2, 9),
        () => 'device-1'
    );

    const [inspectionId] = useState(() => Math.random().toString(36).substr(2, 9));
    const [structuralCondition, setStructuralCondition] = useState('');
    const [surfaceCondition, setSurfaceCondition] = useState('');
    const [urgencyLevel, setUrgencyLevel] = useState<number>(3);
    const [recommendation, setRecommendation] = useState('');
    const [statusAtVisit, setStatusAtVisit] = useState<ConservationStatus>('fair');
    const [photos, setPhotos] = useState<{ localPath: string; label: PhotoLabel }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleAddPhoto = () => {
        if (photos.length >= 10) {
            Alert.alert('Limite Atingido', 'Máximo de 10 fotos por inspeção.');
            return;
        }
        navigation.navigate('Camera', {
            artworkId,
            inspectionId,
            label: 'front', // v1 default
            onCapture: (uri: string) => {
                setPhotos([...photos, { localPath: uri, label: 'front' }]);
            }
        });
    };

    const handleSave = async () => {
        if (!structuralCondition || !surfaceCondition || !recommendation) {
            setError('Todos os campos obrigatórios devem ser preenchidos');
            return;
        }
        try {
            await createInspectionUseCase.execute({
                artworkId,
                technicalForm: {
                    structuralCondition,
                    surfaceCondition,
                    deteriorationAgents: [],
                    urgencyLevel: urgencyLevel as any,
                    recommendation,
                    statusAtVisit,
                },
                photos,
            });
            navigation.goBack();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#F8F5F0' }}
            behavior="padding"
        >
            <ScrollView 
                style={[styles.container, { paddingTop: insets.top + 12 }]} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 40) }}
                keyboardShouldPersistTaps="handled"
            >
            <Text style={styles.headerTitle}>{t('inspection.new_form', 'Nova Inspeção')}</Text>

            <Text style={styles.label}>Condição Estrutural *</Text>
            <TextInput
                style={styles.textArea}
                value={structuralCondition}
                onChangeText={setStructuralCondition}
                multiline
                placeholder="Descreva a condição estrutural..."
                placeholderTextColor="#B0A898"
            />

            <Text style={styles.label}>Condição Superficial *</Text>
            <TextInput
                style={styles.textArea}
                value={surfaceCondition}
                onChangeText={setSurfaceCondition}
                multiline
                placeholder="Descreva a condição superficial..."
                placeholderTextColor="#B0A898"
            />

            <Text style={styles.label}>Nível de Urgência: {urgencyLevel}</Text>
            <View style={styles.urgencyRow}>
                {[1, 2, 3, 4, 5].map(v => {
                    const isActive = urgencyLevel === v;
                    const getColor = () => {
                        if (v <= 2) return '#2D6A4F';
                        if (v === 3) return '#D4883A';
                        return '#E63946';
                    };
                    return (
                        <TouchableOpacity
                            key={v}
                            style={[
                                styles.urgencyBtn,
                                isActive && { backgroundColor: getColor(), borderColor: getColor() },
                            ]}
                            onPress={() => setUrgencyLevel(v)}
                        >
                            <Text style={[styles.urgencyText, isActive && { color: '#fff' }]}>{v}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.label}>Estado na Visíta</Text>
            <View style={styles.statusRow}>
                {statusOptions.map((s) => (
                    <TouchableOpacity
                        key={s.key}
                        style={[
                            styles.statusPill,
                            statusAtVisit === s.key
                                ? { backgroundColor: s.bg, borderColor: s.color }
                                : { backgroundColor: '#FFFFFF', borderColor: '#E8E0D8' },
                        ]}
                        onPress={() => setStatusAtVisit(s.key)}
                    >
                        <Text style={[
                            styles.statusPillText,
                            { color: statusAtVisit === s.key ? s.color : '#888' },
                        ]}>{s.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Recomendação Técnica *</Text>
            <TextInput
                style={styles.textArea}
                value={recommendation}
                onChangeText={setRecommendation}
                placeholder="Recomendação técnica..."
                placeholderTextColor="#B0A898"
                multiline
            />

            <Text style={styles.label}>Fotos ({photos.length}/10)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                {photos.map((p, i) => (
                    <View key={i} style={styles.photoWrapper}>
                        <Image source={{ uri: p.localPath }} style={styles.photoThumb} />
                        <TouchableOpacity
                            style={styles.removePhotoBtn}
                            onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                            testID={`remove-photo-${i}`}
                        >
                            <MaterialIcons name="close" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                    <MaterialIcons name="photo-camera" size={24} color="#D4883A" />
                    <Text style={styles.addPhotoText}>Adicionar</Text>
                </TouchableOpacity>
            </ScrollView>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                <MaterialIcons name="save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Finalizar Inspeção</Text>
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
    textArea: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E0D8',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#1A1A2E',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    urgencyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    urgencyBtn: {
        width: 52,
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E8E0D8',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    urgencyText: { fontSize: 18, fontWeight: 'bold', color: '#888' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
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
    photoRow: { flexDirection: 'row', marginTop: 8 },
    photoThumb: { width: 80, height: 80, borderRadius: 12, marginRight: 10 },
    addPhotoBtn: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E0D8',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotoText: { fontSize: 10, color: '#B0A898', marginTop: 4 },
    photoWrapper: { position: 'relative', marginRight: 10 },
    removePhotoBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'rgba(230, 57, 70, 0.9)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
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
