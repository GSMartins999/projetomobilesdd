import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDI } from '../../infrastructure/di/DIContext';
import { GetDashboardStatsUseCase, DashboardStats } from '../../domain/usecases/GetDashboardStatsUseCase';
import { useSync } from '../../infrastructure/sync/SyncContext';

export function DashboardScreen() {
    const { artworkRepository } = useDI();
    const { isOnline, isSyncing, triggerSync } = useSync();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        async function load() {
            const useCase = new GetDashboardStatsUseCase(artworkRepository);
            const data = await useCase.execute();
            setStats(data);
        }
        load();
    }, [isSyncing]);

    if (!stats) return <View />;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Dashboard Curata</Text>

            <View style={styles.syncCard}>
                <Text style={styles.syncStatus}>
                    Status: {isOnline ? 'Conectado' : 'Offline'}
                </Text>
                {stats.totalUnsynced > 0 && (
                    <TouchableOpacity onPress={triggerSync} disabled={isSyncing}>
                        <Text style={styles.syncAction}>
                            {isSyncing ? 'Sincronizando...' : `Sincronizar ${stats.totalUnsynced} itens`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.statsGrid}>
                <StatCard label="Total" value={stats.totalArtworks} color="#2A4D69" />
                <StatCard label="Urgentes" value={stats.countByStatus.urgent} color="#E63946" />
                <StatCard label="Críticos" value={stats.criticalPendingInspections} color="#FB8500" />
            </View>

            <Text style={styles.subtitle}>Distribuição por Estado</Text>
            <View style={styles.distRow}>
                <DistItem label="Bom" value={stats.countByStatus.good} color="#2D6a4F" />
                <DistItem label="Regular" value={stats.countByStatus.fair} color="#FFB703" />
                <DistItem label="Ruim" value={stats.countByStatus.poor} color="#FB8500" />
            </View>
        </ScrollView>
    );
}

const StatCard = ({ label, value, color }: any) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
    </View>
);

const DistItem = ({ label, value, color }: any) => (
    <View style={styles.distItem}>
        <View style={[styles.bullet, { backgroundColor: color }]} />
        <Text>{label}: {value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2A4D69', marginBottom: 20 },
    syncCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' },
    syncStatus: { fontWeight: 'bold' },
    syncAction: { color: '#2A4D69', textDecorationLine: 'underline' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, flex: 1, marginHorizontal: 5, borderLeftWidth: 4, elevation: 2 },
    cardValue: { fontSize: 20, fontWeight: 'bold' },
    cardLabel: { fontSize: 12, color: '#666' },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    distRow: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
    distItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    bullet: { width: 12, height: 12, borderRadius: 6, marginRight: 10 }
});
