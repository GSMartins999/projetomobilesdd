import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
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

            {/* Map */}
            <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                showsUserLocation={true}
                showsMyLocationButton={true}
                initialRegion={{
                    latitude: userLocation?.lat || -23.5505,
                    longitude: userLocation?.lng || -46.6333,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {artworks.map((artwork) => {
                    if (!artwork.latitude || !artwork.longitude) return null;
                    const status = statusColors[artwork.conservationStatus] || statusColors.fair;
                    return (
                        <Marker
                            key={artwork.id}
                            coordinate={{ latitude: artwork.latitude, longitude: artwork.longitude }}
                            pinColor={status.dot}
                        >
                            <Callout onPress={() => navigation.navigate('ArtworkDetail', { artworkId: artwork.id })}>
                                <View style={styles.calloutContainer}>
                                    <Text style={styles.calloutTitle}>{artwork.name}</Text>
                                    <Text style={styles.calloutSubtitle}>{artwork.artist || 'Artista desconhecido'}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: status.bg, marginTop: 4 }]}>
                                        <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ArtworkForm')}
                activeOpacity={0.8}
                testID="map-fab"
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
    map: {
        flex: 1,
        width: '100%',
    },
    calloutContainer: {
        padding: 8,
        minWidth: 150,
        alignItems: 'center',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#1A1A2E',
        marginBottom: 2,
    },
    calloutSubtitle: {
        fontSize: 12,
        color: '#888',
    },
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
