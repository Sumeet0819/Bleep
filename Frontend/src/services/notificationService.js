import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationIds = new Map(); // Map reminder ID to notification ID
  }

  /**
   * Initialize notification permissions and get push token
   * Call this when the app starts
   */
  async initialize() {
    try {
      // Check if device is physical (notifications don't work on simulator/emulator)
      if (!Device.isDevice) {
        console.warn('Notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return null;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0A8C6D',
          sound: 'default',
        });
      }

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  /**
   * Schedule a notification for a reminder
   * @param {Object} reminder - The reminder object with _id, reminder (text), and date
   * @returns {Promise<string>} - The notification ID
   */
  async scheduleReminder(reminder) {
    try {
      const { _id, reminder: text, date } = reminder;
      
      // Parse the date
      const reminderDate = new Date(date);
      const now = new Date();

      // Check if the reminder is in the future
      if (reminderDate <= now) {
        console.warn('Cannot schedule notification for past time');
        return null;
      }

      // Calculate seconds until the reminder
      const secondsUntilReminder = Math.floor((reminderDate - now) / 1000);

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Reminder',
          body: text,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#0A8C6D',
          data: { reminderId: _id },
        },
        trigger: {
          seconds: secondsUntilReminder,
          channelId: 'reminders',
        },
      });

      // Store the mapping
      this.notificationIds.set(_id, notificationId);

      console.log(`Scheduled notification ${notificationId} for reminder ${_id} in ${secondsUntilReminder}s`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification for a reminder
   * @param {string} reminderId - The reminder ID
   */
  async cancelReminder(reminderId) {
    try {
      const notificationId = this.notificationIds.get(reminderId);
      
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        this.notificationIds.delete(reminderId);
        console.log(`Cancelled notification for reminder ${reminderId}`);
      } else {
        console.warn(`No notification found for reminder ${reminderId}`);
      }
    } catch (error) {
      console.error('Error cancelling reminder notification:', error);
    }
  }

  /**
   * Schedule notifications for multiple reminders
   * @param {Array} reminders - Array of reminder objects
   */
  async scheduleMultipleReminders(reminders) {
    try {
      const results = await Promise.allSettled(
        reminders.map(reminder => this.scheduleReminder(reminder))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Scheduled ${successful}/${reminders.length} reminder notifications`);
      
      return results;
    } catch (error) {
      console.error('Error scheduling multiple reminders:', error);
      return [];
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIds.clear();
      console.log('Cancelled all reminder notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Add a notification received listener
   * @param {Function} callback - Function to call when notification is received
   */
  addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add a notification response listener (when user taps on notification)
   * @param {Function} callback - Function to call when notification is tapped
   */
  addNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

// Export a singleton instance
export default new NotificationService();
