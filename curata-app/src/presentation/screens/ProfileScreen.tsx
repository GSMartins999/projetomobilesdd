import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../infrastructure/auth/AuthContext';
import { useTranslation } from 'react-i18next';

export function ProfileScreen() {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Perfil</Text>
                <TouchableOpacity>
                    <MaterialIcons name="settings" size={24} color="#1A1A2E" />
                </TouchableOpacity>
            </View>

            {/* Avatar area */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                    <MaterialIcons name="person" size={36} color="#B0A898" />
                </View>
                <Text style={styles.userName}>{user?.name || 'Curador'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>

            {/* Sync status */}
            <View style={styles.syncBanner}>
                <MaterialIcons name="sync" size={18} color="#D4883A" />
                <Text style={styles.syncText}>ÚLTIMA SINCRONIZAÇÃO: HOJE</Text>
            </View>

            {/* Preferences section */}
            <Text style={styles.sectionLabel}>PREFERÊNCIAS</Text>

            <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.menuIconBg, { backgroundColor: '#FDF0E6' }]}>
                    <MaterialIcons name="translate" size={22} color="#E8752A" />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{t('profile.language', 'Idioma')}</Text>
                    <Text style={styles.menuSubtitle}>
                        {i18n.language === 'pt-BR' ? 'Português (Brasil)' : 'English'}
                    </Text>
                </View>
                <View style={styles.langButtons}>
                    <TouchableOpacity
                        onPress={() => changeLanguage('pt-BR')}
                        style={[styles.langPill, i18n.language === 'pt-BR' && styles.langPillActive]}
                    >
                        <Text style={[styles.langPillText, i18n.language === 'pt-BR' && styles.langPillTextActive]}>PT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => changeLanguage('en')}
                        style={[styles.langPill, i18n.language === 'en' && styles.langPillActive]}
                    >
                        <Text style={[styles.langPillText, i18n.language === 'en' && styles.langPillTextActive]}>EN</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            <View style={styles.menuItem}>
                <View style={[styles.menuIconBg, { backgroundColor: '#FDF0E6' }]}>
                    <MaterialIcons name="map" size={22} color="#E8752A" />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Download de Mapas</Text>
                    <Text style={styles.menuSubtitle}>Somente via Wi-Fi</Text>
                </View>
            </View>

            <View style={styles.menuItem}>
                <View style={[styles.menuIconBg, { backgroundColor: '#FDF0E6' }]}>
                    <MaterialIcons name="notification-important" size={22} color="#E8752A" />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Lembrete de Revisita</Text>
                    <Text style={styles.menuSubtitle}>15 dias</Text>
                </View>
            </View>

            {/* Account section */}
            <Text style={styles.sectionLabel}>CONTA</Text>

            <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.menuIconBg, { backgroundColor: '#F5EDE3' }]}>
                    <MaterialIcons name="sync" size={22} color="#D4883A" />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Sincronizar agora</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={logout}>
                <View style={[styles.menuIconBg, { backgroundColor: '#FDF0F0' }]}>
                    <MaterialIcons name="logout" size={22} color="#E63946" />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.logoutText}>Sair da conta</Text>
                </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
        paddingHorizontal: 20,
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 55,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5EDE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#E8752A',
    },
    syncBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDF0E6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#F0E0CC',
        gap: 8,
    },
    syncText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#D4883A',
        letterSpacing: 1,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B0A898',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginTop: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0E8E0',
    },
    menuIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    langButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    langPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E0D8',
    },
    langPillActive: {
        backgroundColor: '#E8752A',
        borderColor: '#E8752A',
    },
    langPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
    },
    langPillTextActive: {
        color: '#FFFFFF',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E63946',
    },
});
