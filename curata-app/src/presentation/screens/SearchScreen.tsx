import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDI } from '../../infrastructure/di/DIContext';
import { SearchArtworksUseCase } from '../../domain/usecases/SearchArtworksUseCase';
import { Artwork, ArtworkType, ConservationStatus } from '../../domain/entities/Artwork';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    good: { bg: '#ECFDF5', text: '#2D6A4F', dot: '#2D6A4F' },
    fair: { bg: '#FEFCE8', text: '#D4883A', dot: '#FFB703' },
    poor: { bg: '#FFF5EB', text: '#FB8500', dot: '#FB8500' },
    urgent: { bg: '#FDF0F0', text: '#E63946', dot: '#E63946' },
};

const statusLabels: Record<string, string> = {
    good: 'BOM ESTADO',
    fair: 'REGULAR',
    poor: 'PRECÁRIO',
    urgent: 'URGENTE',
};

export function SearchScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { artworkRepository } = useDI();
    const searchUseCase = new SearchArtworksUseCase(artworkRepository);

    const [query, setQuery] = useState('');
    const [selectedType, setSelectedType] = useState<ArtworkType | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<ConservationStatus | null>(null);
    const [results, setResults] = useState<Artwork[]>([]);

    const handleSearch = async () => {
        const data = await searchUseCase.execute({
            query,
            type: selectedType || undefined,
            conservationStatus: selectedStatus || undefined,
        });
        setResults(data);
    };

    useEffect(() => {
        handleSearch();
    }, [query, selectedType, selectedStatus]);

    const statusFilters: { key: ConservationStatus; label: string }[] = [
        { key: 'urgent', label: 'Urgente' },
        { key: 'good', label: 'Bom' },
        { key: 'fair', label: 'Regular' },
        { key: 'poor', label: 'Precário' },
    ];

    const typeFilters: { key: ArtworkType; label: string }[] = [
        { key: 'sculpture', label: 'Escultura' },
        { key: 'mural', label: 'Mural' },
        { key: 'painting', label: 'Pintura' },
        { key: 'monument', label: 'Monumento' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explorar Acervo</Text>
            </View>

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={22} color="#B0A898" style={{ marginRight: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('common.search', 'Pesquisar obras...')}
                    placeholderTextColor="#B0A898"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialIcons name="tune" size={22} color="#888" />
                </TouchableOpacity>
            </View>

            {/* Status filters */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status de Conservação</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                    {statusFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.pill,
                                selectedStatus === filter.key && styles.pillActive,
                            ]}
                            onPress={() => setSelectedStatus(selectedStatus === filter.key ? null : filter.key)}
                        >
                            <Text style={[
                                styles.pillText,
                                selectedStatus === filter.key && styles.pillTextActive,
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Type filters */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Tipo de Obra</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                    {typeFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.pill,
                                selectedType === filter.key && styles.pillActive,
                            ]}
                            onPress={() => setSelectedType(selectedType === filter.key ? null : filter.key)}
                        >
                            <Text style={[
                                styles.pillText,
                                selectedType === filter.key && styles.pillTextActive,
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results */}
            <Text style={styles.resultsCount}>Resultados ({results.length})</Text>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.resultsList}
                renderItem={({ item }) => {
                    const status = statusColors[item.conservationStatus] || statusColors.fair;
                    const label = statusLabels[item.conservationStatus] || 'REGULAR';
                    return (
                        <TouchableOpacity
                            style={styles.resultCard}
                            onPress={() => navigation.navigate('ArtworkDetail', { id: item.id })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.resultImagePlaceholder}>
                                <MaterialIcons name="image" size={28} color="#D4883A" />
                            </View>
                            <View style={styles.resultInfo}>
                                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                    <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
                                    <Text style={[styles.statusText, { color: status.text }]}>{label}</Text>
                                </View>
                                <Text style={styles.resultTitle}>{item.name}</Text>
                                <Text style={styles.resultArtist}>{item.artist || 'Artista desconhecido'}</Text>
                                <View style={styles.locationRow}>
                                    <MaterialIcons name="location-on" size={14} color="#B0A898" />
                                    <Text style={styles.locationText}>{item.address || 'Endereço não informado'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search" size={44} color="#B0A898" />
                        <Text style={styles.emptyText}>Nenhuma obra encontrada</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
    },
    header: {
        paddingTop: 55,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#E8E0D8',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1A1A2E',
    },
    filterButton: {
        padding: 8,
    },
    filterSection: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    pillRow: {
        flexDirection: 'row',
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E0D8',
        backgroundColor: '#FFFFFF',
        marginRight: 8,
    },
    pillActive: {
        backgroundColor: '#E8752A',
        borderColor: '#E8752A',
    },
    pillText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    pillTextActive: {
        color: '#FFFFFF',
    },
    resultsCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 12,
    },
    resultsList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    resultCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    resultImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F5EDE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    resultInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginBottom: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 2,
    },
    resultArtist: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: '#B0A898',
        marginLeft: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        marginTop: 12,
    },
});
