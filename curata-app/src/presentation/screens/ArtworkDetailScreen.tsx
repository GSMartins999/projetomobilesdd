import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDI } from '../../infrastructure/di/DIContext';
import { Artwork } from '../../domain/entities/Artwork';
import { Inspection } from '../../domain/entities/Inspection';

const { width } = Dimensions.get('window');

export function ArtworkDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { artworkRepository, inspectionRepository } = useDI();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [inspections, setInspections] = useState<Inspection[]>([]);

    useEffect(() => {
        async function load() {
            const art = await artworkRepository.findById(id);
            if (art) {
                setArtwork(art);
                const insps = await inspectionRepository.findByArtworkId(id);
                setInspections(insps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            }
        }
        load();
    }, [id]);

    if (!artwork) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHq-3WZc_qyUNC0WtGwRavLQftZFFOi_HBDCMDrW65vFUKsgRt5CRoNwGT1YA3KsaWYmnF5uh4eWt1uze-NY0N8aDKsx77E1g7qT7TjiAEm3ZjDVF8HlJgJIqal4RdkQgbqV5D3qwUvvtlbK5khReJXBtScwyx_L15ggSHso4ZTVeED97OKiOTNujutB6OdBKXvejzJz6xVwzok59nA4aixkEWtsvw4iqs33JgysLEzEFsbI87Y-60V6DeJiHtmAViuZgdKEyHoV9P' }}
                        style={styles.heroImage}
                    />
                    <View style={styles.overlay} />

                    {/* Header Overlay */}
                    <SafeAreaView style={styles.headerOverlay}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.iconButton}>
                                <MaterialIcons name="share" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <MaterialIcons name="more-vert" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <View style={styles.heroContent}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>
                                {artwork.conservationStatus.toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.artworkId}>ID: {artwork.id.substring(0, 12).toUpperCase()}</Text>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    <Text style={styles.title}>{artwork.name}</Text>

                    <View style={styles.locationContainer}>
                        <MaterialIcons name="location-on" size={18} color="#E8752A" />
                        <Text style={styles.locationText}>
                            {artwork.address || 'Endereço não informado'}
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <MaterialIcons name="palette" size={20} color="#E8752A" />
                            </View>
                            <Text style={styles.statLabel}>TIPO</Text>
                            <Text style={styles.statValue}>{artwork.type}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <MaterialIcons name="calendar-today" size={20} color="#E8752A" />
                            </View>
                            <Text style={styles.statLabel}>CRIADA</Text>
                            <Text style={styles.statValue}>Jan 2024</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <MaterialIcons name="person-search" size={20} color="#E8752A" />
                            </View>
                            <Text style={styles.statLabel}>INSPETOR</Text>
                            <Text style={styles.statValue}>Dr. Arantes</Text>
                        </View>
                    </View>

                    {/* Inspections Section */}
                    <View style={styles.inspectionsHeader}>
                        <Text style={styles.sectionTitle}>Inspeções Recentes</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('InspectionHistory', { artworkId: artwork.id })}>
                            <Text style={styles.viewAllText}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {inspections.length > 0 ? (
                        <View style={styles.timeline}>
                            {inspections.slice(0, 3).map((item, index) => (
                                <View key={item.id} style={styles.timelineItem}>
                                    <View style={[
                                        styles.timelineLine,
                                        index === inspections.slice(0, 3).length - 1 && styles.lastTimelineLine
                                    ]} />
                                    <View style={styles.timelineDot}>
                                        <MaterialIcons
                                            name={index === 0 ? "check" : "history"}
                                            size={12}
                                            color="#FFF"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.inspectionCard}
                                        onPress={() => navigation.navigate('InspectionDetail', { inspectionId: item.id })}
                                    >
                                        <View style={styles.inspectionCardHeader}>
                                            <Text style={styles.inspectionType}>Inspeção Periódica</Text>
                                            <Text style={styles.inspectionDate}>
                                                {new Date(item.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={styles.inspectionNotes} numberOfLines={2}>
                                            {item.technicalForm.structuralCondition}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyInspections}>
                            <Text style={styles.emptyText}>Nenhuma inspeção registrada</Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View style={styles.footerActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => navigation.navigate('InspectionForm', { artworkId: artwork.id })}
                >
                    <MaterialIcons name="add-circle" size={20} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Nova Inspeção</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => navigation.navigate('ReportGenerator')}
                >
                    <MaterialIcons name="description" size={20} color="#E8752A" />
                    <Text style={styles.secondaryButtonText}>Gerar Relatório</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
    },
    heroSection: {
        height: 350,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 0 : 40,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContent: {
        position: 'absolute',
        bottom: 24,
        left: 16,
    },
    statusBadge: {
        backgroundColor: '#E8752A',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    statusBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    artworkId: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 1,
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#F8F5F0',
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 12,
        lineHeight: 34,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 24,
    },
    locationText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(232, 117, 42, 0.05)',
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(232, 117, 42, 0.1)',
        marginHorizontal: 4,
    },
    statIconContainer: {
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    inspectionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E8752A',
    },
    timeline: {
        paddingLeft: 4,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineLine: {
        position: 'absolute',
        left: 11,
        top: 24,
        bottom: -16,
        width: 2,
        backgroundColor: '#E8E0D8',
    },
    lastTimelineLine: {
        bottom: 0,
        height: 0,
    },
    timelineDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E8752A',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        borderWidth: 4,
        borderColor: '#F8F5F0',
    },
    inspectionCard: {
        flex: 1,
        backgroundColor: '#FFF',
        marginLeft: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    inspectionCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    inspectionType: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    inspectionDate: {
        fontSize: 10,
        fontWeight: '600',
        color: '#888',
    },
    inspectionNotes: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    emptyInspections: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 14,
    },
    footerActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(248, 245, 240, 0.8)',
        padding: 16,
        paddingBottom: 32,
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0E8E0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#E8752A',
        shadowColor: '#E8752A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        borderWidth: 2,
        borderColor: 'rgba(232, 117, 42, 0.4)',
        backgroundColor: 'rgba(232, 117, 42, 0.05)',
    },
    secondaryButtonText: {
        color: '#E8752A',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
