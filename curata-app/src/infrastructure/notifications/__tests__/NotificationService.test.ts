import * as Notifications from 'expo-notifications';
import { setupNotifications, scheduleInspectionReminder, requestNotificationPermission } from '../NotificationService';
import { Platform } from 'react-native';

jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    AndroidImportance: { MAX: 4 },
}));

describe('NotificationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should setup notifications', async () => {
        await setupNotifications();
        expect(Notifications.setNotificationHandler).toHaveBeenCalled();

        if (Platform.OS === 'android') {
            expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.any(Object));
        }
    });

    it('should schedule inspection reminder', async () => {
        await scheduleInspectionReminder('Mona Lisa');
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.objectContaining({
                title: "Lembrete de Inspeção",
                body: expect.stringContaining('Mona Lisa'),
            }),
            trigger: expect.objectContaining({
                seconds: 60 * 60 * 24 * 30,
            }),
        }));
    });

    it('should request notification permission and return true if granted', async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'undetermined' });
        (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });

        const result = await requestNotificationPermission();

        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should return true if permission is already granted', async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });

        const result = await requestNotificationPermission();

        expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should return false if permission is denied', async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
        (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });

        const result = await requestNotificationPermission();
        expect(result).toBe(false);
    });
});
