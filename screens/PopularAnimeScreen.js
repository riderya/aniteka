import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { FlatList, ActivityIndicator, RefreshControl, Animated, Dimensions, View } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import AnimeRowCard from '../components/Cards/AnimeRowCard';
import { CONFIG } from '../utils/config';

const { width: screenWidth } = Dimensions.get('window');

const API_BASE = CONFIG.API.HIKKA_BASE_URL;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const GradientBackground = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  opacity: 0.1;
`;

const RankBadge = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => `${theme.colors.primary}15`};
  align-self: center;
`;

const IconContainer = styled.View`
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
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
`;

const ListContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  margin-top: -24px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
  padding-top: 120px;
`;

const EmptyIconContainer = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${({ theme }) => `${theme.colors.primary}10`};
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border-width: 2px;
  border-color: ${({ theme }) => `${theme.colors.primary}20`};
`;

const EmptyImage = styled.Image`
  width: 80px;
  height: 80px;
  opacity: 0.6;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
`;

const EmptySubText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  text-align: center;
  opacity: 0.7;
  line-height: 20px;
`;

const ErrorContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const ErrorIconContainer = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${({ theme }) => `${theme.colors.error}15`};
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border-width: 2px;
  border-color: ${({ theme }) => `${theme.colors.error}30`};
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
`;

const ErrorSubText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  text-align: center;
  margin-bottom: 24px;
  opacity: 0.8;
  line-height: 20px;
`;

const RetryButton = styled.TouchableOpacity`
  padding: 16px 32px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 25px;
  min-width: 140px;
  align-items: center;
`;

const RetryButtonText = styled.Text`
  color: white;
  font-weight: 700;
  font-size: 16px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const LoadingText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
  opacity: 0.7;
`;

const AnimatedRankWrapper = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  width: 100%;
  max-width: ${screenWidth - 32}px;
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
  
  // Відображаємо тільки популярне

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

      // Сортування тільки для популярного
      const sortParams = ['scored_by:desc', 'score:desc'];

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
        // Prevent duplicates by filtering out items that already exist
        setAnimeList(prev => {
          const existingSlugs = new Set(prev.map(item => item.slug));
          const uniqueNewItems = newAnimeList.filter(item => !existingSlugs.has(item.slug));
          return [...prev, ...uniqueNewItems];
        });
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
  }, [tokenReady, authToken]);

  // Початкове завантаження
  useEffect(() => {
    if (tokenReady) {
      setPage(1);
      setHasMore(true);
      fetchAnime(1);
    }
  }, [tokenReady, fetchAnime]);

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

  // Рендер елемента списку з красивими іконками
  const renderAnimeItem = useCallback(({ item, index }) => {
    const rank = index + 1;
    
    // Спеціальні дизайни для топ позицій
    const getTopRankDesign = (rank) => {
      switch (rank) {
        case 1:
          return {
            colors: ['#FFD700', '#FFA500', '#FF8C00'],
            borderColor: '#FFD700',
            icon: <MaterialIcons name="emoji-events" size={20} color="#FFFFFF" />,
            shadow: '#FFD700'
          };
        case 2:
          return {
            colors: ['#C0C0C0', '#A8A8A8', '#909090'],
            borderColor: '#C0C0C0',
            icon: <MaterialIcons name="workspace-premium" size={18} color="#FFFFFF" />,
            shadow: '#C0C0C0'
          };
        case 3:
          return {
            colors: ['#CD7F32', '#B87333', '#A0522D'],
            borderColor: '#CD7F32',
            icon: <FontAwesome5 name="medal" size={16} color="#FFFFFF" />,
            shadow: '#CD7F32'
          };
        case 4:
          return {
            colors: ['#9370DB', '#8A2BE2', '#7B68EE'],
            borderColor: '#9370DB',
            icon: <Ionicons name="star" size={18} color="#FFFFFF" />,
            shadow: '#9370DB'
          };
        case 5:
          return {
            colors: ['#FF6347', '#FF4500', '#DC143C'],
            borderColor: '#FF6347',
            icon: <MaterialIcons name="local-fire-department" size={18} color="#FFFFFF" />,
            shadow: '#FF6347'
          };
        default:
          return null;
      }
    };

    const topDesign = getTopRankDesign(rank);
    

    if (topDesign) {
      // Топ 5 позицій з прозорим фоном та кольоровими іконками
      return (
        <AnimatedRankWrapper>
          <RankBadge
            style={{
              backgroundColor: `${topDesign.borderColor}33`, // 20% прозорості
              borderColor: topDesign.borderColor,
              marginBottom: 20,
            }}
          >
            <IconContainer>
              {React.cloneElement(topDesign.icon, { color: topDesign.borderColor })}
            </IconContainer>
          </RankBadge>
          <View style={{ flex: 1, width: screenWidth - 60 - 100 - 32 }}>
            <AnimeRowCard
              anime={item}
              imageWidth={100}
              imageHeight={130}
              marginBottom={20}
              imageBorderRadius={16}
            />
          </View>
        </AnimatedRankWrapper>
      );
    } else {
      // Звичайні позиції з прозорим фоном та іконкою кольору теми
return (
  <AnimatedRankWrapper>
    <RankBadge
      style={{
        backgroundColor: `${theme.colors.primary}33`,
        borderColor: theme.colors.primary,
        marginBottom: 20,
      }}
    >
      <IconContainer>
        <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
      </IconContainer>
    </RankBadge>
    <View style={{ 
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      width: screenWidth - 60 - 100 - 32
    }}>
      <AnimeRowCard
        anime={item}
        imageWidth={100}
        imageHeight={130}
        marginBottom={24}
        imageBorderRadius={16}
      />
    </View>
  </AnimatedRankWrapper>
);
    }
  }, [theme.colors.primary]);

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
        <ErrorIconContainer>
          <EmptyImage
            source={require('../assets/image/not-found.webp')}
            resizeMode="contain"
          />
        </ErrorIconContainer>
        <ErrorText>Упс! Щось пішло не так</ErrorText>
        <ErrorSubText>{error}</ErrorSubText>
        <RetryButton
          onPress={handleRetry}
          style={{
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <RetryButtonText>Спробувати знову</RetryButtonText>
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <EmptyContainer>
      <EmptyIconContainer>
        <EmptyImage
          source={require('../assets/image/not-found.webp')}
          resizeMode="contain"
        />
      </EmptyIconContainer>
      <EmptyText>Аніме не знайдено</EmptyText>
      <EmptySubText>Спробуйте оновити сторінку або перевірте підключення до інтернету</EmptySubText>
    </EmptyContainer>
  );
}, [loading, error, handleRetry, theme.colors.primary]);

  if (!tokenReady) {
    return (
    <Container>
      <GradientBackground
        colors={isDark ? [theme.colors.primary, theme.colors.secondary] : [theme.colors.primary, theme.colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BlurOverlay
        intensity={100}
        tint={isDark ? 'dark' : 'light'}
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <HeaderTitleBar title="Популярне аніме" />
      </BlurOverlay>
      <ContentContainer style={{ paddingTop: insets.top + 56 }}>
        <LoadingContainer>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <LoadingText>Завантаження...</LoadingText>
        </LoadingContainer>
      </ContentContainer>
    </Container>
    );
  }

  return (
    <Container>
    <GradientBackground
      colors={isDark ? [theme.colors.primary, theme.colors.secondary] : [theme.colors.primary, theme.colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
    <BlurOverlay
      intensity={100}
      tint={isDark ? 'dark' : 'light'}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <HeaderTitleBar title="Популярне аніме" />
    </BlurOverlay>

    <ContentContainer>
      <ListContainer
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 5,
        }}
      >
        <FlatList
          data={animeList}
          renderItem={renderAnimeItem}
          keyExtractor={(item, index) => `${item.slug}-${index}`}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: insets.top + 86 + 20,
            paddingBottom: 20 + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.card || theme.colors.background}
              style={{ backgroundColor: 'transparent' }}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </ListContainer>
    </ContentContainer>
    </Container>
  );
};

export default PopularAnimeScreen;