import React, { useEffect, useState, useRef } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import FilterTabs from '../components/SavedComponents/FilterTabs';
import AnimeListSection from '../components/SavedComponents/AnimeListSection';
import LoginComponent from '../components/Auth/LoginComponent';
import Header from '../components/Header/Header';

import styled, { useTheme } from 'styled-components/native';
import { useAuth } from '../context/AuthContext';

const TOKEN_KEY = 'hikka_token';

const FILTERS = [
  { label: 'Улюблені', status: null, type: 'favourite' },
  { label: 'Дивлюсь', status: 'watching', type: 'watch' },
  { label: 'Заплановані', status: 'planned', type: 'watch' },
  { label: 'Переглянуто', status: 'completed', type: 'watch' },
  { label: 'Відкладені', status: 'on_hold', type: 'watch' },
  { label: 'Закинуті', status: 'dropped', type: 'watch' }
];

const SavedScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const [animeLists, setAnimeLists] = useState(Array(FILTERS.length).fill([]));
  const [loadingStates, setLoadingStates] = useState(Array(FILTERS.length).fill(false));
  const [errorStates, setErrorStates] = useState(Array(FILTERS.length).fill(null));
  const [sortOptions, setSortOptions] = useState(["watch_created:desc", "watch_score:desc"]);

  const pagerRef = useRef(null);

  const fetchAnimeDetails = async (slug, token) => {
    try {
      const res = await fetch(`https://api.hikka.io/anime/${slug}`, {
        headers: { auth: token }
      });
      if (!res.ok) return '';
      const data = await res.json();
      return data.synopsis_ua || data.synopsis_en || '';
    } catch {
      return '';
    }
  };

  const fetchList = async (index) => {
    try {
      setLoadingStates(prev => {
        const arr = [...prev];
        arr[index] = true;
        return arr;
      });
      setErrorStates(prev => {
        const arr = [...prev];
        arr[index] = null;
        return arr;
      });

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) throw new Error('Токен не знайдено');

      const userRes = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: token }
      });
      if (!userRes.ok) throw new Error('Не вдалося отримати дані користувача');

      const userData = await userRes.json();
      const username = userData?.username;
      if (!username) throw new Error('Імʼя користувача не знайдено');

      const selected = FILTERS[index];
      let list = [];

      if (selected.type === 'favourite') {
        const favRes = await fetch(`https://api.hikka.io/favourite/anime/${username}/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            auth: token
          },
          body: JSON.stringify({ page: 1, size: 100 })
        });
        const favData = await favRes.json();
        list = favData.list?.map(item => ({ ...item, user_status: 'favourite' })) || [];
      } else {
        const watchRes = await fetch(`https://api.hikka.io/watch/${username}/list?page=1&size=100`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            auth: token
          },
          body: JSON.stringify({
            years: [null, null],
            include_multiseason: false,
            only_translated: false,
            score: [0, 10],
            media_type: [],
            rating: [],
            status: [],
            source: [],
            season: [],
            producers: [],
            studios: [],
            genres: [],
            sort: sortOptions,
            watch_status: selected.status
          })
        });
        const watchData = await watchRes.json();
        list = watchData.list?.map(item => ({
          ...item.anime,
          user_status: item.status
        })) || [];
      }

      const detailedList = await Promise.all(
        list.map(async (anime) => {
          const description = await fetchAnimeDetails(anime.slug, token);
          return { ...anime, synopsis_ua: description };
        })
      );

      setAnimeLists(prev => {
        const arr = [...prev];
        arr[index] = detailedList;
        return arr;
      });
    } catch (err) {
      setErrorStates(prev => {
        const arr = [...prev];
        arr[index] = err.message;
        return arr;
      });
      Alert.alert('Помилка', err.message);
      setAnimeLists(prev => {
        const arr = [...prev];
        arr[index] = [];
        return arr;
      });
    } finally {
      setLoadingStates(prev => {
        const arr = [...prev];
        arr[index] = false;
        return arr;
      });
    }
  };

  useEffect(() => {
    if (!animeLists[pageIndex]?.length) {
      fetchList(pageIndex);
    }
  }, [pageIndex, sortOptions]);

  const toggleSort = () => {
    const newSort = sortOptions[0] === "watch_score:desc"
      ? ["watch_created:desc", "watch_score:desc"]
      : ["watch_score:desc", "watch_created:desc"];
    setSortOptions(newSort);
  };

  // Змінили функцію - тепер приймає navigation і робить перехід
  const showRandomAnime = (navigation) => {
    const list = animeLists[pageIndex];
    if (!list?.length) return Alert.alert('Упс', 'Список порожній!');
    const random = list[Math.floor(Math.random() * list.length)];
    navigation.navigate('AnimeDetails', { slug: random.slug });
  };

  const onRefreshData = async () => {
    await fetchList(pageIndex);
  };

  // Перевіряємо чи користувач авторизований
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Header />
        <LoginComponent onLoginSuccess={() => {
          // Перезавантажуємо дані після успішного логіну
          FILTERS.forEach((_, index) => {
            fetchList(index);
          });
        }} />
      </View>
    );
  }

  return (
    <Container insets={insets} theme={theme}>
      <FilterTabsWrapper>
        <FilterTabs
          filters={FILTERS}
          activeIndex={pageIndex}
          onChange={(idx) => {
            setPageIndex(idx);
            pagerRef.current?.setPage(idx);
          }}
        />
      </FilterTabsWrapper>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={pageIndex}
        onPageSelected={e => setPageIndex(e.nativeEvent.position)}
      >
        {FILTERS.map((filter, index) => (
          <Page key={filter.label}>
            {loadingStates[index] ? (
              <Center>
                <ActivityIndicator size="large" />
                <LoadingText theme={theme}>Завантаження...</LoadingText>
              </Center>
            ) : errorStates[index] ? (
              <Center>
                <ErrorText>{`⚠️ ${errorStates[index]}`}</ErrorText>
              </Center>
            ) : animeLists[index]?.length === 0 ? (
              <Center>
                <EmptyText>🤷 Нічого не знайдено.</EmptyText>
              </Center>
            ) : (
              <AnimeListSection
                animeList={animeLists[index]}
                sortOptions={sortOptions}
                toggleSort={toggleSort}
                showRandomAnime={(navigation) => showRandomAnime(navigation)} // передаємо сюди navigation
                theme={theme}
                onRefreshData={onRefreshData}
              />
            )}
          </Page>
        ))}
      </PagerView>
    </Container>
  );
};

export default SavedScreen;

// СТИЛІ

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding-top: ${({ insets }) => insets.top}px;
  padding-bottom: ${({ insets }) => insets.bottom + 40}px;
`;

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 10px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorText = styled.Text`
  color: red;
  font-size: 16px;
  text-align: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
`;

const Page = styled.View`
  flex: 1;
`;

const FilterTabsWrapper = styled.View`
  height: 50px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;
