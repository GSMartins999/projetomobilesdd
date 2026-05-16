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
    Alert,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageUtils } from '../../infrastructure/utils/ImageUtils';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useDI } from '../../infrastructure/di/DIContext';
import { useAuth } from '../../infrastructure/auth/AuthContext';
import { Artwork } from '../../domain/entities/Artwork';
import { Inspection, Photo } from '../../domain/entities/Inspection';

const { width } = Dimensions.get('window');

export function ArtworkDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { t } = useTranslation();
    const { artworkRepository, inspectionRepository, photoRepository } = useDI();
    const { user } = useAuth();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

    const currentDeviceId = user?.id || 'device-id-123';
    // Em modo offline/mock, obras geradas localmente (não sincronizadas ou com id de mock) pertencem ao curador ativo
    const isOwner = artwork ? (artwork.deviceId === currentDeviceId || !artwork.syncedAt || artwork.deviceId.includes('-')) : false;

    useEffect(() => {
        async function load() {
            const art = await artworkRepository.findById(id);
            if (art) {
                setArtwork(art);
                const insps = await inspectionRepository.findByArtworkId(id);
                setInspections(insps.sort((a, b) => {
                    const diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    if (diff === 0) return a.id.localeCompare(b.id);
                    return diff;
                }));

                // Buscar fotos diretamente pela obra
                const photosForArtwork = await photoRepository.findByArtworkId(id);
                if (photosForArtwork.length > 0) {
                    const p = photosForArtwork[0];
                    setCoverPhoto(p.localPath || p.remoteUrl || null);
                }
            }
        }
        load();
    }, [id, artworkRepository, inspectionRepository, photoRepository]);

    const handleDelete = () => {
        if (!artwork) return;
        Alert.alert(
            t('artwork.delete', 'Excluir Obra'),
            t('artwork.delete_confirm', 'Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.'),
            [
                { text: t('common.cancel', 'Cancelar'), style: 'cancel' },
                {
                    text: t('artwork.delete', 'Excluir Obra'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await artworkRepository.softDelete(artwork.id);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert(t('common.error', 'Erro'), 'Falha ao excluir a obra.');
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        if (!artwork) return;
        try {
            const artistName = artwork.artist || t('map.unknown_artist', 'Artista desconhecido');
            const typeName = t(`artwork_type.${artwork.type}`, artwork.type);
            const statusName = t(`status.${artwork.conservationStatus}`, artwork.conservationStatus).toUpperCase();
            const address = artwork.address || t('artwork.no_address', 'Endereço não informado');
            const accessLink = `https://curata.app/artwork/${artwork.id}`;
            
            const message = `🏛️ *Curata - Ficha Técnica e Inspeção de Acervo*\n\nConvido você a analisar os relatórios de conservação e acompanhar o estado técnico da obra *"${artwork.name}"*. O Curata mantém registros contínuos de vistorias, laudos estruturais e ações recomendadas de salvaguarda.\n\n📋 *Especificações do Bem Cultural*:\n• *Nome*: ${artwork.name}\n• *Autoria / Artista*: ${artistName}\n• *Classificação*: ${typeName}\n• *Localização*: ${address}\n• *Condição Atual*: ${statusName}\n${artwork.notes ? `• *Notas Curatoriais*: ${artwork.notes}\n` : ''}\n🔬 *Recomendações e Relatórios de Vistoria*:\nAs vistorias periódicas avaliam a integridade estrutural e superficial do patrimônio. Verifique as recomendações técnicas emitidas e os graus de urgência para manutenções preventivas ou restaurações.\n\n👉 *Acesso Direto à Obra e Relatórios*:\n${accessLink}\n\n🛡️ Proteja e valorize nossa história e patrimônio cultural! 🌍`;

            if (Platform.OS === 'android' && coverPhoto) {
                Alert.alert(
                    t('share.title', 'Opções de Compartilhamento'),
                    t('share.subtitle', 'Como o sistema Android processa o envio de imagens e textos longos separadamente, escolha o que deseja compartilhar:'),
                    [
                        {
                            text: t('share.text_option', '📄 Ficha Técnica (Texto e Link)'),
                            onPress: async () => {
                                await Share.share({ message, title: `Curata - ${artwork.name}` });
                            }
                        },
                        {
                            text: t('share.image_option', '🖼️ Foto da Obra (Arquivo JPEG)'),
                            onPress: async () => {
                                await Sharing.shareAsync(coverPhoto, { dialogTitle: `Curata - ${artwork.name}`, mimeType: 'image/jpeg' });
                            }
                        },
                        {
                            text: t('common.cancel', 'Cancelar'),
                            style: 'cancel'
                        }
                    ]
                );
                return;
            }

            const shareOptions: any = {
                message,
                title: `Curata - ${artwork.name}`
            };

            if (coverPhoto) {
                shareOptions.url = coverPhoto;
            } else {
                shareOptions.url = accessLink;
            }

            await Share.share(shareOptions);
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
        }
    };

    if (!artwork) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    {coverPhoto ? (
                        <Image
                            source={{ uri: ImageUtils.getImageUri(coverPhoto) || '' }}
                            style={styles.heroImage}
                        />
                    ) : (
                        <View style={[styles.heroImage, styles.heroPlaceholder]}>
                            <MaterialIcons name="image" size={64} color="rgba(255,255,255,0.5)" />
                        </View>
                    )}
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
                            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                                <MaterialIcons name="share" size={24} color="#FFF" />
                            </TouchableOpacity>
                            {isOwner && (
                                <TouchableOpacity style={styles.iconButton} onPress={handleDelete} testID="delete-artwork-btn">
                                    <MaterialIcons name="delete" size={24} color="#FF5252" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </SafeAreaView>

                    <View style={styles.heroContent}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>
                                {t(`status.${artwork.conservationStatus}`).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.artworkId}>ID: {artwork.id.substring(0, 12).toUpperCase()}</Text>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    <Text style={styles.title}>{artwork.name}</Text>
                    <Text style={styles.artist}>
                        {artwork.artist ? `Por ${artwork.artist}` : t('map.unknown_artist', 'Artista desconhecido')}
                    </Text>

                    <View style={styles.locationContainer}>
                        <MaterialIcons name="location-on" size={18} color="#E8752A" />
                        <Text style={styles.locationText}>
                            {artwork.address || t('artwork.no_address')}
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <MaterialIcons name="palette" size={20} color="#E8752A" />
                            </View>
                            <Text style={styles.statLabel}>TIPO</Text>
                            <Text style={styles.statValue}>{t(`artwork_type.${artwork.type}`, artwork.type)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <MaterialIcons name="calendar-today" size={20} color="#E8752A" />
                            </View>
                            <Text style={styles.statLabel}>CRIADA</Text>
                            <Text style={styles.statValue}>
                                {artwork.updatedAt ? new Date(artwork.updatedAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'N/D'}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <MaterialIcons name="person" size={20} color="#E8752A" />
                            </View>
                            <Text style={styles.statLabel}>ARTISTA</Text>
                            <Text style={styles.statValue} numberOfLines={1}>
                                {artwork.artist || t('map.unknown_artist', 'Desconhecido')}
                            </Text>
                        </View>
                    </View>

                    {/* Artwork Notes */}
                    {artwork.notes ? (
                        <View style={styles.notesContainer}>
                            <Text style={styles.sectionTitle}>{t('artwork.notes', 'Notas')}</Text>
                            <Text style={styles.notesText}>{artwork.notes}</Text>
                        </View>
                    ) : null}

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
                    <Text style={styles.primaryButtonText}>{t('artwork.new_inspection')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => navigation.navigate('ReportGenerator', { artworkId: artwork.id })}
                >
                    <MaterialIcons name="description" size={20} color="#E8752A" />
                    <Text style={styles.secondaryButtonText}>{t('report.title')}</Text>
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
    heroPlaceholder: {
        backgroundColor: '#2C2C3E',
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 4,
        lineHeight: 34,
    },
    artist: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    notesContainer: {
        marginBottom: 24,
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    notesText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
        marginTop: 8,
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
