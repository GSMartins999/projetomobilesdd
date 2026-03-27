import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../infrastructure/auth/AuthContext';
import { useTranslation } from 'react-i18next';

export function ProfileScreen() {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/100' }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{user?.name || 'Curador'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.settings', 'Configurações')}</Text>

                <View style={styles.langRow}>
                    <Text>{t('profile.language', 'Idioma')}:</Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={() => changeLanguage('pt-BR')} style={styles.langBtn}>
                            <Text style={i18n.language === 'pt-BR' && styles.activeLang}>PT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => changeLanguage('en')} style={styles.langBtn}>
                            <Text style={i18n.language === 'en' && styles.activeLang}>EN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutText}>{t('auth.logout', 'Sair')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
    name: { fontSize: 22, fontWeight: 'bold' },
    email: { color: '#666', marginTop: 5 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    buttons: { flexDirection: 'row' },
    langBtn: { padding: 10, marginLeft: 10 },
    activeLang: { fontWeight: 'bold', color: '#2A4D69' },
    logoutBtn: { backgroundColor: '#fee', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 'auto' },
    logoutText: { color: '#e63946', fontWeight: 'bold' }
});
