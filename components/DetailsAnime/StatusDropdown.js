import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';
import { useWatchStatus } from '../../context/WatchStatusContext';
import Toast from 'react-native-toast-message';

const statuses = [
  'Не дивлюсь',
  'Дивлюсь',
  'В планах',
  'Переглянуто',
  'Відкладено',
  'Закинуто',
];

const statusApiMapping = {
  'Не дивлюсь': null,
  Дивлюсь: 'watching',
  'В планах': 'planned',
  Переглянуто: 'completed',
  Відкладено: 'on_hold',
  Закинуто: 'dropped',
};

const StatusDropdown = ({ slug, episodes_total }) => {
  const { theme } = useTheme();
  const {
    status: selectedStatus,
    setStatus: setSelectedStatus,
    score,
    episodes,
    setEpisodes,
    updateAnimeStatus,
  } = useWatchStatus();

  const [modalVisible, setModalVisible] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusColors = {
    Дивлюсь: theme.colors.watching,
    'В планах': theme.colors.planned,
    Переглянуто: theme.colors.completed,
    Відкладено: theme.colors.on_hold,
    Закинуто: theme.colors.dropped,
    'Не дивлюсь': theme.colors.gray,
  };

  const statusBorderColors = {
    Дивлюсь: theme.colors.watching,
    'В планах': theme.colors.planned,
    Переглянуто: theme.colors.completed,
    Відкладено: theme.colors.on_hold,
    Закинуто: theme.colors.dropped,
    'Не дивлюсь': theme.colors.borderInput,
  };

  useEffect(() => {
    SecureStore.getItemAsync('hikka_token').then((token) => {
      setAuthToken(token);
      setTokenChecked(true);
    });
  }, []);

  useEffect(() => {
    // При зміні аніме скидаємо епізоди та статус, показуємо спінер до завершення перевірки токена/фетчу
    setEpisodes(null);
    setSelectedStatus('Не дивлюсь');
    setIsLoading(true);
  }, [slug]);

  useEffect(() => {
    // Чекаємо доки перевіриться токен. Поки не перевірено — лишаємо спінер.
    if (!tokenChecked || !slug) return;

    // Якщо користувач не авторизований — фіксуємо стан "Не дивлюсь" і вимикаємо спінер
    if (!authToken) {
      setSelectedStatus('Не дивлюсь');
      updateAnimeStatus(slug, null);
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
          headers: { auth: authToken },
        });

        if (res.status === 404) {
          setSelectedStatus('Не дивлюсь');
          updateAnimeStatus(slug, null);
          return;
        }

        const data = await res.json();
        const uiStatus =
          Object.keys(statusApiMapping).find(
            (k) => statusApiMapping[k] === data.status,
          ) || 'Не дивлюсь';

        setSelectedStatus(uiStatus);
        // Зберігаємо статус у глобальному стані
        updateAnimeStatus(slug, data.status);
      } catch {
        setSelectedStatus('Не дивлюсь');
        updateAnimeStatus(slug, null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [authToken, slug, tokenChecked]);

  const showLoginToast = () => {
    Toast.show({
      type: 'info',
      position: 'bottom',
      text1: 'Авторизуйтеся, будь ласка',
      text2: 'Щоб змінювати статус перегляду, будь ласка, увійдіть у свій акаунт.',
      visibilityTime: 4000,
      autoHide: true,
    });
  };

  const updateStatus = async (newStatus) => {
    if (isUpdating) return;
    if (!authToken) {
      showLoginToast();
      return;
    }

    setIsUpdating(true);

    // Підготуємо значення епізодів, щоб не втратити прогрес
    let episodesToSet = episodes;

    // 1) Якщо обираємо "Переглянуто" — виставляємо повну кількість
    if (newStatus === 'Переглянуто') {
      if (episodes_total && episodes_total > 0) {
        episodesToSet = episodes_total;
        setEpisodes(episodes_total);
      } else {
        episodesToSet = 0;
        setEpisodes(0);
      }
    } else if (newStatus !== 'Не дивлюсь') {
      // 2) Для інших статусів — якщо прогрес ще не завантажено, підвантажимо його перед оновленням статусу
      if (episodesToSet === null || episodesToSet === undefined) {
        try {
          const currentRes = await fetch(`https://api.hikka.io/watch/${slug}`, {
            headers: { auth: authToken },
          });
          if (currentRes.ok) {
            const currentData = await currentRes.json();
            if (currentData && currentData.episodes !== null && currentData.episodes !== undefined) {
              episodesToSet = currentData.episodes;
              setEpisodes(currentData.episodes);
            }
          }
        } catch (_) {
          // мовчки ігноруємо, якщо не вдалось дістати поточний прогрес — просто не будемо передавати episodes
        }
      }
    }

    const bodyData =
      newStatus !== 'Не дивлюсь'
        ? {
            status: statusApiMapping[newStatus],
            score,
            rewatches: 0,
            note: null,
            ...(episodesToSet !== null && episodesToSet !== undefined ? { episodes: episodesToSet } : {}),
          }
        : null;

    try {
      const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
        method: newStatus === 'Не дивлюсь' ? 'DELETE' : 'PUT',
        headers: { auth: authToken, 'Content-Type': 'application/json' },
        body: bodyData ? JSON.stringify(bodyData) : undefined,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Помилка при оновленні');
      }

      if (newStatus === 'Не дивлюсь') {
        setEpisodes(null);
      }

      setSelectedStatus(newStatus);
      updateAnimeStatus(slug, newStatus === 'Не дивлюсь' ? null : statusApiMapping[newStatus]);
      setModalVisible(false);

      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Статус оновлено',
        text2: `Встановлено статус: "${newStatus}"`,
        visibilityTime: 3000,
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Помилка',
        text2: e.message || 'Не вдалося оновити статус.',
        visibilityTime: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onOpenModal = () => {
    if (isLoading || isUpdating) return;
    if (!authToken) {
      showLoginToast();
      return;
    }
    setModalVisible(true);
  };

  return (
    <Wrapper>
      <Button
        onPress={onOpenModal}
        disabled={isLoading || isUpdating}
        borderColor={isLoading ? statusBorderColors['Не дивлюсь'] : statusBorderColors[selectedStatus]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={statusColors['Не дивлюсь']} />
        ) : (
          <>
            <Ionicons
              name="chevron-down-outline"
              size={16}
              color={statusColors[selectedStatus]}
            />
            <ButtonText color={statusColors[selectedStatus]}>{selectedStatus}</ButtonText>
          </>
        )}
      </Button>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Overlay>
          <TouchableOpacity style={{ flex: 1, width: '100%' }} onPress={() => setModalVisible(false)} />
          <Content background={theme.colors.card}>
            {statuses.map((st) => (
                             <Item key={st} disabled={isUpdating} onPress={() => updateStatus(st)}>
                 <Indicator borderColor={statusBorderColors[st]}>
                   {selectedStatus === st && <Filled color={statusColors[st]} />}
                 </Indicator>
                 <ItemText color={statusColors[st]}>{st}</ItemText>
               </Item>
            ))}
            <Close onPress={() => setModalVisible(false)} bg={theme.colors.inputBackground}>
              <CloseText color={theme.colors.gray}>Закрити</CloseText>
            </Close>
          </Content>
          <TouchableOpacity style={{ flex: 1, width: '100%' }} onPress={() => setModalVisible(false)} />
        </Overlay>
      </Modal>
    </Wrapper>
  );
};

export default StatusDropdown;

// Styled Components (залишаються без змін)
const Wrapper = styled.View``;
const Button = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  height: 45px;
  padding: 0 20px;
  border-width: 1px;
  border-radius: 999px;
  border-color: ${({ borderColor }) => borderColor};
`;
const ButtonText = styled.Text`
  margin-left: 4px;
  font-weight: 600;
  color: ${({ color }) => color};
`;
const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;
const Content = styled.View`
  background-color: ${({ background }) => background};
  border-radius: 32px;
  padding: 20px;
  width: 90%;
`;
const Item = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px 0;
`;
const Indicator = styled.View`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border-width: 2px;
  border-color: ${({ borderColor }) => borderColor};
  margin-right: 12px;
  align-items: center;
  justify-content: center;
`;
const Filled = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ color }) => color};
`;
const ItemText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${({ color }) => color};
`;
const Close = styled.TouchableOpacity`
  width: 100%;
  height: 45px;
  margin-top: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${({ bg }) => bg};
  border-radius: 999px;
`;
const CloseText = styled.Text`
  font-weight: bold;
  color: ${({ color }) => color};
`;
