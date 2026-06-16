import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import MapView, { Marker } from 'react-native-maps';
import { useDI } from '../../infrastructure/di/DIContext';
import { ImageUtils } from '../../infrastructure/utils/ImageUtils';
import { Artwork } from '../../domain/entities/Artwork';
import { Photo } from '../../domain/entities/Inspection';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const statusColors: Record<string, { bg: string; text: string; dot: string; label: string; border: string }> = {
    good:   { bg: '#ECFDF5', text: '#2D6A4F', dot: '#2D6A4F', label: 'Bom Estado',  border: '#A7F3D0' },
    fair:   { bg: '#FEFCE8', text: '#D4883A', dot: '#FFB703', label: 'Regular',      border: '#FDE68A' },
    poor:   { bg: '#FFF5EB', text: '#FB8500', dot: '#FB8500', label: 'Precário',     border: '#FED7AA' },
    urgent: { bg: '#FDF0F0', text: '#E63946', dot: '#E63946', label: 'Urgente',      border: '#FECACA' },
    unknown:{ bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: 'Desconhecido', border: '#E5E7EB' },
};

// Paleta de 10 cores vibrantes e distintas para diferenciar marcadores próximos
const MARKER_PALETTE = [
    '#E8752A', // laranja
    '#6C63FF', // violeta
    '#0EA5E9', // azul céu
    '#10B981', // esmeralda
    '#F43F5E', // rosa-vivo
    '#F59E0B', // âmbar
    '#8B5CF6', // roxo
    '#06B6D4', // ciano
    '#84CC16', // verde-lima
    '#EC4899', // pink
];

// Hash determinístico do ID da obra para escolher sempre a mesma cor
function getMarkerColor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return MARKER_PALETTE[hash % MARKER_PALETTE.length];
}

// Ícone varia por tipo de obra
const artworkTypeIcon: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    painting:  'palette',
    sculpture: 'category',
    mural:     'brush',
    tile:      'grid-on',
    relief:    'texture',
    monument:  'account-balance',
    other:     'star',
};

export function MapScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { artworkRepository, photoRepository } = useDI();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [coverPhotos, setCoverPhotos] = useState<Record<string, string>>({});
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selected, setSelected] = useState<Artwork | null>(null);

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef<MapView>(null);

    const loadArtworks = useCallback(async () => {
        const data = await artworkRepository.findAll();
        setArtworks(data);

        const photosMap: Record<string, string> = {};
        for (const art of data) {
            const photos: Photo[] = await photoRepository.findByArtworkId(art.id);
            if (photos.length > 0) {
                const p = photos[0];
                const uri = p.localPath || p.remoteUrl || '';
                if (uri) photosMap[art.id] = uri;
            }
        }
        setCoverPhotos(photosMap);
    }, [artworkRepository, photoRepository]);

    useFocusEffect(
        useCallback(() => {
            loadArtworks();
        }, [loadArtworks])
    );

    useEffect(() => {
        async function initGps() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    const lat = loc.coords.latitude;
                    const lng = loc.coords.longitude;
                    setUserLocation({ lat, lng });
                    
                    mapRef.current?.animateToRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000);
                }
            } catch (err) {
                console.error("Erro ao obter GPS no MapScreen:", err);
            }
        }
        initGps();
    }, []);

    const openCard = (artwork: Artwork) => {
        setSelected(artwork);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
    };

    const closeCard = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 220,
            useNativeDriver: true,
        }).start(() => setSelected(null));
    };

    const status = selected ? (statusColors[selected.conservationStatus] || statusColors.unknown) : null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t('map.title')}</Text>
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
                ref={mapRef}
                style={styles.map}
                onPress={closeCard}
                showsUserLocation={true}
                showsMyLocationButton={false}
                toolbarEnabled={false}
                initialRegion={{
                    latitude: userLocation?.lat || -23.5505,
                    longitude: userLocation?.lng || -46.6333,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {artworks.map((artwork, index) => {
                    if (!artwork.latitude || !artwork.longitude) return null;
                    const st = statusColors[artwork.conservationStatus] || statusColors.unknown;
                    const isSelected = selected?.id === artwork.id;
                    const markerColor = getMarkerColor(artwork.id);
                    const iconName = artworkTypeIcon[artwork.type] || 'star';
                    return (
                        <Marker
                            key={artwork.id}
                            identifier={artwork.id}
                            testID={`annotation-${artwork.id}`}
                            coordinate={{ latitude: artwork.latitude, longitude: artwork.longitude }}
                            onPress={() => openCard(artwork)}
                        >
                            {/* Custom marker pin: bubble com cor única, seta com cor do status */}
                            <View style={[
                                styles.markerWrap,
                                isSelected && styles.markerWrapSelected,
                            ]}>
                                <View style={[
                                    styles.markerBubble,
                                    {
                                        backgroundColor: markerColor,
                                        borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                                        borderWidth: isSelected ? 3 : 2.5,
                                    }
                                ]}>
                                    <MaterialIcons name={iconName} size={14} color="#fff" />
                                </View>
                                {/* Cauda/seta usa a cor do status para informar conservação */}
                                <View style={[styles.markerTail, { borderTopColor: st.dot }]} />
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Bottom card popup */}
            {selected && status && (
                <Animated.View
                    style={[styles.bottomCard, { transform: [{ translateY: slideAnim }] }]}
                >
                    {/* Drag handle */}
                    <View style={styles.dragHandle} />

                    <View style={styles.cardContent}>
                        {/* Foto */}
                        <View style={styles.cardImageContainer}>
                            {coverPhotos[selected.id] ? (
                                <Image
                                    source={{ uri: ImageUtils.getImageUri(coverPhotos[selected.id]) || '' }}
                                    style={styles.cardImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                                    <MaterialIcons name="image" size={32} color="#B0A898" />
                                </View>
                            )}
                        </View>

                        {/* Info */}
                        <View style={styles.cardInfo}>
                            <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
                                <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
                                <Text style={[styles.statusText, { color: status.text }]}>
                                    {t(`status.${selected.conservationStatus}`, { defaultValue: status.label })}
                                </Text>
                            </View>
                            <Text style={styles.cardTitle} numberOfLines={2}>{selected.name}</Text>
                            <Text style={styles.cardArtist} numberOfLines={1}>
                                {selected.artist || t('map.unknown_artist')}
                            </Text>
                            {selected.address && (
                                <View style={styles.cardAddress}>
                                    <MaterialIcons name="location-on" size={12} color="#B0A898" />
                                    <Text style={styles.cardAddressText} numberOfLines={1}>{selected.address}</Text>
                                </View>
                            )}
                        </View>

                        {/* Close button */}
                        <TouchableOpacity style={styles.closeBtn} onPress={closeCard}>
                            <MaterialIcons name="close" size={18} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.85}
                        onPress={() => {
                            closeCard();
                            navigation.navigate('ArtworkDetail', { id: selected.id });
                        }}
                    >
                        <Text style={styles.ctaText}>{t('map.view_details')}</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* FAB */}
            {!selected && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('ArtworkForm')}
                    activeOpacity={0.8}
                    testID="map-fab"
                >
                    <MaterialIcons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            )}
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
    map: { flex: 1, width: '100%' },

    // Custom marker
    markerWrap: { alignItems: 'center' },
    markerWrapSelected: { transform: [{ scale: 1.2 }] },
    markerBubble: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    markerTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },

    // Bottom card
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        paddingBottom: 32,
        paddingHorizontal: 16,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    dragHandle: {
        width: 36,
        height: 4,
        backgroundColor: '#E0D8D0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    cardImageContainer: {
        marginRight: 14,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 14,
    },
    cardImagePlaceholder: {
        backgroundColor: '#F5EDE3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: { flex: 1 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        marginBottom: 6,
        gap: 5,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
        lineHeight: 20,
        marginBottom: 3,
    },
    cardArtist: { fontSize: 13, color: '#888', marginBottom: 5 },
    cardAddress: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    cardAddressText: { fontSize: 12, color: '#B0A898', flex: 1 },
    closeBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8752A',
        borderRadius: 14,
        paddingVertical: 14,
        gap: 8,
        shadowColor: '#E8752A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
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
    fabHidden: { opacity: 0 },
});
