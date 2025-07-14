import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';

const screenWidth = Dimensions.get('window').width;
const cardSpacing = 12;
const cardsPerRow = 3;
const cardWidth = (screenWidth - cardSpacing * (cardsPerRow + 1)) / cardsPerRow;

const CompanyDetailScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();

  const [company, setCompany] = useState(null);
  const [animeList, setAnimeList] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const HEADER_HEIGHT = 60 + insets.top;

  // Завантажуємо компанію один раз
  const fetchCompany = async () => {
    try {
      const res = await fetch(`https://api.hikka.io/companies/${params.slug}`);
      const data = await res.json();
      setCompany(data);
    } catch (err) {
      console.error('Error loading company:', err);
    } finally {
      setLoadingCompany(false);
    }
  };

  // Завантажуємо аніме по сторінках
  const fetchAnimePage = async (pageToLoad) => {
    if (pageToLoad > totalPages) return; // Вже всі сторінки завантажені

    setLoadingMore(true);

    try {
      const res = await fetch(
        `https://api.hikka.io/companies/${params.slug}/anime?page=${pageToLoad}&size=20`
      );
      const data = await res.json();

      if (pageToLoad === 1) {
        setAnimeList(data.list || []);
      } else {
        setAnimeList((prev) => [...prev, ...(data.list || [])]);
      }

      setTotalPages(data.pagination?.pages || 1);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Error loading anime list:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (params?.slug) {
      fetchCompany();
      fetchAnimePage(1);
    }
  }, [params?.slug]);

  if (loadingCompany) {
    return (
      <CenteredContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </CenteredContainer>
    );
  }

  if (!company) {
    return (
      <CenteredContainer>
        <TextError>Студію не знайдено 😞</TextError>
      </CenteredContainer>
    );
  }

  // Завантаження наступної сторінки
  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchAnimePage(page + 1);
    }
  };

  // Рендер одного аніме тайлу
  const renderItem = ({ item }) => (
    <AnimeTile
      activeOpacity={0.7}
      onPress={() => navigation.navigate('AnimeDetails', { slug: item.anime.slug })}
      style={{ width: cardWidth, marginBottom: 12, marginRight: cardSpacing }}
    >
      <AnimeImage source={{ uri: item.anime.image }} />
      <AnimeTitle numberOfLines={1}>
        {item.anime.title_ua || item.anime.title_en || item.anime.title_ja}
      </AnimeTitle>
    </AnimeTile>
  );

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Студія: ${company.name}`} />
      </BlurOverlay>

      <FlatList
        data={animeList}
        keyExtractor={(item) => item.anime.slug}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: cardSpacing }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            <CompanyLogo source={{ uri: company.image }} />
            <CompanyName>{company.name}</CompanyName>
            <SectionTitle>Аніме від цієї студії:</SectionTitle>
          </>
        }
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: HEADER_HEIGHT,
          paddingBottom: 12 + insets.bottom,
        }}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : null
        }
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </Container>
  );
};

export default CompanyDetailScreen;

// ------------------------- styles -------------------------

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const CenteredContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CompanyLogo = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  align-self: center;
  margin-bottom: 12px;
`;

const CompanyName = styled.Text`
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 20px 0 12px 0;
`;

const AnimeTile = styled(TouchableOpacity)`
  overflow: hidden;
`;

const AnimeImage = styled.Image`
  width: 100%;
  height: ${cardWidth * 1.4}px;
  border-radius: 24px;
`;
const AnimeTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 8px;
`;

const TextError = styled.Text`
  font-size: 14px;
  padding: 12px;
  margin: 0px 12px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorHover};
`;
