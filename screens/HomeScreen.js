import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components/native';
import { Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header/Header';
import HomeBannerSwiper from '../components/HomeBannerSwiper/HomeBannerSwiper';
import AnimeSlider from '../components/Sliders/AnimeSlider';
import { useTheme } from '../context/ThemeContext';

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
  padding-bottom: ${props => props.bottomInset + 110}px;
`;

const RefreshOverlay = styled.View`
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 99999;
  align-items: center;
`;

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const isRefreshingRef = useRef(false); // щоб уникнути повторних запусків
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const PULL_THRESHOLD = 100; // поріг відступу для запуску оновлення (пікселів)

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    isRefreshingRef.current = true;

    setTimeout(() => {
      setRefreshKey(Date.now());
      setRefreshing(false);
      isRefreshingRef.current = false;
    }, 1500);
  }, []);

  // Обробник прокрутки
  const onScroll = useCallback((event) => {
    const yOffset = event.nativeEvent.contentOffset.y;

    // Якщо тягнуть вниз, і поріг перевищено, і оновлення ще не запущене
    if (yOffset < -PULL_THRESHOLD && !isRefreshingRef.current) {
      onRefresh();
    }
  }, [onRefresh]);

  return (
    <>
      <Header />

      <Container
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <BannerWrapper>
          <HomeBannerSwiper key={`banner-${refreshKey}`} />
        </BannerWrapper>

        <ColumnBlock bottomInset={insets.bottom + 20}>
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

      {refreshing && (
        <RefreshOverlay>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </RefreshOverlay>
      )}
    </>
  );
}
