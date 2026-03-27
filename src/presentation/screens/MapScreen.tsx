import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useDI } from '../../infrastructure/di/DIContext';
import { Artwork } from '../../domain/entities/Artwork';
import * as Location from 'expo-location';

// Configuração básica do MapLibre (Estilo claro padrão)
MapLibreGL.setAccessToken(null); // MapLibre não exige token para tiles próprios

export function MapScreen({ navigation }: any) {
    const { artworkRepository } = useDI();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        async function init() {
            // 1. Carregar obras locais
            const data = await artworkRepository.findAll();
            setArtworks(data);

            // 2. Localização do usuário
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setUserLocation([loc.coords.longitude, loc.coords.latitude]);
            }
        }
        init();
    }, []);

    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                style={styles.map}
                styleURL="https://demotiles.maplibre.org/style.json" // Substituir por fonte oficial no prod
                logoEnabled={false}
            >
                <MapLibreGL.Camera
                    zoomLevel={12}
                    centerCoordinate={userLocation || [-46.6333, -23.5505]} // SP Default
                    followUserLocation={true}
                />

                {/* User Location Mark */}
                <MapLibreGL.UserLocation animated />

                {/* Artworks Pins (v1: Marcadores simples, v2: Clusters) */}
                {artworks.map((art) => (
                    art.latitude && art.longitude && (
                        <MapLibreGL.PointAnnotation
                            key={art.id}
                            id={art.id}
                            coordinate={[art.longitude, art.latitude]}
                            onSelected={() => navigation.navigate('ArtworkDetail', { id: art.id })}
                        >
                            <View style={[styles.marker, { backgroundColor: getStatusColor(art.conservationStatus) }]} />
                        </MapLibreGL.PointAnnotation>
                    )
                ))}
            </MapLibreGL.MapView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ArtworkForm')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'good': return '#2D6a4F';
        case 'fair': return '#FFB703';
        case 'poor': return '#FB8500';
        case 'urgent': return '#E63946';
        default: return '#666';
    }
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    marker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
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
    },
    fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' }
});
