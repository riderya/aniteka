import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components/native';
import { Dimensions, FlatList, RefreshControl, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header/Header';
import HomeBannerSwiper from '../components/HomeBannerSwiper/HomeBannerSwiper';
import AnimeSlider from '../components/Sliders/AnimeSlider';
import { useTheme } from '../context/ThemeContext';
import { useOrientation, useDimensions } from '../hooks';
import { getResponsiveDimensions } from '../utils/orientationUtils';

const { height: screenHeight } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BannerWrapper = styled.View`
  height: ${({ orientation, dimensions }) => 
    orientation === 'landscape' 
      ? Math.min(dimensions.height * 0.6, 400) 
      : dimensions.height * 0.8}px;
`;

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const orientation = useOrientation();
  const dimensions = useDimensions();
  const responsiveDims = getResponsiveDimensions();

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
        <BannerWrapper orientation={orientation} dimensions={dimensions}>
          <HomeBannerSwiper key={`banner-${refreshKey}`} />
        </BannerWrapper>
      );
    } else if (item.type === 'slider') {
      return (
        <View style={{ 
          marginTop: item.id === 'popular' ? (orientation === 'landscape' ? -60 : -150) : 0, 
          paddingVertical: orientation === 'landscape' ? 16 : 24
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
              colors={[theme.colors.text]}
              tintColor={theme.colors.text}
              progressViewOffset={insets.top + (Platform.OS === 'ios' ? 70 : 50)}
              progressBackgroundColor={isDark ? theme.colors.card : undefined}
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
