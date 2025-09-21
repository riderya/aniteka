import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components/native';
import { Dimensions, FlatList, RefreshControl, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header/Header';
import HomeBannerSwiper from '../components/HomeBannerSwiper/HomeBannerSwiper';
import AnimeSlider from '../components/Sliders/AnimeSlider';
import { useTheme } from '../context/ThemeContext';
import { useOrientation, useDimensions } from '../hooks';
import { getResponsiveDimensions } from '../utils/orientationUtils';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  margin-bottom: -55px;
`;

// Функція для визначення поточного сезону
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // getMonth() повертає 0-11
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter'; // грудень, січень, лютий
};

// Функція для визначення поточного року
const getCurrentYear = () => {
  return new Date().getFullYear();
};

// Функція для визначення наступного сезону
const getNextSeason = () => {
  const currentSeason = getCurrentSeason();
  const seasonOrder = ['winter', 'spring', 'summer', 'fall'];
  const currentIndex = seasonOrder.indexOf(currentSeason);
  const nextIndex = (currentIndex + 1) % 4;
  return seasonOrder[nextIndex];
};

// Функція для визначення року наступного сезону
const getNextSeasonYear = () => {
  const currentSeason = getCurrentSeason();
  const currentYear = getCurrentYear();
  
  // Якщо поточний сезон winter, то наступний spring буде в тому ж році
  // Якщо поточний сезон fall, то наступний winter буде в наступному році
  if (currentSeason === 'fall') {
    return currentYear + 1;
  }
  return currentYear;
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const orientation = useOrientation();
  const dimensions = useDimensions();
  const responsiveDims = getResponsiveDimensions();
  const navigation = useNavigation();

  // Отримуємо поточні значення року та сезону
  const currentYear = getCurrentYear();
  const currentSeason = getCurrentSeason();
  const nextSeason = getNextSeason();
  const nextSeasonYear = getNextSeasonYear();

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
        years: [currentYear, currentYear],
        sort: ['score:desc', 'scored_by:desc'],
      },
      titleLineText: "Популярні",
      descriptionText: "Найкращі аніме з високим рейтингом та великою кількістю оцінок.",
      onPress: () => navigation.navigate('AnimeFilterScreen', {
        initialFilters: {
          years: [currentYear, currentYear],
          score: [8, 10],
          sort: ['score:desc', 'scored_by:desc'],
        }
      })
    }},
    { id: 'ongoing', type: 'slider', key: `slider2-${refreshKey}`, sliderProps: {
      api: "https://api.hikka.io/anime?page=1&size=15",
      requestBody: {
        status: ['ongoing'],
        media_type: ['tv'],
        years: [currentYear, currentYear],
        score: [7, 10],
      },
      titleLineText: "Онґоінґи",
      descriptionText: "Аніме, які зараз виходять та оновлюються щотижня.",
      onPress: () => navigation.navigate('AnimeFilterScreen', {
        initialFilters: {
          status: ['ongoing'],
          media_type: ['tv'],
          years: [currentYear, currentYear],
        }
      })
    }},
    { id: 'finished', type: 'slider', key: `slider3-${refreshKey}`, sliderProps: {
      api: "https://api.hikka.io/anime?page=1&size=15",
      requestBody: {
        status: ['finished'],
        media_type: ['tv'],
        years: [currentYear, currentYear],
      },
      titleLineText: "Завершені",
      descriptionText: "Повністю завершені аніме, які можна дивитися від початку до кінця.",
      onPress: () => navigation.navigate('AnimeFilterScreen', {
        initialFilters: {
          status: ['finished'],
          media_type: ['tv'],
          years: [currentYear, currentYear],
        }
      })
    }},
    { id: 'announced', type: 'slider', key: `slider4-${refreshKey}`, sliderProps: {
      api: "https://api.hikka.io/anime?page=1&size=15",
      requestBody: {
        status: ['announced'],
        media_type: ['tv'],
        season: [nextSeason],
        years: [nextSeasonYear, nextSeasonYear],
      },
      titleLineText: "Анонси",
      descriptionText: "Нові аніме, які скоро вийдуть та варто додати до списку очікування.",
      onPress: () => navigation.navigate('AnimeFilterScreen', {
        initialFilters: {
          status: ['announced'],
          media_type: ['tv'],
          season: [nextSeason],
          years: [nextSeasonYear, nextSeasonYear],
        }
      })
    }}
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'banner') {
      return (
          <HomeBannerSwiper key={`banner-${refreshKey}`} />
      );
    } else if (item.type === 'slider') {
      return (
        <View style={{ 
          transform: [{ translateY: -120 }],
          zIndex: 1,
          position: 'relative',
          flexDirection: 'column',
          marginBottom: 60
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
            paddingBottom: insets.bottom
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
