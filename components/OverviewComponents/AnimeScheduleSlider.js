import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components/native';
import { FlatList, Text, TouchableOpacity  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

const Container = styled.View`
  margin-top: 0px;
`;

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  margin-right: 12px;
  width: 300px;
`;

const AnimeImage = styled.Image`
  width: 65px;
  height: 90px;
  border-radius: 16px;
`;

const InfoWrapper = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const AnimeTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const TimeLeft = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
  margin-top: 6px;
`;

const Episode = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: 6px;
`;

const AnimeScheduleSlider = React.memo(() => {
  const navigation = useNavigation();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  const isToday = useCallback((timestamp) => {
    const airingDate = new Date(timestamp * 1000);
    const now = new Date();
    return (
      airingDate.getUTCFullYear() === now.getUTCFullYear() &&
      airingDate.getUTCMonth() === now.getUTCMonth() &&
      airingDate.getUTCDate() === now.getUTCDate()
    );
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.post(
          'https://api.hikka.io/schedule/anime?page=1&size=50',
          {
            status: ['ongoing', 'announced'],
            airing_season: [],
            only_watch: false,
          }
        );

        const todayList = response.data.list.filter(item =>
          isToday(item.airing_at)
        );

        // Обмежуємо кількість карток до максимум 8
        const limitedList = todayList.slice(0, 8);

        setAnimeList(limitedList);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [isToday]);

  const formatTimeLeft = useCallback((time_left) => {
    const totalHours = Math.floor(time_left / 3600);
    const remainingMinutes = Math.floor((time_left % 3600) / 60);
    return `${totalHours} год. ${remainingMinutes} хв.`;
  }, []);

  const handlePress = useCallback((slug) => {
    navigation.navigate('AnimeDetails', { slug });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => {
    const { anime, time_left, episode } = item;
    const timeText = formatTimeLeft(time_left);

    return (
      <TouchableOpacity onPress={() => handlePress(anime.slug)}>
        <Card>
          <AnimeImage source={{ uri: anime.image }} resizeMode="cover" />
          <InfoWrapper>
            <AnimeTitle numberOfLines={1}>
              {anime.title_ua || anime.title_en || anime.title_ja || 'Без назви'}
            </AnimeTitle>
            <TimeLeft>{timeText}</TimeLeft>
            <Episode>
              <Episode style={{ fontWeight: '700' }}>{episode}</Episode> епізод
            </Episode>
          </InfoWrapper>
        </Card>
      </TouchableOpacity>
    );
  }, [formatTimeLeft, handlePress]);

  const keyExtractor = useCallback((item, index) => index.toString(), []);

  const getItemLayout = useCallback((data, index) => ({
    length: 312, // 300px ширина картки + 12px відступ
    offset: 312 * index,
    index,
  }), []);

  return (
    <Container>
      <RowLineHeader
        title="Календар"
        onPress={() => navigation.navigate('AnimeScheduleScreen')}
      />
      {loading ? (
        <Text style={{ color: 'gray', marginLeft: 12 }}>Завантаження...</Text>
      ) : animeList.length === 0 ? (
        <Text style={{ color: 'gray', marginLeft: 12 }}>
          На жаль, сьогодні немає аніме в розкладі 😢
        </Text>
      ) : (
        <FlatList
          data={animeList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 12 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={4}
          windowSize={8}
          initialNumToRender={3}
          getItemLayout={getItemLayout}
        />
      )}
    </Container>
  );
});

AnimeScheduleSlider.displayName = 'AnimeScheduleSlider';

export default AnimeScheduleSlider;
