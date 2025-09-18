import UpdateService from '../services/UpdateService';
import { Alert } from 'react-native';

// Функція для тестування системи оновлень в режимі розробки
export const testUpdateSystem = async () => {
  console.log('🔄 Тестування системи оновлень...');
  
  try {
    // Перевірка версії
    const versionInfo = await UpdateService.getVersionInfo();
    console.log('📱 Інформація про версію:', versionInfo);
    
    if (__DEV__) {
      // В режимі розробки показуємо симуляцію
      console.log('🧪 Режим розробки - симуляція тестування');
      Alert.alert(
        'Тест оновлень (Режим розробки)',
        `Система оновлень працює!\n\nВерсія: ${versionInfo.currentVersion}\nКанал: ${versionInfo.channel}\n\nВ продакшн режимі система буде автоматично перевіряти реальні оновлення.`,
        [{ text: 'OK' }]
      );
      return true;
    }
    
    // Симуляція перевірки оновлень для продакшн
    console.log('🔍 Перевірка оновлень...');
    const update = await UpdateService.checkForUpdates(true);
    
    if (update) {
      console.log('✅ Знайдено оновлення:', update);
      Alert.alert(
        'Тест оновлень',
        'Система оновлень працює! Знайдено оновлення.',
        [{ text: 'OK' }]
      );
    } else {
      console.log('ℹ️ Оновлень не знайдено');
      Alert.alert(
        'Тест оновлень',
        'Система оновлень працює! Оновлень не знайдено.',
        [{ text: 'OK' }]
      );
    }
    
    return true;
  } catch (error) {
    console.error('❌ Помилка тестування:', error);
    Alert.alert(
      'Помилка тестування',
      `Помилка: ${error.message}`,
      [{ text: 'OK' }]
    );
    return false;
  }
};

// Функція для симуляції оновлення
export const simulateUpdate = () => {
  Alert.alert(
    'Симуляція оновлення',
    'Доступне нове оновлення! Бажаєте завантажити?',
    [
      { text: 'Пізніше', style: 'cancel' },
      { 
        text: 'Завантажити', 
        onPress: () => {
          Alert.alert(
            'Завантаження',
            'Оновлення завантажується... (симуляція)',
            [{ text: 'OK' }]
          );
        }
      }
    ]
  );
};

// Функція для перевірки конфігурації
export const checkUpdateConfiguration = () => {
  const config = {
    updatesEnabled: UpdateService.isUpdateAvailable(),
    isDevelopment: __DEV__,
    platform: require('react-native').Platform.OS,
  };
  
  console.log('⚙️ Конфігурація оновлень:', config);
  
  Alert.alert(
    'Конфігурація оновлень',
    `Оновлення увімкнені: ${config.updatesEnabled ? 'Так' : 'Ні'}\n` +
    `Режим розробки: ${config.isDevelopment ? 'Так' : 'Ні'}\n` +
    `Платформа: ${config.platform}`,
    [{ text: 'OK' }]
  );
  
  return config;
};
