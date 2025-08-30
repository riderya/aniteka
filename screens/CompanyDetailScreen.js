import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import AnimeColumnCard from '../components/Cards/AnimeColumnCard';
import OptimizedImage from '../components/Custom/OptimizedImage';

const screenWidth = Dimensions.get('window').width;
const cardMinWidth = 110;
const cardSpacing = 12;

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

  // Розрахунок кількості колонок по ширині екрану
  const numColumns = Math.floor(
    (screenWidth - cardSpacing) / (cardMinWidth + cardSpacing)
  );

  // Розрахунок реальної ширини картки, щоб рівно заповнити ширину екрану з відступами
  const cardWidth =
    (screenWidth - cardSpacing * (numColumns + 1)) / numColumns;

  // Завантажуємо компанію один раз
  const fetchCompany = async () => {
    try {
      const res = await fetch(`https://api.hikka.io/companies/${params.slug}`);
      const data = await res.json();
      setCompany(data);
    } catch (err) {
      
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

  // Рендер одного аніме через AnimeColumnCard з watch статусом
  const renderItem = ({ item, index }) => {
    const watchStatus = item.status || null;

    return (
      <CardWrapper
        style={{

          marginRight: (index + 1) % numColumns === 0 ? 0 : cardSpacing,
        }}
      >
        <AnimeColumnCard
          anime={item.anime}
          watchStatus={watchStatus}
          onPress={() => navigation.navigate('AnimeDetails', { slug: item.anime.slug })}
          cardWidth={cardWidth}
          imageWidth={cardWidth}
          imageHeight={165}
        />
      </CardWrapper>
    );
  };

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Студія: ${company.name}`} />
      </BlurOverlay>

      <FlatList
        key={`flatlist-${numColumns}`}
        data={animeList}
        keyExtractor={(item) => item.anime.slug}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            <CompanyLogoContainer>
              <OptimizedImage
                source={{ uri: company.image }}
                width={100}
                height={100}
                borderRadius={12}
                resizeMode="cover"
              />
            </CompanyLogoContainer>
            <CompanyName>{company.name}</CompanyName>
            <SectionTitle>Аніме від цієї студії:</SectionTitle>
          </>
        }
        contentContainerStyle={{
          paddingTop: insets.top + 56 + 20,
          paddingBottom: 20 + insets.bottom,
          paddingHorizontal: 12,
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

const CompanyLogoContainer = styled.View`
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

const CardWrapper = styled.View`
  padding-bottom: 25px;
`;

const TextError = styled.Text`
  font-size: 14px;
  padding: 12px;
  margin: 0px 12px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorHover};
`;
