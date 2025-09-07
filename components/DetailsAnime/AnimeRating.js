import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useWatchStatus } from '../../context/WatchStatusContext';
import { useTheme } from '../../context/ThemeContext';
import ModernAlert from '../Custom/ModernAlert';
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
  const { theme } = useTheme();
  const [auth, setAuth] = useState(null);
  const [loading, setLoad] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        } else {}
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
      
    }
  };

  const onPress = async (starIdx, half) => {
    const newScore = half ? starIdx * 2 - 1 : starIdx * 2;
    setScore(newScore);
    await sendScore(newScore);
  };

  const onDelete = async () => {
    if (!auth) return;
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      const response = await axios.delete(`https://api.hikka.io/watch/${slug}`, {
        headers: { auth },
      });
      if (response.status === 200 && response.data.success) {
        setScore(0);
      } else {
        setErrorMessage('Не вдалося видалити оцінку');
        setShowErrorAlert(true);
      }
    } catch (e) {
      setErrorMessage('Не вдалося видалити оцінку');
      setShowErrorAlert(true);
    } finally {
      setDeleting(false);
    }
  };

  const createStars = (isFullScreen = false) => Array.from({ length: 5 }, (_, i) => {
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
          marginRight: isFullScreen ? 0 : (i === 4 ? 0 : STAR_GAP),
          alignItems: 'center',
          justifyContent: 'center',
          flex: isFullScreen ? 1 : 0,
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

  const stars = createStars(false);
  const fullScreenStars = createStars(true);

  if (loading || !auth) return null;
  if (!status || status === 'Не дивлюсь') return null;

  // Якщо оцінка не поставлена, розширюємо на весь екран
  if (score === 0) {
    return (
      <FullScreenBlock>
        <FullScreenRow>
          <FullScreenAvatar source={avatarUrl ? { uri: avatarUrl } : require('../../assets/image/welcome-login.webp')} />
          <FullScreenStars>{fullScreenStars}</FullScreenStars>
        </FullScreenRow>
      </FullScreenBlock>
    );
  }

  return (
    <>
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

      {/* Сучасний алерт для підтвердження видалення */}
      <ModernAlert
        visible={showDeleteAlert}
        title="Підтвердіть"
        message="Ви дійсно хочете видалити оцінку?"
        theme={theme}
        buttons={[
          { text: 'Скасувати', style: 'cancel' },
          { text: 'Видалити', style: 'destructive', onPress: handleDeleteConfirm },
        ]}
        onClose={() => setShowDeleteAlert(false)}
      />

      {/* Сучасний алерт для помилок */}
      <ModernAlert
        visible={showErrorAlert}
        title="Помилка"
        message={errorMessage}
        theme={theme}
        buttons={[
          { text: 'OK', style: 'default' },
        ]}
        onClose={() => setShowErrorAlert(false)}
      />
    </>
  );
};

export default AnimeRating;

/* styled-components */
const Block = styled.View`
  flex-direction: column;
  align-items: center;
  padding: 12px 0px;
  margin-top: 20px;
`;

const FullScreenBlock = styled.View`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0px;
  margin-top: 20px;
  width: 100%;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const FullScreenRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  margin-right: 12px;
  background-color: aqua;
`;

const FullScreenAvatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background-color: aqua;
`;

const Stars = styled.View`
  flex-direction: row;
  margin-right: 12px;
`;

const FullScreenStars = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  margin-left: 20px;
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
