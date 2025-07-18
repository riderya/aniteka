import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import AnimeColumnCard from '../Cards/AnimeColumnCard';
import { FlatList, useWindowDimensions } from 'react-native';

const Container = styled.View`
  flex: 1;
`;

const LoadingIndicator = styled.ActivityIndicator`
  margin-top: 20px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 150px;
`;

const EmptyImage = styled.Image`
  width: 150px;
  height: 150px;
  margin-bottom: 0px;
`;

const EmptyText = styled.Text`
  color: #aaa;
  font-size: 16px;
  text-align: center;
`;

const CardWrapper = styled.View`
  align-items: center;
  margin-bottom: 25px;
`;

export default function AnimeResults({ animeList, loadingAnime, onEndReached }) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const cardWidth = 115;
  const spacing = 12;
  const numColumns = Math.floor(width / (cardWidth + spacing));

  if (loadingAnime && animeList.length === 0) {
    return <LoadingIndicator size="large" color="#6c47ff" />;
  }

  if (!loadingAnime && animeList.length === 0) {
    return (
      <EmptyContainer>
        <EmptyImage source={require('../../assets/image/noSearchImage.png')} resizeMode="contain" />
        <EmptyText>На жаль, аніме не знайдено</EmptyText>
      </EmptyContainer>
    );
  }

  const renderItem = ({ item }) => {
    return (
      <CardWrapper style={{ width: cardWidth }}>
        <AnimeColumnCard
          anime={item}
          onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
          cardWidth={cardWidth}
          imageWidth={cardWidth}
          imageHeight={165}
        />
      </CardWrapper>
    );
  };

  return (
    <Container>
      <FlatList
        data={animeList}
        renderItem={renderItem}
        keyExtractor={(item) => item.slug}
        numColumns={numColumns}
        contentContainerStyle={{ paddingTop: 115, paddingHorizontal: 6 }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 6,
        }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingAnime ? <LoadingIndicator size="small" color="#6c47ff" /> : null}
      />
    </Container>
  );
}
