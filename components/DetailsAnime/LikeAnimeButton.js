import React, { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import styled from 'styled-components/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../context/ThemeContext'
import { useWatchStatus } from '../../context/WatchStatusContext'

const TouchableOpacityStyled = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme, liked }) => (liked === true ? theme.colors.favourite : theme.colors.border)};
  background-color: ${({ theme, liked }) => (liked === true ? `${theme.colors.favourite}20` : 'transparent')};
  height: 45px;
  padding: 0px 16px;
  border-radius: 999px;
  gap: 8px;
`

const LikeAnimeButton = ({ slug }) => {
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const { theme } = useTheme()
  const {
    getAnimeFavourite,
    fetchAnimeFavourite,
    updateAnimeFavourite,
    authToken,
    isAuthChecked,
  } = useWatchStatus()

  const liked = getAnimeFavourite(slug)

  useEffect(() => {
    // Чекаємо доки перевіриться токен
    if (!isAuthChecked || !slug) return;

    // Якщо користувач не авторизований — фіксуємо стан false і вимикаємо спінер
    if (!authToken) {
      setLoading(false);
      return;
    }

    const loadFavourite = async () => {
      setLoading(true);
      try {
        // Спочатку перевіряємо кеш
        const cachedFavourite = getAnimeFavourite(slug);
        if (cachedFavourite !== null) {
          setLoading(false);
          return;
        }

        // Якщо немає в кеші, завантажуємо
        await fetchAnimeFavourite(slug);
      } catch (error) {
        console.log('Error loading favourite status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavourite();
  }, [authToken, slug, isAuthChecked]); // Видаляємо функції з залежностей

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
          type: 'error',
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
  
  return (
    <TouchableOpacityStyled onPress={loading || isUpdating ? null : toggleFavourite} liked={liked} disabled={loading || isUpdating}>
      {loading || isUpdating ? (
        <ActivityIndicator size="small" color={theme.colors.textSecondary || '#fff'} />
      ) : (
        <Ionicons
          name={liked === true ? 'heart' : 'heart-outline'}
          size={20}
          color={liked === true ? theme.colors.favourite : theme.colors.gray}
        />
      )}
    </TouchableOpacityStyled>
  )
}

export default LikeAnimeButton
