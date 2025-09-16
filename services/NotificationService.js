import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationConfigs, createNotificationTitle } from '../utils/createNotificationIcon';

// Конфігурація для обробки повідомлень
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Instead of shouldShowAlert
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const EXPO_PUSH_TOKEN_KEY = 'expo_push_token';

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Ініціалізація сервісу
  async initialize() {
    try {
      // Завантажуємо збережений токен
      const savedToken = await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
      if (savedToken) {
        this.expoPushToken = savedToken;
      }

      // Реєструємо обробники
      this.setupNotificationListeners();
      
      // Отримуємо новий токен якщо потрібно
      await this.registerForPushNotificationsAsync();
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Налаштування обробників повідомлень
  setupNotificationListeners() {
    // Обробник отримання повідомлення
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      this.handleNotificationReceived(notification);
    });

    // Обробник натискання на повідомлення
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
  }

  // Обробка отриманого повідомлення
  handleNotificationReceived(notification) {
  }

  // Обробка натискання на повідомлення
  handleNotificationResponse(response) {
    const data = response.notification.request.content.data;
    
    // Навігація залежно від типу повідомлення
    if (data?.type === 'anime_update') {
    } else if (data?.type === 'comment') {
    } else if (data?.type === 'follow') {
    }
  }

  // Реєстрація для пуш-повідомлень
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      // Основний канал з іконкою додатку
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Загальні сповіщення',
        description: 'Основні сповіщення від YummyAnimeList',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Канал для оновлень аніме
      await Notifications.setNotificationChannelAsync('anime_updates', {
        name: 'Оновлення аніме',
        description: 'Сповіщення про нові епізоди та оновлення розкладу',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      // Канал для коментарів
      await Notifications.setNotificationChannelAsync('comments', {
        name: 'Коментарі',
        description: 'Сповіщення про нові коментарі та відповіді',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      // Канал для соціальних дій
      await Notifications.setNotificationChannelAsync('social', {
        name: 'Соціальні',
        description: 'Сповіщення про підписки, лайки та інші соціальні дії',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return null;
      }
      
      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        
        // Зберігаємо токен
        await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
        this.expoPushToken = token;
        
        return token;
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }

  // Отримання поточного токену
  getExpoPushToken() {
    return this.expoPushToken;
  }


  // Перевірка дозволів
  async checkPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Запит дозволів
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }


  // Відправка повідомлення з зображенням
  async sendNotificationWithImage(title, body, imageUrl, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          badge: 1,
          // Додаємо зображення якщо доступне
          ...(imageUrl && { attachments: [{ url: imageUrl }] }),
        },
        trigger: null,
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Очищення всіх повідомлень
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Отримання налаштувань повідомлень
  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        // Загальні
        pushNotifications: true,
        sound: true,
        vibration: true,

        // Аніме
        animeUpdates: true,

        // Коментарі
        commentReply: true,
        commentMention: true,
        commentInCollection: true,
        commentInArticle: true,
        commentInWork: true,

        // Оцінки
        ratingComment: true,
        ratingCollection: true,
        ratingArticle: true,

        // Правки
        editAccepted: true,
        editRejected: true,

        // Користувачі
        userSubscribe: true,
        userLike: true,

        // Інше
        systemUpdates: true,
      };
    } catch (error) {
      return null;
    }
  }

  // Збереження налаштувань повідомлень
  async saveNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Очищення ресурсів
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  async sendPushNotification(notification) {
    try {
      // Send notification without logging
      const result = await this.notificationProvider.send(notification);
      return result;
    } catch (error) {
      // Only log errors
      throw error;
    }
  }

  handleNotificationReceived(notification) {
    // Process notification without debug logs
    if (!notification?.data) return;
    
    // Handle notification data
    const { data } = notification;
    // Process notification data as needed
  }
}

// Експортуємо єдиний екземпляр сервісу
export default new NotificationService();

export function createNotification(animeData) {
  return {
    title: animeData.title_ua,
    body: `Вийшов ${animeData.after.episodes_released} епізод аніме`,
    data: animeData, // Use data instead of dataString
    badge: 1,
    sound: 'custom',
    autoDismiss: true
  };
}
