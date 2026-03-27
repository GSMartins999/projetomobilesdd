import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setupNotifications() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
}

export async function scheduleInspectionReminder(artworkName: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Lembrete de Inspeção",
            body: `A obra "${artworkName}" não é inspecionada há 30 dias.`,
            data: { type: 'inspection_reminder' },
        },
        trigger: {
            seconds: 60 * 60 * 24 * 30, // 30 dias
            repeats: false,
        },
    });
}

export async function requestNotificationPermission() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === 'granted';
}
