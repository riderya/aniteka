import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components/native';
import { Dimensions, FlatList, ActivityIndicator, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header/Header';
import HomeBannerSwiper from '../components/HomeBannerSwiper/HomeBannerSwiper';
import AnimeSlider from '../components/Sliders/AnimeSlider';
import { useTheme } from '../context/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const Container = styled.View`
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
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshKey(Date.now());
      setRefreshing(false);
    }, 1500);
  }, []);

  // Дані для FlatList
  const renderData = [
    { id: 'banner', type: 'banner' },
    { id: 'popular', type: 'slider', key: `slider1-${refreshKey}`, sliderProps: {
      api: "https://api.hikka.io/anime?page=1&size=15",
      requestBody: {
        status: ['finished'],
        years: [2025, 2025],
        score: [8, 10],
        sort: ['score:desc', 'scored_by:desc'],
      },
      titleLineText: "Популярні",
      descriptionText: "Найкращі аніме з високим рейтингом та великою кількістю оцінок."
    }},
    { id: 'ongoing', type: 'slider', key: `slider2-${refreshKey}`, sliderProps: {
      api: "https://api.hikka.io/anime?page=1&size=15",
      requestBody: {
        status: ['ongoing'],
        media_type: ['tv'],
      },
      titleLineText: "Онґоінґи",
      descriptionText: "Аніме, які зараз виходять та оновлюються щотижня."
    }},
    { id: 'finished', type: 'slider', key: `slider3-${refreshKey}`, sliderProps: {
      api: "https://api.hikka.io/anime?page=1&size=15",
      requestBody: {
        status: ['finished'],
        media_type: ['tv'],
      },
      titleLineText: "Завершені",
      descriptionText: "Повністю завершені аніме, які можна дивитися від початку до кінця."
    }},
    { id: 'announced', type: 'slider', key: `slider4-${refreshKey}`, sliderProps: {
      api: "https://api.hikka.io/anime?page=1&size=15",
      requestBody: {
        status: ['announced'],
        media_type: ['tv'],
      },
      titleLineText: "Анонси",
      descriptionText: "Нові аніме, які скоро вийдуть та варто додати до списку очікування."
    }}
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'banner') {
      return (
        <BannerWrapper>
          <HomeBannerSwiper key={`banner-${refreshKey}`} />
        </BannerWrapper>
      );
    } else if (item.type === 'slider') {
      return (
        <View style={{ 
          marginTop: item.id === 'popular' ? -100 : 0, 
          paddingVertical: 24
        }}>
          <AnimeSlider key={item.key} {...item.sliderProps} />
        </View>
      );
    }
    return null;
  };

  const keyExtractor = (item) => item.id;

  return (
    <>
      <Header />

      <Container theme={theme}>
        <FlatList
          data={renderData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + 110
          }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={2}
        />
      </Container>
    </>
  );
}
