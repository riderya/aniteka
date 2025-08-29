import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';

const WatchStatusContext = createContext();

export const WatchStatusProvider = ({ children }) => {
  const [status, setStatus] = useState('Не дивлюсь');
  const [score, setScore] = useState(0);
  const [episodes, setEpisodes] = useState(null);
  
  // Глобальний стан для статусів всіх аніме
  const [animeStatuses, setAnimeStatuses] = useState({});
  const [favourites, setFavourites] = useState({});
  
  // Кеш для токена та стану авторизації
  const [authToken, setAuthToken] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  // Реф для відстеження активних запитів
  const activeRequests = useRef(new Map());
  
  // Кеш для збереження результатів запитів
  const statusCache = useRef(new Map());
  const favouriteCache = useRef(new Map());

  // Ініціалізація токена при завантаженні
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('hikka_token');
        setAuthToken(token);
      } catch (error) {
        console.log('Auth token not found');
      } finally {
        setIsAuthChecked(true);
      }
    };
    
    initAuth();
  }, []);

  // Функція для отримання статусу з кешу або API
  const fetchAnimeStatus = useCallback(async (slug) => {
    if (!authToken || !slug) return null;
    
    // Перевіряємо кеш
    if (statusCache.current.has(slug)) {
      return statusCache.current.get(slug);
    }
    
    // Перевіряємо активні запити
    if (activeRequests.current.has(slug)) {
      return activeRequests.current.get(slug);
    }
    
    // Створюємо новий запит
    const requestPromise = fetch(`https://api.hikka.io/watch/${slug}`, {
      headers: { auth: authToken },
    }).then(async (res) => {
      if (res.status === 404) {
        return null;
      }
      const data = await res.json();
      return data.status;
    }).catch(() => null);
    
    // Зберігаємо активний запит
    activeRequests.current.set(slug, requestPromise);
    
    try {
      const result = await requestPromise;
      // Зберігаємо в кеш
      statusCache.current.set(slug, result);
      // Оновлюємо глобальний стан
      setAnimeStatuses(prev => ({
        ...prev,
        [slug]: result
      }));
      return result;
    } finally {
      // Видаляємо з активних запитів
      activeRequests.current.delete(slug);
    }
  }, [authToken]);

  // Функція для отримання вподобаного з кешу або API
  const fetchAnimeFavourite = useCallback(async (slug) => {
    if (!authToken || !slug) return false;
    
    // Перевіряємо кеш
    if (favouriteCache.current.has(slug)) {
      return favouriteCache.current.get(slug);
    }
    
    // Перевіряємо активні запити
    const requestKey = `favourite_${slug}`;
    if (activeRequests.current.has(requestKey)) {
      return activeRequests.current.get(requestKey);
    }
    
    // Створюємо новий запит
    const requestPromise = fetch(`https://api.hikka.io/favourite/anime/${slug}`, {
      headers: { auth: authToken },
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        return !!data.reference;
      }
      return false;
    }).catch(() => false);
    
    // Зберігаємо активний запит
    activeRequests.current.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      // Зберігаємо в кеш
      favouriteCache.current.set(slug, result);
      // Оновлюємо глобальний стан
      setFavourites(prev => ({
        ...prev,
        [slug]: result
      }));
      return result;
    } finally {
      // Видаляємо з активних запитів
      activeRequests.current.delete(requestKey);
    }
  }, [authToken]);

  // Функція для оновлення статусу конкретного аніме
  const updateAnimeStatus = useCallback((slug, newStatus) => {
    setAnimeStatuses(prev => ({
      ...prev,
      [slug]: newStatus
    }));
    // Оновлюємо кеш
    statusCache.current.set(slug, newStatus);
  }, []);

  // Функція для оновлення вподобаного конкретного аніме
  const updateAnimeFavourite = useCallback((slug, isFavourite) => {
    setFavourites(prev => ({
      ...prev,
      [slug]: isFavourite
    }));
    // Оновлюємо кеш
    favouriteCache.current.set(slug, isFavourite);
  }, []);

  // Функція для отримання статусу конкретного аніме
  const getAnimeStatus = useCallback((slug) => {
    return animeStatuses[slug] || null;
  }, [animeStatuses]);

  // Функція для отримання вподобаного конкретного аніме
  const getAnimeFavourite = useCallback((slug) => {
    return favourites[slug] || false;
  }, [favourites]);

  // Функція для очищення кешу
  const clearCache = useCallback(() => {
    statusCache.current.clear();
    favouriteCache.current.clear();
    activeRequests.current.clear();
  }, []);

  return (
    <WatchStatusContext.Provider
      value={{ 
        status, 
        setStatus, 
        score, 
        setScore, 
        episodes, 
        setEpisodes,
        animeStatuses,
        favourites,
        authToken,
        isAuthChecked,
        updateAnimeStatus,
        updateAnimeFavourite,
        getAnimeStatus,
        getAnimeFavourite,
        fetchAnimeStatus,
        fetchAnimeFavourite,
        clearCache
      }}
    >
      {children}
    </WatchStatusContext.Provider>
  );
};

export const useWatchStatus = () => useContext(WatchStatusContext);
