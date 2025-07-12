import React, { useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { Dimensions, RefreshControl } from 'react-native';
import Header from '../components/Header/Header';
import HomeBannerSwiper from '../components/HomeBannerSwiper/HomeBannerSwiper';
import AnimeSlider from '../components/Sliders/AnimeSlider';

const { height: screenHeight } = Dimensions.get('window');

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BannerWrapper = styled.View`
  height: ${screenHeight * 0.8}px;
`;

const ColumnBlock = styled.View`
  margin-top: -100px;
  flex-direction: column;
  gap: 40px;
  padding-bottom: 110px;
`;

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshKey(Date.now());
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <>
      <Header />
      <Container
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <BannerWrapper>
          <HomeBannerSwiper key={`banner-${refreshKey}`} />
        </BannerWrapper>

        <ColumnBlock>
          <AnimeSlider
            key={`slider1-${refreshKey}`}
            api="https://api.hikka.io/anime?page=1&size=15"
            requestBody={{
              status: ['finished'],
              years: [2025, 2025],
              score: [8, 10],
              sort: ['score:desc', 'scored_by:desc'],
            }}
            titleLineText="Популярні"
            descriptionText="Актуальні аніме, які варто переглянути."
          />

          <AnimeSlider
            key={`slider2-${refreshKey}`}
            api="https://api.hikka.io/anime?page=1&size=15"
            requestBody={{
              status: ['ongoing'],
              media_type: ['tv'],
            }}
            titleLineText="Онґоінґи"
            descriptionText="Актуальні аніме, які варто переглянути."
          />

          <AnimeSlider
            key={`slider3-${refreshKey}`}
            api="https://api.hikka.io/anime?page=1&size=15"
            requestBody={{
              status: ['finished'],
              media_type: ['tv'],
            }}
            titleLineText="Завершені"
            descriptionText="Актуальні аніме, які варто переглянути."
          />

          <AnimeSlider
            key={`slider4-${refreshKey}`}
            api="https://api.hikka.io/anime?page=1&size=15"
            requestBody={{
              status: ['announced'],
              media_type: ['tv'],
            }}
            titleLineText="Анонси"
            descriptionText="Актуальні аніме, які варто переглянути."
          />
        </ColumnBlock>
      </Container>
    </>
  );
}
