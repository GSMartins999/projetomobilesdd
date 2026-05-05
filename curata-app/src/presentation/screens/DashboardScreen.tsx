import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDI } from '../../infrastructure/di/DIContext';
import { GetDashboardStatsUseCase, DashboardStats } from '../../domain/usecases/GetDashboardStatsUseCase';
import { useSync } from '../../infrastructure/sync/SyncContext';
import { useNavigation } from '@react-navigation/native';

export function DashboardScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
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

    if (!stats) return <View style={styles.container} />;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 100) }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.headerTitle}>Meu Mapa de Obras</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        testID="notification-button"
                        style={styles.notificationBadge}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <MaterialIcons name="notifications" size={22} color="#E8752A" />
                    </TouchableOpacity>
                    <View style={styles.avatarCircle}>
                        <MaterialIcons name="person" size={22} color="#FFFFFF" />
                    </View>
                </View>
            </View>

            {/* Sync status */}
            <View style={styles.syncBar}>
                <View style={[styles.syncDot, { backgroundColor: isOnline ? '#2D6A4F' : '#E63946' }]} />
                <Text style={styles.syncText}>
                    {isOnline ? 'Conectado' : 'Offline'}
                </Text>
                {stats.totalUnsynced > 0 && (
                    <TouchableOpacity testID="sync-button" onPress={triggerSync} disabled={isSyncing}>
                        <Text style={styles.syncAction}>
                            {isSyncing ? 'Sincronizando...' : `Sincronizar ${stats.totalUnsynced}`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Section title */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Resumo do Portfólio</Text>
                <Text style={styles.sectionDate}>
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    icon="corporate-fare"
                    label="TOTAL DE OBRAS"
                    value={stats.totalArtworks}
                    bgColor="#F8F5F0"
                    iconBg="#F5EDE3"
                    iconColor="#1A1A2E"
                    valueColor="#1A1A2E"
                />
                <StatCard
                    icon="priority-high"
                    label="URGENTE"
                    value={stats.countByStatus.urgent}
                    bgColor="#FDF0F0"
                    iconBg="#FCE4E4"
                    iconColor="#E63946"
                    valueColor="#E63946"
                />
            </View>
            <View style={styles.statsGrid}>
                <StatCard
                    icon="warning"
                    label="PRECÁRIO"
                    value={stats.countByStatus.poor}
                    bgColor="#FFF5EB"
                    iconBg="#FFE8D4"
                    iconColor="#FB8500"
                    valueColor="#FB8500"
                />
                <StatCard
                    icon="info"
                    label="REGULAR"
                    value={stats.countByStatus.fair}
                    bgColor="#FEFCE8"
                    iconBg="#FEF3C7"
                    iconColor="#D4883A"
                    valueColor="#D4883A"
                />
            </View>
            <View style={styles.statsGrid}>
                <StatCard
                    icon="check-circle"
                    label="BOM"
                    value={stats.countByStatus.good}
                    bgColor="#ECFDF5"
                    iconBg="#D1FAE5"
                    iconColor="#2D6A4F"
                    valueColor="#2D6A4F"
                />
                <StatCard
                    icon="history"
                    label="+90 DIAS"
                    value={stats.criticalPendingInspections}
                    bgColor="#F3F4F6"
                    iconBg="#E5E7EB"
                    iconColor="#1A1A2E"
                    valueColor="#1A1A2E"
                />
            </View>

            {/* Recent inspections section */}
            <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Últimas inspeções</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>Ver todas</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.emptyInspections}>
                <MaterialIcons name="assignment" size={36} color="#B0A898" />
                <Text style={styles.emptyText}>Nenhuma inspeção recente</Text>
                <Text style={styles.emptySubtext}>As inspeções realizadas aparecerão aqui</Text>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const StatCard = ({ icon, label, value, bgColor, iconBg, iconColor, valueColor }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    value: number;
    bgColor: string;
    iconBg: string;
    iconColor: string;
    valueColor: string;
}) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
        <View style={[styles.statIconContainer, { backgroundColor: iconBg }]}>
            <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: valueColor }]}>
            {String(value).padStart(2, '0')}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notificationBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FDF0E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8752A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    syncDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    syncText: {
        fontSize: 14,
        color: '#1A1A2E',
        fontWeight: '500',
        flex: 1,
    },
    syncAction: {
        color: '#E8752A',
        fontWeight: '600',
        fontSize: 13,
    },
    sectionHeader: {
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
    sectionDate: {
        fontSize: 12,
        color: '#B0A898',
        fontWeight: '600',
        letterSpacing: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#888',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    recentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    viewAllText: {
        color: '#E8752A',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyInspections: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#888',
    },
});
