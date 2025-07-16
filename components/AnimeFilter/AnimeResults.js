import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import AnimeColumnCard from '../Cards/AnimeColumnCard';
import { FlatList } from 'react-native';

const Container = styled.View`
  flex: 1;
`;

const LoadingIndicator = styled.ActivityIndicator`
  margin-top: 20px;
`;

const EmptyText = styled.Text`
  color: #fff;
  text-align: center;
  margin-top: 20px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 25px;
  padding: 0px 12px;
`;

const CardWrapper = styled.View``;


export default function AnimeResults({ animeList, loadingAnime, onEndReached }) {
  const navigation = useNavigation();

  if (loadingAnime && animeList.length === 0) {
    return <LoadingIndicator size="large" color="#6c47ff" />;
  }

  if (!loadingAnime && animeList.length === 0) {
    return <EmptyText>На жаль, аніме не знайдено</EmptyText>;
  }

  const renderRow = ({ item: group, index }) => (
    <Row key={index}>
      {group.map((item) => (
        <CardWrapper key={item.slug}>
          <AnimeColumnCard
            anime={item}
            onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
            cardWidth={115}
            imageWidth={115} 
            imageHeight={165}
          />
        </CardWrapper>
      ))}
    </Row>
  );

  const groupedData = [];
  for (let i = 0; i < animeList.length; i += 3) {
    groupedData.push(animeList.slice(i, i + 3));
  }

  return (
    <Container>
      <FlatList
        data={groupedData}
        renderItem={renderRow}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingAnime ? <LoadingIndicator size="small" color="#6c47ff" /> : null
        }
      />
    </Container>
  );
}
