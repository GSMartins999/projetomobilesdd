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
import { useTranslation } from 'react-i18next';
import { useDI } from '../../infrastructure/di/DIContext';
import { SearchArtworksUseCase } from '../../domain/usecases/SearchArtworksUseCase';
import { Artwork, ArtworkType, ConservationStatus } from '../../domain/entities/Artwork';

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
    }, [selectedType, selectedStatus]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('common.search', 'Buscar obra, artista ou endereço...')}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                />
            </View>

            <View style={styles.filters}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['painting', 'sculpture', 'mural', 'monument'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.pill, selectedType === type && styles.pillActive]}
                            onPress={() => setSelectedType(selectedType === type ? null : type as ArtworkType)}
                        >
                            <Text style={[styles.pillText, selectedType === type && styles.pillTextActive]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.resultItem}
                        onPress={() => navigation.navigate('ArtworkDetail', { id: item.id })}
                    >
                        <Text style={styles.resultTitle}>{item.name}</Text>
                        <Text style={styles.resultSubtitle}>{item.artist || 'Artista desconhecido'}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma obra encontrada</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    searchInput: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8 },
    filters: { paddingVertical: 10, paddingLeft: 15 },
    pill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', marginRight: 10 },
    pillActive: { backgroundColor: '#2A4D69' },
    pillText: { fontSize: 12, color: '#333' },
    pillTextActive: { color: '#fff' },
    resultItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    resultTitle: { fontSize: 16, fontWeight: 'bold' },
    resultSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});
