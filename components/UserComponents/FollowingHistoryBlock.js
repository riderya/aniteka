import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import styled from 'styled-components/native';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

dayjs.extend(relativeTime);

const Container = styled.View`
  width: 100%;
  margin-top: 15px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px 0px;
  padding-bottom: -12px;
`;

const ItemContainer = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.card};
  margin: auto 12px;
  margin-bottom: 20px;
`;

const CoverImage = styled.Image`
  width: 60px;
  height: 80px;
  border-radius: 8px;
  background-color: #ccc;
`;

const InfoWrapper = styled.View`
  flex: 1;
  margin-left: 15px;
  justify-content: center;
`;

const AnimeTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
  margin-top: 4px;
`;

const Timestamp = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray};
  margin-top: 2px;
`;

const LoadingWrapper = styled.View`
  justify-content: center;
  align-items: center;
  padding: 20px 0;
`;

export default function FollowingHistoryBlock() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('hikka_token');
        if (!token) {
          Alert.alert('Помилка', 'Відсутній токен авторизації');
          setLoading(false);
          return;
        }

        const res = await fetch('https://api.hikka.io/history/following?page=1&size=5', {
            headers: { auth: token }
          });
          const json = await res.json();
          
          if (!res.ok) {
            throw new Error(json.message || 'Не вдалося завантажити історію підписок');
          }
          
          setHistory(json.list || []);
          

        if (!res.ok) {
          throw new Error(json.message || 'Не вдалося завантажити історію підписок');
        }

        setHistory(json.list || []);
      } catch (err) {
        Alert.alert('Помилка', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (timestamp) => {
    return dayjs.unix(timestamp).fromNow();
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <ActivityIndicator size="small" color="#888" />
      </LoadingWrapper>
    );
  }

  if (history.length === 0) {
    return (
      <Container>
        <RowLineHeader
       title='Історія підписок'
       onPress={() => navigation.navigate('AnimeCharactersScreen', { slug, title })}
       />
        <Subtitle>Немає даних для відображення</Subtitle>
      </Container>
    );
  }

  return (
    <Container>
      <RowLineHeader
       title='Історія підписок'
       onPress={() => navigation.navigate('AnimeCharactersScreen', { slug, title })}
       />

{history.slice(0, 3).map((item, index) => {
  const anime = item.content;
  const user = item.user;
  return (
    <ItemContainer key={`${item.reference}-${index}`}>
      <CoverImage source={{ uri: anime.image }} />
      <InfoWrapper>
        <AnimeTitle numberOfLines={1}>
          {anime.title_ua || anime.title_en || 'Без назви'}
        </AnimeTitle>
        <Subtitle>
          Додано в підписки користувачем{' '}
          <Text style={{ fontWeight: 'bold' }}>{user.username}</Text>
        </Subtitle>
        <Timestamp>{formatDate(item.updated || item.created)}</Timestamp>
      </InfoWrapper>
    </ItemContainer>
  );
})}

    </Container>
  );
}
