import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useDI } from '../../infrastructure/di/DIContext';
import { Artwork } from '../../domain/entities/Artwork';
import * as Location from 'expo-location';

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

    function getStatusColor(status: string) {
        switch (status) {
            case 'good': return '#2D6a4F';
            case 'fair': return '#FFB703';
            case 'poor': return '#FB8500';
            case 'urgent': return '#E63946';
            default: return '#666';
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🗺️ Mapa de Obras</Text>
                {userLocation && (
                    <Text style={styles.locationText}>
                        📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </Text>
                )}
            </View>

            {/* Info banner */}
            <View style={styles.infoBanner}>
                <Text style={styles.infoText}>
                    ℹ️ Mapa nativo requer build de desenvolvimento. Exibindo lista de obras.
                </Text>
            </View>

            {/* Artworks list */}
            <FlatList
                data={artworks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🎨</Text>
                        <Text style={styles.emptyText}>Nenhuma obra registrada</Text>
                        <Text style={styles.emptySubtext}>Toque + para cadastrar a primeira obra</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.conservationStatus) }]} />
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardSubtitle}>
                                {item.artist || 'Artista desconhecido'} · {item.type}
                            </Text>
                            {item.latitude && item.longitude && (
                                <Text style={styles.cardCoords}>
                                    📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                </Text>
                            )}
                            {item.address && (
                                <Text style={styles.cardAddress}>{item.address}</Text>
                            )}
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.conservationStatus) }]}>
                                {item.conservationStatus}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ArtworkForm')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: '#2A4D69',
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    locationText: { color: '#B8D4E3', fontSize: 12, marginTop: 4 },
    infoBanner: {
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#B8D4E3',
    },
    infoText: { color: '#2A4D69', fontSize: 12 },
    listContent: { padding: 15, paddingBottom: 100 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
    cardCoords: { fontSize: 11, color: '#999', marginTop: 4 },
    cardAddress: { fontSize: 11, color: '#999', marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f0f0f0' },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 15 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#666' },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 5 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#2A4D69',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
});
