import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable, Alert } from 'react-native';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useWatchStatus } from '../../context/WatchStatusContext';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // не використовується

const statusApi = {
  Дивлюсь: 'watching',
  'В планах': 'planned',
  Переглянуто: 'completed',
  Відкладено: 'on_hold',
  Закинуто: 'dropped',
  'Не дивлюсь': null,
};

const STAR_SIZE = 32;
const STAR_GAP = 4;
const STAR_COLOR_ACTIVE = '#FFD700';
const STAR_COLOR_INACTIVE = '#666';

const AnimeRating = ({ slug }) => {
  const { status, setStatus, score, setScore } = useWatchStatus();
  const [auth, setAuth] = useState(null);
  const [loading, setLoad] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Отримання токена
  useEffect(() => {
    SecureStore.getItemAsync('hikka_token').then(setAuth);
  }, []);

  // Завантаження статусу аніме і рейтингу
  useEffect(() => {
    if (!auth) return;

    (async () => {
      try {
        const { data } = await axios.get(`https://api.hikka.io/watch/${slug}`, { headers: { auth } });
        const ui = Object.keys(statusApi).find((k) => statusApi[k] === data.status) || 'Не дивлюсь';
        setStatus(ui);
        setScore(data.score);
      } catch (e) {
        if (e.response?.status === 404) {
          setStatus('Не дивлюсь');
          setScore(0);
        } else console.error(e);
      } finally {
        setLoad(false);
      }
    })();
  }, [auth, slug]);

  // Завантаження профілю користувача (аватарка)
  useEffect(() => {
    if (!auth) return;

    (async () => {
      try {
        const { data } = await axios.get('https://api.hikka.io/user/me', { headers: { auth } });
        if (data.avatar && data.avatar !== 'string') {
          setAvatarUrl(data.avatar);
        }
      } catch (e) {
        console.error('Failed to load user profile', e);
      }
    })();
  }, [auth]);

  const sendScore = async (newScore) => {
    if (!auth) return;
    try {
      await axios.put(
        `https://api.hikka.io/watch/${slug}`,
        { status: statusApi[status], score: newScore, episodes: 0, rewatches: 0, note: null },
        { headers: { auth } }
      );
    } catch (e) {
      console.error('Update score error', e);
    }
  };

  const onPress = async (starIdx, half) => {
    const newScore = half ? starIdx * 2 - 1 : starIdx * 2;
    setScore(newScore);
    await sendScore(newScore);
  };

  const onDelete = async () => {
    if (!auth) return;

    Alert.alert(
      'Підтвердіть',
      'Ви дійсно хочете видалити оцінку?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const response = await axios.delete(`https://api.hikka.io/watch/${slug}`, {
                headers: { auth },
              });
              if (response.status === 200 && response.data.success) {
                setScore(0);
              } else {
                Alert.alert('Помилка', 'Не вдалося видалити оцінку');
              }
            } catch (e) {
              console.error('Delete error', e);
              Alert.alert('Помилка', 'Не вдалося видалити оцінку');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const stars = Array.from({ length: 5 }, (_, i) => {
    const idx = i + 1;
    const fullVal = idx * 2;
    const halfVal = fullVal - 1;

    let icon;
    if (score >= fullVal) {
      icon = <FontAwesome name="star" size={STAR_SIZE} color={STAR_COLOR_ACTIVE} />;
    } else if (score === halfVal) {
      icon = <FontAwesome name="star-half-full" size={STAR_SIZE} color={STAR_COLOR_ACTIVE} />;
    } else {
      icon = <FontAwesome name="star-o" size={STAR_SIZE} color={STAR_COLOR_INACTIVE} />;
    }

    return (
      <View
        key={idx}
        style={{
          width: STAR_SIZE,
          height: STAR_SIZE,
          marginRight: i === 4 ? 0 : STAR_GAP,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pointerEvents="box-none"
      >
        {icon}

        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Pressable style={{ flex: 1 }} onPress={() => onPress(idx, true)} android_disableSound hitSlop={5} />
            <Pressable style={{ flex: 1 }} onPress={() => onPress(idx, false)} android_disableSound hitSlop={5} />
          </View>
        </View>
      </View>
    );
  });

  if (loading || !auth) return null;
  if (!status || status === 'Не дивлюсь') return null;

  return (
    <Block>
      <Row>
        <Avatar source={avatarUrl ? { uri: avatarUrl } : require('../../assets/image/welcome-login.webp')} />
        <Stars>{stars}</Stars>

        {score > 0 && (
          <DeleteButton onPress={onDelete} disabled={deleting}>
            <RowDelete>
              <DeleteButtonText>{deleting ? 'Видаляємо...' : 'Видалити'}</DeleteButtonText>
            </RowDelete>
          </DeleteButton>
        )}
      </Row>
    </Block>
  );
};

export default AnimeRating;

/* styled-components */
const Block = styled.View`
  flex-direction: column;
  align-items: center;
  padding: 12px;
  margin-top: 20px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  margin-right: 12px;
  background-color: aqua;
`;

const Stars = styled.View`
  flex-direction: row;
  margin-right: 12px;
`;

const DeleteButton = styled.Pressable`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 10px 16px;
  border-radius: 999px;
  align-items: center;
`;

const RowDelete = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const DeleteButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  font-size: 16px;
`;
