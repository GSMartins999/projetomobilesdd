import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import * as Notifications from 'expo-notifications';

export function NotificationsScreen() {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notifications.NotificationRequest[]>([]);

    useEffect(() => {
        async function load() {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                const scheduled = await Notifications.getAllScheduledNotificationsAsync();
                setNotifications(scheduled);
            }
        }
        load();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#1A1A2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notificações</Text>
                <TouchableOpacity>
                    <Text style={styles.markReadText}>Limpar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {notifications.length > 0 ? (
                    notifications.map((item) => (
                        <TouchableOpacity
                            key={item.identifier}
                            style={styles.notificationCard}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#E8752A15' }]}>
                                <MaterialIcons name="schedule" size={24} color="#E8752A" />
                            </View>
                            <View style={styles.content}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>{item.content.title}</Text>
                                    <Text style={styles.time}>Agendado</Text>
                                </View>
                                <Text style={styles.description} numberOfLines={2}>
                                    {item.content.body}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="notifications-none" size={44} color="#B0A898" />
                        <Text style={styles.emptyText}>Nenhuma notificação</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E8E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    markReadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E8752A',
    },
    scrollContent: {
        padding: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0E8E0',
        alignItems: 'flex-start',
    },
    unreadCard: {
        borderColor: '#E8752A50',
        backgroundColor: '#FFFBF7',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    unreadTitle: {
        fontWeight: 'bold',
    },
    time: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#B0A898',
    },
    description: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E8752A',
        position: 'absolute',
        top: 16,
        right: 16,
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
