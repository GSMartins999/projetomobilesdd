import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDI } from '../../infrastructure/di/DIContext';
import { Inspection } from '../../domain/entities/Inspection';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    good: { bg: '#ECFDF5', text: '#2D6A4F', label: 'Bom' },
    fair: { bg: '#FEFCE8', text: '#D4883A', label: 'Regular' },
    poor: { bg: '#FFF5EB', text: '#FB8500', label: 'Precário' },
    urgent: { bg: '#FDF0F0', text: '#E63946', label: 'Urgente' },
};

export function InspectionHistoryScreen({ route, navigation }: any) {
    const { artworkId } = route.params;
    const { inspectionRepository } = useDI();
    const insets = useSafeAreaInsets();
    const [inspections, setInspections] = useState<Inspection[]>([]);

    useEffect(() => {
        async function load() {
            const data = await inspectionRepository.findByArtworkId(artworkId);
            setInspections(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        }
        load();
    }, [artworkId]);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.headerTitle}>Histórico de Inspeções</Text>
            <FlatList
                data={inspections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
                renderItem={({ item }) => {
                    const st = statusColors[item.technicalForm.statusAtVisit] || statusColors.fair;
                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('InspectionDetail', { inspectionId: item.id })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardLeft}>
                                <Text style={styles.date}>
                                    {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                                    <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                                </View>
                            </View>
                            <View style={styles.urgencyContainer}>
                                <Text style={styles.urgencyLabel}>Urgência</Text>
                                <Text style={styles.urgencyValue}>{item.technicalForm.urgencyLevel}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="assignment" size={44} color="#B0A898" />
                        <Text style={styles.emptyText}>Nenhuma inspeção registrada</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F5F0' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', paddingHorizontal: 20, marginBottom: 16 },
    list: { paddingHorizontal: 20, paddingBottom: 20 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    cardLeft: { flex: 1 },
    date: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 6 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    urgencyContainer: { alignItems: 'center' },
    urgencyLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
    urgencyValue: { fontSize: 22, fontWeight: 'bold', color: '#E63946' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 16, color: '#888', marginTop: 12 },
});
