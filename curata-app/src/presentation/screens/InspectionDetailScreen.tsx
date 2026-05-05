import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDI } from '../../infrastructure/di/DIContext';
import { Inspection, Photo } from '../../domain/entities/Inspection';

export function InspectionDetailScreen({ route }: any) {
    const { inspectionId } = route.params;
    const { inspectionRepository, photoRepository } = useDI();
    const insets = useSafeAreaInsets();
    const [inspection, setInspection] = useState<Inspection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        async function load() {
            const insp = await inspectionRepository.findById(inspectionId);
            if (insp) {
                setInspection(insp);
                const pts = await photoRepository.findByInspectionId(inspectionId);
                setPhotos(pts);
            }
        }
        load();
    }, [inspectionId]);

    if (!inspection) return <View style={styles.container} />;

    return (
        <ScrollView style={[styles.container, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 40) }}>
            <Text style={styles.headerTitle}>Detalhes da Inspeção</Text>
            <View style={styles.dateRow}>
                <MaterialIcons name="calendar-today" size={16} color="#888" />
                <Text style={styles.date}>
                    {new Date(inspection.updatedAt).toLocaleDateString('pt-BR')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Condição Estrutural</Text>
                <View style={styles.valueCard}>
                    <Text style={styles.valueText}>{inspection.technicalForm.structuralCondition}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Condição Superficial</Text>
                <View style={styles.valueCard}>
                    <Text style={styles.valueText}>{inspection.technicalForm.surfaceCondition}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Recomendação</Text>
                <View style={styles.valueCard}>
                    <Text style={styles.valueText}>{inspection.technicalForm.recommendation}</Text>
                </View>
            </View>

            <Text style={styles.label}>Fotos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                {photos.map((p) => (
                    <Image key={p.id} source={{ uri: p.localPath }} style={styles.photo} />
                ))}
                {photos.length === 0 && (
                    <View style={styles.noPhotosContainer}>
                        <MaterialIcons name="photo-library" size={28} color="#B0A898" />
                        <Text style={styles.noPhotos}>Nenhuma foto registrada</Text>
                    </View>
                )}
            </ScrollView>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F5F0', paddingHorizontal: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 8 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
    date: { fontSize: 14, color: '#888' },
    section: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 8, marginTop: 8 },
    valueCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    valueText: { fontSize: 15, color: '#444', lineHeight: 22 },
    photoRow: { flexDirection: 'row', marginTop: 8 },
    photo: { width: 140, height: 140, borderRadius: 14, marginRight: 12 },
    noPhotosContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    noPhotos: { fontSize: 14, color: '#B0A898' },
});
