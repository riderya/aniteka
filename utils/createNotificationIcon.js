import { Asset } from 'expo-asset';

/**
 * Утиліта для створення іконки повідомлень
 * Для Android іконки повідомлень мають бути білими на прозорому фоні
 */

export const createNotificationIcon = () => {
  // Повертаємо шлях до іконки
  // Якщо notification-icon.png не підходить, використовуємо основну іконку
  return require('../assets/icon.png');
};

/**
 * Створює іконку для різних каналів повідомлень
 */
export const getChannelIcon = (channelId) => {
  switch (channelId) {
    case 'anime_updates':
      return '📺';
    case 'comments':
      return '💬';
    case 'social':
      return '👥';
    default:
      return '🎌';
  }
};

/**
 * Створює заголовок з іконкою для повідомлення
 */
export const createNotificationTitle = (title, channelId) => {
  const icon = getChannelIcon(channelId);
  return `${icon} ${title}`;
};

/**
 * Налаштування для різних типів повідомлень
 */
export const notificationConfigs = {
  anime_update: {
    channelId: 'anime_updates',
    icon: '📺',
    color: '#FF231F7C',
    sound: 'default',
  },
  comment: {
    channelId: 'comments',
    icon: '💬',
    color: '#FF231F7C',
    sound: 'default',
  },
  follow: {
    channelId: 'social',
    icon: '👥',
    color: '#FF231F7C',
    sound: 'default',
  },
  like: {
    channelId: 'social',
    icon: '❤️',
    color: '#FF231F7C',
    sound: 'default',
  },
  schedule_update: {
    channelId: 'anime_updates',
    icon: '📅',
    color: '#FF231F7C',
    sound: 'default',
  },
  test: {
    channelId: 'default',
    icon: '🎌',
    color: '#FF231F7C',
    sound: 'default',
  },
};
