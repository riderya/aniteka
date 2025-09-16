import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from './AuthContext';
import NotificationService from '../services/NotificationService';

const NotificationsContext = createContext({
  unseenCount: 0,
  loadUnseenCount: () => {},
  setUnseenCount: () => {},
  decrementUnseenCount: () => {},
  expoPushToken: null,
  notificationService: null,
  initializeNotifications: () => {},
  checkPermissionStatus: () => {},
  checkNotificationsManually: () => {},
  isWifiConnected: true,
  clearNotificationDedupeCache: () => {},
});

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [unseenCount, setUnseenCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState(null);
  // Видаляємо застарілу систему lastSentNotifications - тепер використовуємо тільки уніфіковану дедуплікацію
  const [isAppActive, setIsAppActive] = useState(true);
  const [isWifiConnected, setIsWifiConnected] = useState(true);
  const [cachedSettings, setCachedSettings] = useState(null);
  const [lastSettingsCheck, setLastSettingsCheck] = useState(0);
  const { token, isAuthenticated } = useAuth();

  // Стійке дедуплікування за ключем з TTL
  const DEDUPE_STORAGE_KEY = 'yal_notification_dedupe';
  const DEDUPE_TTL_MS = 24 * 60 * 60 * 1000; // 24 години (замість 10 хвилин)
  const MAX_DEDUPE_ENTRIES = 500; // Збільшуємо кількість записів
  const sentDedupMapRef = useRef(new Map()); // key -> timestamp

  // Завантаження стійкого кешу дедуплікації
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DEDUPE_STORAGE_KEY);
        if (raw) {
          const obj = JSON.parse(raw);
          const now = Date.now();
          const restored = new Map();
          let cleanedCount = 0;
          
          for (const [k, ts] of Object.entries(obj)) {
            if (typeof ts === 'number' && now - ts < DEDUPE_TTL_MS) {
              restored.set(k, ts);
            } else {
              cleanedCount++;
            }
          }
          
          sentDedupMapRef.current = restored;
          
          // Якщо очистили багато записів, зберігаємо оновлений кеш
          if (cleanedCount > 0) {
            await persistDedupeMap();
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [persistDedupeMap]);

  const persistDedupeMap = useCallback(async () => {
    try {
      // Очищаємо тільки дуже старі записи (старші за 7 днів) та обрізаємо розмір
      const now = Date.now();
      const CLEANUP_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 днів для очищення
      
      const entries = Array.from(sentDedupMapRef.current.entries())
        .filter(([, ts]) => now - ts < CLEANUP_TTL_MS) // Зберігаємо записи до 7 днів
        .sort((a, b) => b[1] - a[1]) // Сортуємо за часом (новіші першими)
        .slice(0, MAX_DEDUPE_ENTRIES); // Обрізаємо до максимальної кількості
      
      const obj = Object.fromEntries(entries);
      await AsyncStorage.setItem(DEDUPE_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // ignore
    }
  }, []);

  const buildDedupeKey = useCallback((item) => {
    const type = item?.notification_type || '';
    const ref = item?.reference || item?.id || item?._id;
    
    if (ref) {
      // Якщо є стабільний reference — використовуємо його як ключ
      return `ref|${type}|${ref}`;
    }
    
    // Для сповіщень без reference створюємо стабільний ключ
    const username = item?.initiator_user?.username || '';
    const userId = item?.initiator_user?.id || '';
    
    // Для різних типів сповіщень використовуємо різні стратегії
    switch (type) {
      case 'schedule_anime':
        // Для аніме використовуємо ID аніме та номер епізоду
        const animeId = item?.data?.anime_id || item?.data?.id || '';
        const episodeNum = item?.data?.after?.episodes_released || item?.data?.episodes_released || '';
        return `anime|${animeId}|${episodeNum}`;
        
      case 'comment_reply':
      case 'comment_mention':
        // Для коментарів використовуємо ID коментаря
        const commentId = item?.data?.comment_id || item?.data?.id || '';
        return `comment|${type}|${commentId}`;
        
      case 'vote_increase':
      case 'comment_vote':
        // Для голосувань використовуємо ID об'єкта та користувача
        const voteTargetId = item?.data?.target_id || item?.data?.id || '';
        return `vote|${type}|${voteTargetId}|${userId}`;
        
      case 'follow':
      case 'like':
        // Для соціальних дій використовуємо ID користувача та тип
        return `social|${type}|${userId}`;
        
      default:
        // Для інших типів використовуємо комбінацію тип + username + title
        const title = item?.data?.title || '';
        return `default|${type}|${username}|${title}`;
    }
  }, []);

  const isDuplicateNotification = useCallback((item) => {
    const key = buildDedupeKey(item);
    const ts = sentDedupMapRef.current.get(key);
    if (ts && Date.now() - ts < DEDUPE_TTL_MS) return true;
    return false;
  }, [buildDedupeKey]);

  const markNotificationSent = useCallback(async (item) => {
    const key = buildDedupeKey(item);
    const timestamp = Date.now();
    
    // Додаємо запис в пам'ять
    sentDedupMapRef.current.set(key, timestamp);
    
    // Зберігаємо в AsyncStorage (не чекаємо на завершення для швидкості)
    persistDedupeMap().catch(() => {
      // Ігноруємо помилки збереження
    });
    
    // Додаткова перевірка: якщо це сповіщення з reference, зберігаємо його окремо
    const ref = item?.reference || item?.id || item?._id;
    if (ref) {
      const refKey = `ref|${item?.notification_type || ''}|${ref}`;
      sentDedupMapRef.current.set(refKey, timestamp);
    }
  }, [buildDedupeKey, persistDedupeMap]);

  const loadUnseenCount = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setUnseenCount(0);
      return;
    }

    try {
      const res = await fetch('https://api.hikka.io/notifications/count', { 
        headers: { auth: token } 
      });
      if (!res.ok) return;
      
      const data = await res.json();
      if (typeof data.unseen === 'number') {
        setUnseenCount(data.unseen);
      }
    } catch (e) {
      // Silent error handling
    }
  }, [token, isAuthenticated]);

  const decrementUnseenCount = useCallback(() => {
    setUnseenCount(prev => Math.max(0, prev - 1));
  }, []);

  // Ініціалізація пуш-повідомлень
  const initializeNotifications = useCallback(async () => {
    try {
      const success = await NotificationService.initialize();
      if (success) {
        const token = NotificationService.getExpoPushToken();
        setExpoPushToken(token);
      }
    } catch (error) {
    }
  }, []);

  // Перевірка статусу дозволу
  const checkPermissionStatus = useCallback(async () => {
    try {
      const hasPermission = await NotificationService.checkPermissions();
      if (hasPermission && !expoPushToken) {
        // Якщо дозвіл є, але токену немає, перезапускаємо ініціалізацію
        await initializeNotifications();
      }
      return hasPermission;
    } catch (error) {
      return false;
    }
  }, [expoPushToken, initializeNotifications]);

  // Отримання кешованих налаштувань сповіщень
  const getCachedNotificationSettings = useCallback(async () => {
    const now = Date.now();
    // Кешуємо налаштування на 5 хвилин
    if (cachedSettings && (now - lastSettingsCheck) < 300000) {
      return cachedSettings;
    }
    
    try {
      const settings = await NotificationService.getNotificationSettings();
      setCachedSettings(settings);
      setLastSettingsCheck(now);
      return settings;
    } catch (error) {
      console.error('Помилка отримання налаштувань сповіщень:', error);
      return cachedSettings || {
        pushNotifications: true,
        sound: true,
        vibration: true,
        animeUpdates: true,
        commentReply: true,
        commentMention: true,
        commentInCollection: true,
        commentInArticle: true,
        commentInWork: true,
        ratingComment: true,
        ratingCollection: true,
        ratingArticle: true,
        editAccepted: true,
        editRejected: true,
        userSubscribe: true,
        userLike: true,
        systemUpdates: true,
      };
    }
  }, [cachedSettings, lastSettingsCheck]);

  // Ручна перевірка нових сповіщень (для швидшого отримання)
  const checkNotificationsManually = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      
      const res = await fetch(
        `https://api.hikka.io/notifications?page=1&size=5`,
        { headers: { auth: token } }
      );
      if (!res.ok) return;
      
      const data = await res.json();
      const newList = Array.isArray(data.list) ? data.list : [];
      
      // Перевіряємо чи є нові непрочитані сповіщення
      const unseenItems = newList.filter(item => !item.seen);
      
      if (unseenItems.length > 0) {
        // Отримуємо кешовані налаштування сповіщень
        const settings = await getCachedNotificationSettings();
        if (!settings.pushNotifications) return;

        // Фільтруємо сповіщення, які ще не відправлялися (використовуємо уніфіковану систему дедуплікації)
        const newNotifications = unseenItems.filter(item => 
          !isDuplicateNotification(item)
        );
        
        // Відправляємо пуш-повідомлення для нових сповіщень
        for (const item of newNotifications.slice(0, 3)) {
          const type = item.notification_type;
          
          // Перевіряємо налаштування для кожного типу
          if (type === 'schedule_anime' && !settings.animeUpdates) continue;
          if (type === 'comment_reply' && !settings.commentReply) continue;
          if (type === 'comment_mention' && !settings.commentMention) continue;
          if (type === 'comment_in_collection' && !settings.commentInCollection) continue;
          if (type === 'comment_in_article' && !settings.commentInArticle) continue;
          if (type === 'comment_in_work' && !settings.commentInWork) continue;
          if (type === 'vote_increase' && !settings.ratingComment) continue;
          if (type === 'comment_vote' && !settings.ratingComment) continue;
          if (type === 'collection_vote' && !settings.ratingCollection) continue;
          if (type === 'article_vote' && !settings.ratingArticle) continue;
          if (type === 'edit_accepted' && !settings.editAccepted) continue;
          if (type === 'edit_rejected' && !settings.editRejected) continue;
          if (type === 'follow' && !settings.userSubscribe) continue;
          if (type === 'like' && !settings.userLike) continue;
          if (type === 'hikka_update' && !settings.systemUpdates) continue;

          const title = getNotificationTitle(item);
          const subtitle = getNotificationSubtitle(item);
          const imageUrl = getNotificationImage(item);

          // Відправляємо пуш-повідомлення
          const success = await NotificationService.sendNotificationWithImage(
            title,
            subtitle,
            imageUrl,
            {
              type: type,
              reference: item.reference,
              ...item.data
            }
          );
          
          if (success) {
            // Позначаємо сповіщення як відправлене в уніфікованій системі
            await markNotificationSent(item);
          } else {
          }
        }
      }
    } catch (error) {
    }
  }, [isAuthenticated, token, isDuplicateNotification, markNotificationSent, getCachedNotificationSettings, getNotificationTitle, getNotificationSubtitle, getNotificationImage]);


  // Load unseen count when user authenticates or token changes
  useEffect(() => {
    if (isAuthenticated && token) {
      // Add a small delay to prevent multiple rapid calls during auth process
      const timeoutId = setTimeout(() => {
        loadUnseenCount();
      }, 50);
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(loadUnseenCount, 30000);
      
      return () => {
        clearTimeout(timeoutId);
        clearInterval(interval);
      };
    } else {
      setUnseenCount(0);
    }
  }, [isAuthenticated, token]); // Видаляємо loadUnseenCount з залежностей

  // Автоматична перевірка нових сповіщень для пуш-повідомлень
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const checkForNewNotifications = async () => {
      try {
        // Перевіряємо тільки якщо додаток активний
        if (!isAppActive) {
          return;
        }

        
        
        const res = await fetch(
          `https://api.hikka.io/notifications?page=1&size=5`,
          { headers: { auth: token } }
        );
        if (!res.ok) {
          return;
        }
        
        const data = await res.json();
        const newList = Array.isArray(data.list) ? data.list : [];
        
        // Перевіряємо чи є нові непрочитані сповіщення
        const unseenItems = newList.filter(item => !item.seen);
        
        if (unseenItems.length > 0) {
          // Отримуємо кешовані налаштування сповіщень
          const settings = await getCachedNotificationSettings();
          if (!settings.pushNotifications) {
            return;
          }

          // Фільтруємо сповіщення, які ще не відправлялися
          const newNotifications = unseenItems.filter(item => !isDuplicateNotification(item));
          
          // Відправляємо пуш-повідомлення для нових сповіщень
          for (const item of newNotifications.slice(0, 3)) { // Обмежуємо до 3 сповіщень для кращої продуктивності
            const type = item.notification_type;
            
            // Перевіряємо налаштування для кожного типу
            if (type === 'schedule_anime' && !settings.animeUpdates) {
              continue;
            }
            if ((type === 'comment_reply' && !settings.commentReply) ||
                (type === 'comment_mention' && !settings.commentMention) ||
                (type === 'comment_in_collection' && !settings.commentInCollection) ||
                (type === 'comment_in_article' && !settings.commentInArticle) ||
                (type === 'comment_in_work' && !settings.commentInWork) ||
                ((type === 'vote_increase' || type === 'comment_vote') && !settings.ratingComment) ||
                (type === 'collection_vote' && !settings.ratingCollection) ||
                (type === 'article_vote' && !settings.ratingArticle) ||
                (type === 'edit_accepted' && !settings.editAccepted) ||
                (type === 'edit_rejected' && !settings.editRejected) ||
                (type === 'follow' && !settings.userSubscribe) ||
                (type === 'like' && !settings.userLike) ||
                (type === 'hikka_update' && !settings.systemUpdates)) {
              continue;
            }

            const title = getNotificationTitle(item);
            const subtitle = getNotificationSubtitle(item);
            const imageUrl = getNotificationImage(item);

            // Відправляємо пуш-повідомлення
            const success = await NotificationService.sendNotificationWithImage(
              title,
              subtitle,
              imageUrl,
              {
                type: type,
                reference: item.reference,
                ...item.data
              }
            );
            
            if (success) {
              await markNotificationSent(item);
            } else {
            }
          }
        }
      } catch (error) {
      }
    };

    // Миттєва перевірка при завантаженні
    checkForNewNotifications();
    
    // Оптимізований інтервал залежно від стану додатку
    const getInterval = () => {
      if (!isAppActive) {
        return 180000; // 3 хвилини коли неактивний
      }
      
      if (!isWifiConnected) {
        return 45000; // 45 секунд на мобільному
      }
      
      return 20000; // 20 секунд на WiFi для швидшого отримання
    };
    
    const interval = setInterval(checkForNewNotifications, getInterval());

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, token, isAppActive, isWifiConnected, isDuplicateNotification, markNotificationSent, getCachedNotificationSettings]);

  // Допоміжні функції для обробки сповіщень
  const getNotificationTitle = (item) => {
    const username = item?.initiator_user?.username || 'Користувач';
    const type = item?.notification_type || 'оновлення';
    const extra = item?.data?.delta ? ` (+${item.data.delta})` : '';
    
    switch (type) {
      case 'vote_increase':
      case 'comment_vote':
        return `Нова оцінка${extra}`;
      case 'oauth_login':
      case 'thirdparty_login': {
        const appName = item?.data?.client?.name || item?.data?.client_name || '';
        if (appName.toLowerCase().includes('yummyanimelist')) {
          return 'Авторизація';
        }
        return 'Стороння авторизація';
      }
      case 'schedule_anime': {
        const d = getScheduleAnimeData(item);
        const { title_ua, title_en, title_ja, season } = d || {};
        const title = title_ua || title_en || title_ja || 'Оновлення розкладу';
        if (season) return `${title} - ${season}`;
        return title;
      }
      case 'comment_reply':
        return 'Новий коментар';
      case 'hikka_update':
        return item?.data?.title || 'Оновлення Хікки';
      case 'follow':
        return 'Нова підписка';
      case 'like':
        return 'Нове вподобання';
      default:
        return type;
    }
  };

  const getNotificationSubtitle = (item) => {
    const username = item?.initiator_user?.username || 'Користувач';
    const type = item?.notification_type || '';
    
    switch (type) {
      case 'vote_increase':
      case 'comment_vote':
        return `Користувач ${username} оцінив Ваш коментар`;
      case 'oauth_login':
      case 'thirdparty_login': {
        const appName = item?.data?.client?.name || item?.data?.client_name || '';
        if (appName.toLowerCase().includes('yummyanimelist')) {
          return 'Ви успішно увійшли в систему';
        }
        return `Ви авторизувались через застосунок ${appName}`;
      }
      case 'schedule_anime': {
        const ep = getEpisodeNumber(item);
        return `Вийшов ${ep ? ep + ' епізод' : 'новий епізод'} аніме`;
      }
      case 'comment_reply':
        return `Користувач ${username} відповів на Ваш коментар`;
      case 'follow':
        return `Користувач ${username} підписався на Вас`;
      case 'hikka_update':
        return item?.data?.description || '';
      default:
        return '';
    }
  };

  const getNotificationImage = (item) => {
    const type = item?.notification_type;
    if (type === 'schedule_anime') {
      const d = getScheduleAnimeData(item);
      return d?.image || d?.poster || d?.cover || null;
    }
    // Для comment_reply, vote_increase, comment_vote, follow, like показуємо аватар користувача
    if (type === 'comment_reply' || type === 'vote_increase' || type === 'comment_vote' || type === 'follow' || type === 'like') {
      return item?.initiator_user?.avatar && item.initiator_user.avatar !== 'string'
        ? item.initiator_user.avatar
        : null;
    }
    return item?.initiator_user?.avatar && item.initiator_user.avatar !== 'string'
      ? item.initiator_user.avatar
      : null;
  };

  const getScheduleAnimeData = (item) => {
    const data = item?.notification_type === 'schedule_anime' ? item?.data : null;
    if (!data) return null;
    if (Array.isArray(data.list) && data.list.length > 0) return data.list[0];
    return data;
  };

  const getEpisodeNumber = (item) => {
    const d = getScheduleAnimeData(item);
    const raw = d?.after?.episodes_released ?? d?.episodes_released;
    if (raw == null) return null;
    const str = String(raw).trim();
    const n = parseInt(str, 10);
    if (!Number.isNaN(n) && n > 0) return n;
    const match = str.match(/\d+/);
    if (match) {
      const m = parseInt(match[0], 10);
      return Number.isNaN(m) || m <= 0 ? null : m;
    }
    return null;
  };

  // Відстеження стану додатку для оптимізації
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      setIsAppActive(nextAppState === 'active');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  // Відстеження типу підключення для економії трафіку
  useEffect(() => {
    const handleConnectionChange = (state) => {
      const isWifi = state.type === 'wifi';
      setIsWifiConnected(isWifi);
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectionChange);
    
    // Отримуємо поточний стан
    NetInfo.fetch().then(handleConnectionChange);
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Ініціалізація пуш-повідомлень при запуску додатку
  useEffect(() => {
    initializeNotifications();
    
    // Очищення при розмонтуванні
    return () => {
      NotificationService.cleanup();
    };
  }, [initializeNotifications]);

  // Функція для очищення кешу дедуплікації (для тестування або скидання)
  const clearNotificationDedupeCache = useCallback(async () => {
    try {
      sentDedupMapRef.current.clear();
      await AsyncStorage.removeItem(DEDUPE_STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const value = {
    unseenCount,
    loadUnseenCount,
    setUnseenCount,
    decrementUnseenCount,
    expoPushToken,
    notificationService: NotificationService,
    initializeNotifications,
    checkPermissionStatus,
    checkNotificationsManually,
    isWifiConnected,
    clearNotificationDedupeCache,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};