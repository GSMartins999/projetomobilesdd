import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDI } from '../../infrastructure/di/DIContext';
import { Artwork } from '../../domain/entities/Artwork';
import * as Location from 'expo-location';

const statusColors: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    good: { bg: '#ECFDF5', text: '#2D6A4F', dot: '#2D6A4F', label: 'Bom' },
    fair: { bg: '#FEFCE8', text: '#D4883A', dot: '#FFB703', label: 'Regular' },
    poor: { bg: '#FFF5EB', text: '#FB8500', dot: '#FB8500', label: 'Precário' },
    urgent: { bg: '#FDF0F0', text: '#E63946', dot: '#E63946', label: 'Urgente' },
};

export function MapScreen({ navigation }: any) {
    const { artworkRepository } = useDI();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        async function init() {
            const data = await artworkRepository.findAll();
            setArtworks(data);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            }
        }
        init();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mapa de Obras</Text>
                {userLocation && (
                    <View style={styles.locationRow}>
                        <MaterialIcons name="location-on" size={14} color="#B0A898" />
                        <Text style={styles.locationText}>
                            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Info banner */}
            <View style={styles.infoBanner}>
                <MaterialIcons name="info" size={18} color="#D4883A" />
                <Text style={styles.infoText}>
                    Mapa nativo requer build de desenvolvimento. Exibindo lista de obras.
                </Text>
            </View>

            {/* Artworks list */}
            <FlatList
                data={artworks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="palette" size={48} color="#D4883A" />
                        <Text style={styles.emptyText}>Nenhuma obra registrada</Text>
                        <Text style={styles.emptySubtext}>Toque + para cadastrar a primeira obra</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const status = statusColors[item.conservationStatus] || statusColors.fair;
                    return (
                        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                            <View style={[styles.statusIndicator, { backgroundColor: status.dot }]} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardSubtitle}>
                                    {item.artist || 'Artista desconhecido'} · {item.type}
                                </Text>
                                {item.latitude && item.longitude && (
                                    <View style={styles.cardLocationRow}>
                                        <MaterialIcons name="location-on" size={12} color="#B0A898" />
                                        <Text style={styles.cardCoords}>
                                            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                        </Text>
                                    </View>
                                )}
                                {item.address && (
                                    <Text style={styles.cardAddress}>{item.address}</Text>
                                )}
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                <Text style={[styles.statusText, { color: status.text }]}>
                                    {status.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ArtworkForm')}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F5F0' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 14,
        backgroundColor: '#F8F5F0',
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    locationText: { color: '#B0A898', fontSize: 12 },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDF0E6',
        marginHorizontal: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0E0CC',
        marginBottom: 10,
        gap: 8,
    },
    infoText: { color: '#D4883A', fontSize: 12, flex: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 14,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E' },
    cardSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
    cardLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 },
    cardCoords: { fontSize: 11, color: '#B0A898' },
    cardAddress: { fontSize: 11, color: '#B0A898', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginTop: 15 },
    emptySubtext: { fontSize: 14, color: '#888', marginTop: 5 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#E8752A',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#E8752A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
});
