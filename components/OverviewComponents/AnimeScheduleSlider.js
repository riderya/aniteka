import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, Text, TouchableOpacity  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

const Container = styled.View`
  margin-top: 25px;
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

const AnimeScheduleSlider = () => {
  const navigation = useNavigation();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);


  const isToday = (timestamp) => {
    const airingDate = new Date(timestamp * 1000);
    const now = new Date();
    return (
      airingDate.getUTCFullYear() === now.getUTCFullYear() &&
      airingDate.getUTCMonth() === now.getUTCMonth() &&
      airingDate.getUTCDate() === now.getUTCDate()
    );
  };

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
  }, []);

const renderItem = ({ item }) => {
  const { anime, time_left, episode } = item;

  const totalHours = Math.floor(time_left / 3600);
  const remainingMinutes = Math.floor((time_left % 3600) / 60);
  const timeText = `${totalHours} год. ${remainingMinutes} хв.`;

  const handlePress = () => {
    navigation.navigate('AnimeDetails', { slug: anime.slug });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
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
};

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
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 12 }}
        />
      )}
    </Container>
  );
};

export default AnimeScheduleSlider;
