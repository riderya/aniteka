import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useWatchStatus } from '../../context/WatchStatusContext';

const LikeButtonWrapper = styled(TouchableOpacity)`
  position: absolute;
  top: ${({ top, safeAreaTop }) => (top || 0) + safeAreaTop}px;
  left: ${({ left }) => left || 'auto'};
  right: ${({ right }) => right || 12}px;
  bottom: ${({ bottom }) => bottom || 'auto'};
  z-index: 10;
  width: 45px;
  height: 45px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border-width: 1px;
  border-color: ${({ theme, liked }) => (liked === true ? theme.colors.favourite : theme.colors.border)};
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(Ionicons)`
  color: ${({ theme, liked }) => (liked === true ? theme.colors.favourite : theme.colors.gray)};
  font-size: 24px;
`;

const LikeAnimeButtonAbsolute = ({ slug, top, left, right, bottom }) => {
  const { top: safeAreaTop } = useSafeAreaInsets();
  const { theme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const {
    authToken,
    isAuthChecked,
    getAnimeFavourite,
    fetchAnimeFavourite,
    updateAnimeFavourite,
  } = useWatchStatus();

  const liked = getAnimeFavourite(slug);

  useEffect(() => {
    // Чекаємо доки перевіриться токен
    if (!isAuthChecked || !slug) return;

    // Якщо користувач не авторизований — показуємо кнопку без лоадера
    if (!authToken) {
      setIsLoading(false);
      setIsDataLoaded(true);
      return;
    }

    // Перевіряємо чи є дані в кеші
    const cachedFavourite = getAnimeFavourite(slug);
    if (cachedFavourite !== null) {
      setIsLoading(false);
      setIsDataLoaded(true);
      return;
    }

    // Якщо немає в кеші, завантажуємо
    setIsLoading(true);
    fetchAnimeFavourite(slug).finally(() => {
      setIsLoading(false);
      setIsDataLoaded(true);
    });
  }, [authToken, slug, isAuthChecked, getAnimeFavourite, fetchAnimeFavourite]);

  const toggleFavourite = async () => {
    if (!authToken) {
      Toast.show({
        type: 'info',
        text1: 'Авторизуйтеся, будь ласка',
        text2: 'Щоб додавати аніме у улюблене, потрібно увійти в акаунт.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    if (isUpdating) return;
    
    setIsUpdating(true);
  
    try {
      const endpoint = `https://api.hikka.io/favourite/anime/${slug}`;
      
      if (liked === true) {
        await fetch(endpoint, {
          method: 'DELETE',
          headers: { auth: authToken },
        });
        updateAnimeFavourite(slug, false);
        Toast.show({
          type: 'success',
          text1: '💔 Видалено з улюблене',
          position: 'bottom',
        });
      } else {
        await fetch(endpoint, {
          method: 'PUT',
          headers: { auth: authToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        updateAnimeFavourite(slug, true);
        Toast.show({
          type: 'success',
          text1: '❤️ Додано в улюблене',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося змінити вподобання',
        position: 'bottom',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Показуємо лоадер поки дані завантажуються
  if (isLoading) {
    return (
      <LikeButtonWrapper 
        top={top}
        left={left}
        right={right}
        bottom={bottom}
        safeAreaTop={safeAreaTop}
        liked={false}
        disabled={true}
      >
        <ActivityIndicator size="small" color={theme.colors.textSecondary || '#fff'} />
      </LikeButtonWrapper>
    );
  }

  // Показуємо кнопку тільки після завантаження даних
  return (
    <LikeButtonWrapper 
      onPress={isUpdating ? null : toggleFavourite}
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      safeAreaTop={safeAreaTop}
      liked={liked}
      disabled={isUpdating}
    >
      {isUpdating ? (
        <ActivityIndicator size="small" color={theme.colors.textSecondary || '#fff'} />
      ) : (
        <StyledIcon 
          name={liked === true ? 'heart' : 'heart-outline'} 
          liked={liked}
        />
      )}
    </LikeButtonWrapper>
  );
};

export default LikeAnimeButtonAbsolute;
