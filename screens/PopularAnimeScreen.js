import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import AnimeRowCard from '../components/Cards/AnimeRowCard';
import { CONFIG } from '../utils/config';

const API_BASE = CONFIG.API.HIKKA_BASE_URL;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(PlatformBlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ContentContainer = styled.View`
  flex: 1;
  padding-top: 56px;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  padding: 12px;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const FilterButton = styled.TouchableOpacity`
  padding: 8px 16px;
  border-width: 1px;
  border-color: ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.border};
  border-radius: 20px;
  background-color: ${({ selected, theme }) => selected ? `${theme.colors.primary}20` : 'transparent'};
`;

const FilterButtonText = styled.Text`
  color: ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.text};
  font-weight: ${({ selected }) => selected ? '600' : '400'};
  font-size: 14px;
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
  margin-bottom: 20px;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
  text-align: center;
`;

const ErrorContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-size: 16px;
  text-align: center;
  margin-bottom: 20px;
`;

const RetryButton = styled.TouchableOpacity`
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
`;

const RetryButtonText = styled.Text`
  color: white;
  font-weight: 600;
`;

const PopularAnimeScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);
  
  // Фільтри для популярного аніме
  const [selectedFilter, setSelectedFilter] = useState('popular');
  const filters = [
    { key: 'popular', label: 'Популярне', sort: ['scored_by:desc', 'score:desc'] },
    { key: 'top_rated', label: 'Топ рейтинг', sort: ['score:desc', 'scored_by:desc'] },
    { key: 'recent', label: 'Недавні', sort: ['start_date:desc'] },
    { key: 'trending', label: 'В тренді', sort: ['scored_by:desc'] },
  ];

  // Завантаження токена
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('hikka_token');
        setAuthToken(token);
      } catch (e) {
        console.error('Помилка отримання токена:', e);
      } finally {
        setTokenReady(true);
      }
    };
    loadToken();
  }, []);

  // Функція для завантаження аніме
  const fetchAnime = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (!tokenReady) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(null);
      } else if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const currentFilter = filters.find(f => f.key === selectedFilter);
      const sortParams = currentFilter?.sort || ['scored_by:desc', 'score:desc'];

      const requestBody = {
        years: [null, null],
        include_multiseason: false,
        only_translated: false,
        score: [null, null],
        native_score: [null, null],
        media_type: [],
        rating: [],
        status: [],
        source: [],
        season: [],
        producers: [],
        studios: [],
        genres: [],
        query: null,
        sort: sortParams,
      };

      const headers = {};
      if (authToken) {
        headers.auth = authToken;
      }

      const response = await fetch(
        `${API_BASE}/anime?page=${pageNum}&size=20`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newAnimeList = data.list || [];

      if (isRefresh || pageNum === 1) {
        setAnimeList(newAnimeList);
      } else {
        setAnimeList(prev => [...prev, ...newAnimeList]);
      }

      setHasMore(newAnimeList.length >= 20);
      setPage(pageNum);
    } catch (err) {
      console.error('Помилка завантаження аніме:', err);
      setError('Не вдалося завантажити аніме. Спробуйте ще раз.');
      if (isRefresh || pageNum === 1) {
        setAnimeList([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [tokenReady, authToken, selectedFilter, filters]);

  // Завантаження при зміні фільтра
  useEffect(() => {
    if (tokenReady) {
      setPage(1);
      setHasMore(true);
      fetchAnime(1);
    }
  }, [selectedFilter, tokenReady, fetchAnime]);

  // Обробка оновлення
  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchAnime(1, true);
  }, [fetchAnime]);

  // Завантаження більше аніме
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchAnime(page + 1);
    }
  }, [loadingMore, hasMore, loading, page, fetchAnime]);

  // Повторна спроба при помилці
  const handleRetry = useCallback(() => {
    setError(null);
    setPage(1);
    setHasMore(true);
    fetchAnime(1);
  }, [fetchAnime]);

  // Рендер елемента списку
  const renderAnimeItem = useCallback(({ item }) => (
    <AnimeRowCard
      anime={item}
      imageWidth={95}
      imageHeight={125}
      marginBottom={20}
    />
  ), []);

  // Рендер футера для завантаження
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <ActivityIndicator 
        size="small" 
        color={theme.colors.primary} 
        style={{ marginVertical: 20 }}
      />
    );
  }, [loadingMore, theme.colors.primary]);

  // Рендер порожнього стану
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    
    if (error) {
      return (
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onPress={handleRetry}>
            <RetryButtonText>Спробувати знову</RetryButtonText>
          </RetryButton>
        </ErrorContainer>
      );
    }

    return (
      <EmptyContainer>
        <EmptyImage 
          source={require('../assets/image/not-found.webp')} 
          resizeMode="contain" 
        />
        <EmptyText>Аніме не знайдено</EmptyText>
      </EmptyContainer>
    );
  }, [loading, error, handleRetry]);

  if (!tokenReady) {
    return (
      <Container>
        <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar title="Популярне аніме" />
        </BlurOverlay>
        <ContentContainer style={{ paddingTop: insets.top + 56 }}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={{ marginTop: 50 }}
          />
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title="Популярне аніме" />
      </BlurOverlay>
      
      <ContentContainer style={{ paddingTop: insets.top + 56 }}>
        {/* Фільтри */}
        <FilterContainer>
          {filters.map((filter) => (
            <FilterButton
              key={filter.key}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <FilterButtonText selected={selectedFilter === filter.key}>
                {filter.label}
              </FilterButtonText>
            </FilterButton>
          ))}
        </FilterContainer>

        {/* Список аніме */}
        <FlatList
          data={animeList}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: insets.bottom + 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </ContentContainer>
    </Container>
  );
};

export default PopularAnimeScreen;