import React from 'react';
import styled from 'styled-components/native';

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    paddingBottom: 20,
  },
}))``;

const AnimeItem = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
  background-color: #222;
  padding: 10px;
  border-radius: 8px;
`;

const AnimeImage = styled.Image`
  width: 110px;
  height: 150px;
  border-radius: 8px;
  margin-right: 10px;
`;

const Info = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
`;

const Rating = styled.Text`
  color: #bbb;
  margin-bottom: 4px;
`;

const Status = styled.Text`
  color: #bbb;
`;

const LoadingIndicator = styled.ActivityIndicator`
  margin-top: 20px;
`;

const EmptyText = styled.Text`
  color: #fff;
  text-align: center;
  margin-top: 20px;
`;

export default function AnimeResults({ animeList, loadingAnime }) {
  if (loadingAnime) {
    return <LoadingIndicator size="large" color="#6c47ff" />;
  }

  if (!animeList.length) {
    return <EmptyText>На жаль, аніме не знайдено</EmptyText>;
  }

  return (
    <Container>
      {animeList.map((item) => (
        <AnimeItem key={item.slug}>
          <AnimeImage source={{ uri: item.image_preview || item.image || '' }} resizeMode="cover" />
          <Info>
            <Title>{item.name_ru || item.name}</Title>
            <Rating>Рейтинг: {item.score || '—'}</Rating>
            <Status>Статус: {item.status || '—'}</Status>
          </Info>
        </AnimeItem>
      ))}
    </Container>
  );
}
