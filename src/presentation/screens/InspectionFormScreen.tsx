import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
    Image,
    Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDI } from '../../infrastructure/di/DIContext';
import { CreateInspectionUseCase } from '../../domain/usecases/CreateInspectionUseCase';
import { ConservationStatus } from '../../domain/entities/Artwork';
import { PhotoLabel } from '../../domain/entities/Inspection';

export function InspectionFormScreen({ navigation, route }: any) {
    const { artworkId } = route.params;
    const { t } = useTranslation();
    const { inspectionRepository, artworkRepository, photoRepository } = useDI();

    // DI UseCase
    const createInspectionUseCase = new CreateInspectionUseCase(
        inspectionRepository,
        artworkRepository,
        photoRepository,
        () => Math.random().toString(36).substr(2, 9),
        () => Math.random().toString(36).substr(2, 9),
        () => 'device-1'
    );

    // Estado do Form
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
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{t('inspection.new_form', 'Nova Inspeção')}</Text>

            <Text style={styles.label}>Condição Estrutural *</Text>
            <TextInput
                style={styles.input}
                value={structuralCondition}
                onChangeText={setStructuralCondition}
                multiline
            />

            <Text style={styles.label}>Condição Superficial *</Text>
            <TextInput
                style={styles.input}
                value={surfaceCondition}
                onChangeText={setSurfaceCondition}
                multiline
            />

            <Text style={styles.label}>Nível de Urgência [1-5]: {urgencyLevel}</Text>
            <View style={styles.row}>
                {[1, 2, 3, 4, 5].map(v => (
                    <TouchableOpacity
                        key={v}
                        style={[styles.smallButton, urgencyLevel === v && styles.buttonActive]}
                        onPress={() => setUrgencyLevel(v)}
                    >
                        <Text style={urgencyLevel === v && styles.textActive}>{v}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Recomendação Técnica *</Text>
            <TextInput
                style={styles.input}
                value={recommendation}
                onChangeText={setRecommendation}
                placeholder="Recomendação técnica..."
                multiline
            />

            <Text style={styles.label}>Fotos ({photos.length}/10)</Text>
            <ScrollView horizontal styles={styles.photoList}>
                {photos.map((p, i) => (
                    <Image key={i} source={{ uri: p.localPath }} style={styles.photoThumb} />
                ))}
                <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                    <Text>+</Text>
                </TouchableOpacity>
            </ScrollView>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Finalizar Inspeção</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2A4D69' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    smallButton: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, width: 50, alignItems: 'center' },
    buttonActive: { backgroundColor: '#2A4D69' },
    textActive: { color: '#fff' },
    photoList: { flexDirection: 'row', marginTop: 10 },
    photoThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
    addPhotoButton: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', marginTop: 10, textAlign: 'center' },
    saveButton: { backgroundColor: '#2A4D69', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
    saveButtonText: { color: '#fff', fontWeight: 'bold' }
});
