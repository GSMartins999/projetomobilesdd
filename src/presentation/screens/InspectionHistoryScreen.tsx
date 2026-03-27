import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDI } from '../../infrastructure/di/DIContext';
import { Inspection } from '../../domain/entities/Inspection';

export function InspectionHistoryScreen({ route, navigation }: any) {
    const { artworkId } = route.params;
    const { inspectionRepository } = useDI();
    const [inspections, setInspections] = useState<Inspection[]>([]);

    useEffect(() => {
        async function load() {
            const data = await inspectionRepository.findByArtworkId(artworkId);
            setInspections(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        }
        load();
    }, [artworkId]);

    return (
        <View style={styles.container}>
            <FlatList
                data={inspections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('InspectionDetail', { inspectionId: item.id })}
                    >
                        <View>
                            <Text style={styles.date}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
                            <Text style={styles.status}>{item.technicalForm.statusAtVisit}</Text>
                        </View>
                        <Text style={styles.urgency}>Urgência: {item.technicalForm.urgencyLevel}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 10 },
    card: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: 16, fontWeight: 'bold' },
    status: { color: '#666', marginTop: 4 },
    urgency: { fontSize: 12, color: '#f00' }
});
