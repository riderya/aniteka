import React, { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'

const TouchableOpacityStyled = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme, liked }) => (liked ? theme.colors.favourite : theme.colors.border)};
  height: 45px;
  padding: 0px 16px;
  border-radius: 999px;
  gap: 8px;
`

const LikeAnimeButton = ({ slug }) => {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authToken, setAuthToken] = useState(null)

  const theme = useTheme()
  const contentType = 'anime'
  const endpoint = `https://api.hikka.io/favourite/${contentType}/${slug}`

  useEffect(() => {
    const loadTokenAndCheckStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('hikka_token')
        if (!token) throw new Error('Auth token not found')

        setAuthToken(token)

        const res = await axios.get(endpoint, {
          headers: { auth: token },
          withCredentials: true,
        })

        if (res?.data?.reference) {
          setLiked(true)
        }
      } catch (err) {
        setLiked(false)
      } finally {
        setLoading(false)
      }
    }

    loadTokenAndCheckStatus()
  }, [slug])

  const toggleFavourite = async () => {
    if (!authToken) {
      Toast.show({
        type: 'info',
        text1: 'Авторизуйтеся, будь ласка',
        text2: 'Щоб додавати аніме у улюблене, потрібно увійти в акаунт.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }
    
  
    try {
      if (liked) {
        await axios.delete(endpoint, {
          headers: { auth: authToken },
          withCredentials: true,
        });
        setLiked(false);
        Toast.show({
          type: 'error',
          text1: '💔 Видалено з улюблене',
          position: 'top',
        });
      } else {
        await axios.put(
          endpoint,
          {},
          {
            headers: { auth: authToken },
            withCredentials: true,
          }
        );
        setLiked(true);
        Toast.show({
          type: 'success',
          text1: '❤️ Додано в улюблене',
          position: 'top',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося змінити вподобання',
        position: 'top',
      });
    }
  };
  
  
  

  if (loading) {
    return <ActivityIndicator size="small" color={theme.colors.textSecondary || '#fff'} />
  }

  return (
    <TouchableOpacityStyled onPress={toggleFavourite} liked={liked}>
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={20}
        color={liked ? theme.colors.favourite : theme.colors.gray}
      />
    </TouchableOpacityStyled>
  )
}

export default LikeAnimeButton
