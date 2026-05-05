import React from 'react';
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

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'warning' | 'schedule' | 'check_circle' | 'info';
    unread: boolean;
}

export function NotificationsScreen() {
    const navigation = useNavigation();

    const notifications: NotificationItem[] = [
        {
            id: '1',
            title: 'Inspeção Urgente!',
            description: 'A obra "A Noite Estrelada Revisitada" atingiu o nível crítico de conservação.',
            time: 'HÁ 5 MIN',
            type: 'warning',
            unread: true,
        },
        {
            id: '2',
            title: 'Agendamento Confirmado',
            description: 'Sua visita ao Museu de Arte Moderna foi confirmada para amanhã às 10h.',
            time: 'HÁ 2 HORAS',
            type: 'schedule',
            unread: true,
        },
        {
            id: '3',
            title: 'Inspeção Concluída',
            description: 'O relatório da obra "Monumento às Bandeiras" foi enviado com sucesso.',
            time: 'HÁ 5 HORAS',
            type: 'check_circle',
            unread: false,
        },
        {
            id: '4',
            title: 'Novo Objeto Encontrado',
            description: 'Uma nova obra foi detectada próxima à sua localização atual.',
            time: 'ONTEM',
            type: 'info',
            unread: false,
        },
    ];

    const getIconColor = (type: string) => {
        switch (type) {
            case 'warning': return '#E63946';
            case 'schedule': return '#E8752A';
            case 'check_circle': return '#2D6A4F';
            default: return '#D4883A';
        }
    };

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
                {notifications.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.notificationCard, item.unread && styles.unreadCard]}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.type)}15` }]}>
                            <MaterialIcons name={item.type as any} size={24} color={getIconColor(item.type)} />
                        </View>
                        <View style={styles.content}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.title, item.unread && styles.unreadTitle]}>{item.title}</Text>
                                <Text style={styles.time}>{item.time}</Text>
                            </View>
                            <Text style={styles.description} numberOfLines={2}>
                                {item.description}
                            </Text>
                        </View>
                        {item.unread && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                ))}
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
});
