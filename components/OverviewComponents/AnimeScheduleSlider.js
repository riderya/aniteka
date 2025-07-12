import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList } from 'react-native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

const Container = styled.View`
  margin-top: 25px;
`;

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  margin-right: 12px;
  width: 300px;
`;

const AnimeImage = styled.Image`
  width: 65px;
  height: 90px;
  border-radius: 8px;
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

const AnimeScheduleSlider = ({ navigation }) => {
  const [animeList, setAnimeList] = useState([]);

  // Функція для перевірки конкретної дати — 11 липня 2025 року
  const isSpecificDate = (timestamp, year, month, day) => {
    const date = new Date(timestamp * 1000);
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month && // getMonth() починається з 0
      date.getDate() === day
    );
  };

useEffect(() => {
  const fetchSchedule = async () => {
    try {
      const response = await axios.post(
        'https://api.hikka.io/schedule/anime?page=1&size=20',
        {
          status: ['ongoing', 'announced'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const filteredList = response.data.list
        .filter((item) => isSpecificDate(item.airing_at, 2025, 7, 11))
        .slice(6);

      setAnimeList(filteredList);
    } catch (error) {
      console.error('Помилка при завантаженні розкладу:', error);
    }
  };

  fetchSchedule();
}, []);


  const renderItem = ({ item }) => {
    const { anime, time_left, episode } = item;

    const totalHours = Math.floor(time_left / 3600);
    const remainingMinutes = Math.floor((time_left % 3600) / 60);
    const timeText = `${totalHours} год. ${remainingMinutes} хв.`;

    return (
      <Card>
        <AnimeImage source={{ uri: anime.image }} resizeMode="cover" />
        <InfoWrapper>
          <AnimeTitle numberOfLines={1}>
            {anime.title_ua || anime.title_en || anime.title_ja}
          </AnimeTitle>
          <TimeLeft>{timeText}</TimeLeft>
          <Episode>
            <Episode style={{ fontWeight: '700' }}>{episode}</Episode> епізод
          </Episode>
        </InfoWrapper>
      </Card>
    );
  };

  return (
    <Container>
      <RowLineHeader
        title="Календар"
        onPress={() => navigation.navigate('AnimeCharactersScreen')}
      />
      <FlatList
        data={animeList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 12 }}
      />
    </Container>
  );
};

export default AnimeScheduleSlider;
