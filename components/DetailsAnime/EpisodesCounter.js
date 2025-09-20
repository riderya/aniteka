import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native';
import { useWatchStatus } from '../../context/WatchStatusContext';
import DetailedEpisodesModal from './DetailedEpisodesModal';
import { Ionicons } from '@expo/vector-icons';

const EpisodesCounter = ({ slug, episodes_total, animeTitle }) => {
  const { 
    status, 
    authToken,
    isAuthChecked,
    fetchAnimeStatus,
    getAnimeScore,
    getAnimeStatus
  } = useWatchStatus();

  // Локальний стан для episodes конкретного аніме
  const [episodes, setEpisodes] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  // Кеш для збереження даних між рендерами
  const [cachedData, setCachedData] = useState({});

  // Отримуємо статус з глобального стану
  const currentStatus = getAnimeStatus(slug);
  const statusMapping = {
    'watching': 'Дивлюсь',
    'planned': 'В планах',
    'completed': 'Переглянуто',
    'on_hold': 'Відкладено',
    'dropped': 'Закинуто',
  };
  const globalStatus = currentStatus ? statusMapping[currentStatus] || 'Не дивлюсь' : 'Не дивлюсь';

  const allowedStatuses = [
    'Дивлюсь',
    'В планах',
    'Переглянуто',
    'Відкладено',
    'Закинуто',
  ];

  // Очищаємо локальний стан episodes при зміні slug
  useEffect(() => {
    // Перевіряємо кеш для цього slug
    if (cachedData[slug]) {
      setEpisodes(cachedData[slug].episodes);
      setDuration(cachedData[slug].duration);
      setLoading(false);
    } else {
      setEpisodes(null);
      setDuration(null);
      setLoading(true);
    }
  }, [slug, cachedData]);

  useEffect(() => {
    if (!isAuthChecked || !authToken) return;

    if (!allowedStatuses.includes(globalStatus)) {
      // Не виконуємо запит і не обнуляємо episodes, просто ховаємо компонент
      setLoading(false);
      return;
    }

    // Якщо дані вже є в кеші, не виконуємо запит
    if (cachedData[slug]) {
      setLoading(false);
      return;
    }

    const fetchWatch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
          headers: { auth: authToken },
        });

        if (res.ok) {
          const data = await res.json();
          const episodesData = data.episodes !== null && data.episodes !== undefined ? data.episodes : null;
          const durationData = data.duration || null;
          
          setEpisodes(episodesData);
          setDuration(durationData);
          
          // Зберігаємо в кеш
          setCachedData(prev => ({
            ...prev,
            [slug]: {
              episodes: episodesData,
              duration: durationData
            }
          }));
        } else if (res.status === 404) {
          // Не скидаємо episodes (бо може це не існує в базі)
          setDuration(null);
          
          // Зберігаємо в кеш
          setCachedData(prev => ({
            ...prev,
            [slug]: {
              episodes: null,
              duration: null
            }
          }));
        }
      } catch (error) {
        console.error('Episodes fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatch();
  }, [authToken, globalStatus, slug, isAuthChecked, cachedData]);

  const statusApiMapping = {
    Дивлюсь: 'watching',
    'В планах': 'planned',
    Переглянуто: 'completed',
    Відкладено: 'on_hold',
    Закинуто: 'dropped',
    'Не дивлюсь': null,
  };

  const updateEpisodes = async (newEpisodes) => {
    setLoadingUpdate(true);
    try {
      // Отримуємо поточну оцінку з контексту
      const currentScore = getAnimeScore(slug);
      
      const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
        method: 'PUT',
        headers: { 
          auth: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          episodes: newEpisodes,
          rewatches: 0,
          score: currentScore, // Використовуємо поточну оцінку
          status: statusApiMapping[globalStatus],
          note: null,
        }),
      });

      if (res.ok) {
        setEpisodes(newEpisodes);
        
        // Оновлюємо кеш
        setCachedData(prev => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            episodes: newEpisodes
          }
        }));
        
        // Оновлюємо кеш статусу
        await fetchAnimeStatus(slug);
      }
    } catch (error) {
      console.error('Episodes update error:', error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleIncrement = () => {
    if (episodes_total && episodes >= episodes_total) return;
    if (episodes === null) return;
    const newCount = episodes + 1;
    updateEpisodes(newCount);
  };

  const handleDecrement = () => {
    if (episodes === 0 || episodes === null) return;
    const newCount = episodes - 1;
    updateEpisodes(newCount);
  };

  const handleDetailModalUpdate = (newEpisodes) => {
    setEpisodes(newEpisodes);
    
    // Оновлюємо кеш
    setCachedData(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        episodes: newEpisodes
      }
    }));
  };

  if (!authToken) return null;

  if (!allowedStatuses.includes(globalStatus)) {
    return null;
  }

  // Не показуємо компонент, якщо в аніме немає епізодів
  if (!episodes_total || episodes_total <= 0) {
    return null;
  }

  // Не показуємо компонент під час завантаження або коли episodes ще не завантажені
  if (loading || episodes === null) {
    return null;
  }

  const progressPercent = episodes_total && episodes_total > 0 ? Math.max(0, Math.min(100, (episodes / episodes_total) * 100)) : 0;

  return (
    <Container>
      <TitleRow>
        <Title>Епізоди</Title>
        <MoreButton onPress={() => setIsDetailModalVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#888888" />
        </MoreButton>
      </TitleRow>
      <EpisodesInfo>
        <Current>{episodes}</Current>
        <Separator>/</Separator>
        <Max>{episodes_total || '?'}</Max>
        <Label> епізодів</Label>
        {duration !== null && <Label> • Тривалість: {duration} хв.</Label>}
      </EpisodesInfo>

      <ProgressBar>
        <Progress style={{ width: `${progressPercent}%` }} />
      </ProgressBar>

      <ButtonsRow>
        <Btn
          onPress={handleIncrement}
          disabled={loadingUpdate || (episodes_total ? episodes >= episodes_total : false)}
        >
          <BtnText>{loadingUpdate ? 'Оновлення...' : '+ Додати епізод'}</BtnText>
        </Btn>

        <Btn onPress={handleDecrement} disabled={loadingUpdate || episodes === 0}>
          <BtnText>−</BtnText>
        </Btn>
      </ButtonsRow>

      <DetailedEpisodesModal
        isVisible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        slug={slug}
        episodes_total={episodes_total}
        currentEpisodes={episodes}
        currentStatus={globalStatus}
        animeTitle={animeTitle}
        onUpdate={handleDetailModalUpdate}
      />
    </Container>
  );
};

export default EpisodesCounter;

const Container = styled.View`
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  border-width: 1px;
  padding: 12px;
  border-radius: 16px;
  margin-top: 15px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const TitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MoreButton = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
`;

const EpisodesInfo = styled.View`
  flex-direction: row;
  align-items: baseline;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const Current = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: 20px;
`;

const Separator = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight: 700;
  font-size: 20px;
`;

const Max = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight: 700;
  font-size: 16px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  margin-left: 4px;
`;

const ProgressBar = styled.View`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 14px;
`;

const Progress = styled.View`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 999px;
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
`;

const Btn = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  flex: 1;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const BtnText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 14px;
`;

