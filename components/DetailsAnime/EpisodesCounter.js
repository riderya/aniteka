import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native';
import { useWatchStatus } from '../../context/WatchStatusContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate
} from 'react-native-reanimated';

const EpisodesCounter = ({ slug, episodes_total }) => {
  const { 
    status, 
    episodes, 
    setEpisodes,
    authToken,
    isAuthChecked,
    fetchAnimeStatus
  } = useWatchStatus();

  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const allowedStatuses = [
    'Дивлюсь',
    'В планах',
    'Переглянуто',
    'Відкладено',
    'Закинуто',
  ];

  // Очищаємо episodes при зміні slug, щоб не залишалося значення від попереднього аніме
  useEffect(() => {
    setEpisodes(null);
  }, [slug]);

  useEffect(() => {
    if (!isAuthChecked || !authToken) return;

    if (!allowedStatuses.includes(status)) {
      // Не виконуємо запит і не обнуляємо episodes, просто ховаємо компонент
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
          if (data.episodes !== null && data.episodes !== undefined) {
            setEpisodes(data.episodes);
          } else {
            setEpisodes(null);
          }
          setDuration(data.duration);
        } else if (res.status === 404) {
          // Не скидаємо episodes (бо може це не існує в базі)
          setDuration(null);
        }
      } catch (error) {
        console.error('Episodes fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatch();
  }, [authToken, status, slug, isAuthChecked]);

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
      const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
        method: 'PUT',
        headers: { 
          auth: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          episodes: newEpisodes,
          rewatches: 0,
          score: 0,
          status: statusApiMapping[status],
          note: null,
        }),
      });

      if (res.ok) {
        setEpisodes(newEpisodes);
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

  if (!authToken) return null;

  if (!allowedStatuses.includes(status)) {
    return null;
  }

  // Не показуємо компонент, якщо в аніме немає епізодів
  if (!episodes_total || episodes_total <= 0) {
    return null;
  }

  // Скелетон компонент
  const EpisodesSkeleton = () => {
    const shimmerValue = useSharedValue(0);

    useEffect(() => {
      shimmerValue.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmerValue.value,
        [0, 1],
        [-200, 200]
      );

      return {
        transform: [{ translateX }],
      };
    });

    return (
      <Container>
        <SkeletonTitle>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonTitle>
        
        <SkeletonEpisodesInfo>
          <SkeletonEpisodesText>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonEpisodesText>
        </SkeletonEpisodesInfo>

        <SkeletonProgressBar>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonProgressBar>

        <SkeletonButtonsRow>
          <SkeletonButton>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonButton>
          <SkeletonButtonSmall>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonButtonSmall>
        </SkeletonButtonsRow>
      </Container>
    );
  };

  if (loading && episodes === null) {
    return <EpisodesSkeleton />;
  }

  if (episodes === null) {
    return null;
  }

  const progressPercent = episodes_total && episodes_total > 0 ? Math.max(0, Math.min(100, (episodes / episodes_total) * 100)) : 0;

  return (
    <Container>
      <Title>Епізоди</Title>
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
  margin-bottom: 12px;
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

// Скелетон стилі
const ShimmerGradient = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const SkeletonTitle = styled.View`
  width: 80px;
  height: 22px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const SkeletonEpisodesInfo = styled.View`
  margin-bottom: 12px;
`;

const SkeletonEpisodesText = styled.View`
  width: 180px;
  height: 18px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonProgressBar = styled.View`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 8px;
  margin-bottom: 14px;
  overflow: hidden;
`;

const SkeletonButtonsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
`;

const SkeletonButton = styled.View`
  height: 46px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  flex: 1;
  overflow: hidden;
`;

const SkeletonButtonSmall = styled.View`
  width: 60px;
  height: 46px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  overflow: hidden;
`;
