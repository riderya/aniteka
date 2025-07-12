import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

dayjs.extend(relativeTime);
dayjs.locale('uk');

/* ================= styled ================= */
const Container = styled.View`
  width: 100%;
  margin-top: 15px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px 0px;
  padding-bottom: -12px;
`;

const Card = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.card};
  margin: auto 12px;
  margin-bottom: 20px;
`;

const Poster = styled.Image`
  width: 60px;
  height: 80px;
  border-radius: 8px;
  background-color: #ccc;
`;

const Info = styled.View`
  flex: 1;
  margin-left: 15px;
  flex-direction: column;
  justify-content: space-around;
`;

const AnimeTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
`;

const DateText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
`;

const LoadingWrapper = styled.View`
  justify-content: center;
  align-items: center;
`;

export default function AnimeHistoryBlock({ username }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('hikka_token');
      if (!token || !username) return;

      try {
        const res = await fetch(
          `https://api.hikka.io/history/user/${username}?page=1&size=5`,
          {
            headers: { auth: token },
          }
        );

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Не вдалося завантажити історію');
        }

        setHistory(json.list || []);
      } catch (err) {
        Alert.alert('Помилка', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  const formatAction = (item) => {
    const { history_type, data } = item;
    const ep = data?.watched_episodes;
    const list = data?.list_status;

    switch (history_type) {
      case 'watch':
        return ep ? `Переглянуто ${ep} епізод` : 'Дивлюсь';
      case 'list':
        return list ? `Змінено на список ${mapListStatus(list)}` : 'Змінено список';
      default:
        return 'Активність';
    }
  };

  const mapListStatus = (key) => {
    switch (key) {
      case 'planned':
        return 'Заплановане';
      case 'watching':
        return 'Дивлюсь';
      case 'completed':
        return 'Переглянуте';
      case 'on_hold':
        return 'В очікуванні';
      case 'dropped':
        return 'Закинуто';
      default:
        return key;
    }
  };

  const formatDate = (timestamp) => {
    return dayjs.unix(timestamp).fromNow();
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </LoadingWrapper>
    );
  }

  if (history.length === 0) return null;

  return (
    <Container>
      <RowLineHeader
       title='Історія'
       onPress={() => navigation.navigate('AnimeCharactersScreen', { slug, title })}
       />
      {history.slice(0, 3).map((item, index) => {
        const anime = item.content;
        return (
          <Card key={item.reference + index}>
            <Poster source={{ uri: anime.image }} />
            <Info>
              <AnimeTitle>{anime.title_ua || anime.title_en}</AnimeTitle>
              <ActionText>{formatAction(item)}</ActionText>
              <DateText>{formatDate(item.updated || item.created)}</DateText>
            </Info>
          </Card>
        );
      })}
    </Container>
  );
}
