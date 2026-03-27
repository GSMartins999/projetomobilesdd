import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useDI } from '../../infrastructure/di/DIContext';
import { Inspection, Photo } from '../../domain/entities/Inspection';

export function InspectionDetailScreen({ route }: any) {
    const { inspectionId } = route.params;
    const { inspectionRepository, photoRepository } = useDI();
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

    if (!inspection) return <View />;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Detalhes da Inspeção</Text>
            <Text style={styles.date}>Data: {new Date(inspection.updatedAt).toLocaleDateString()}</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Condição Estrutural:</Text>
                <Text style={styles.text}>{inspection.technicalForm.structuralCondition}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Condição Superficial:</Text>
                <Text style={styles.text}>{inspection.technicalForm.surfaceCondition}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Recomendação:</Text>
                <Text style={styles.text}>{inspection.technicalForm.recommendation}</Text>
            </View>

            <Text style={styles.label}>Fotos:</Text>
            <ScrollView horizontal>
                {photos.map((p) => (
                    <Image key={p.id} source={{ uri: p.localPath }} style={styles.photo} />
                ))}
            </ScrollView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    date: { fontSize: 14, color: '#666', marginBottom: 20 },
    section: { marginBottom: 15 },
    label: { fontWeight: 'bold', fontSize: 16 },
    text: { marginTop: 5, color: '#444' },
    photo: { width: 150, height: 150, borderRadius: 8, marginRight: 10, marginTop: 10 }
});
