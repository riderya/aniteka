import { useTheme } from '../context/ThemeContext';
import { useOrientation, useDimensions } from './useOrientation';
import { useState, useEffect } from 'react';

// Custom hook to suppress styled-components warnings
export const useSuppressWarnings = () => {
  const { theme } = useTheme();
  return theme;
};

// Export orientation hooks
export { useOrientation, useDimensions }; 

// Хук для оптимізованого завантаження даних користувача
export const useOptimizedUserData = (slug, authToken, isAuthChecked) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthChecked || !authToken || !slug) {
      setIsLoading(false);
      return;
    }

    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Завантажуємо статус та вподобане паралельно
        const [statusRes, favouriteRes] = await Promise.allSettled([
          fetch(`https://api.hikka.io/watch/${slug}`, {
            headers: { auth: authToken },
          }),
          fetch(`https://api.hikka.io/favourite/anime/${slug}`, {
            headers: { auth: authToken },
          })
        ]);

        // Обробляємо результати
        const results = {
          status: null,
          favourite: false,
          episodes: null,
          duration: null
        };

        if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
          const statusData = await statusRes.value.json();
          results.status = statusData.status;
          results.episodes = statusData.episodes;
          results.duration = statusData.duration;
        }

        if (favouriteRes.status === 'fulfilled' && favouriteRes.value.ok) {
          const favouriteData = await favouriteRes.value.json();
          results.favourite = !!favouriteData.reference;
        }

        return results;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [slug, authToken, isAuthChecked]);

  return { isLoading, error };
}; 