import React, { useEffect, useState, useRef } from 'react';
import { Alert, ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import AnimeListSection from '../components/SavedComponents/AnimeListSection';
import LoginComponent from '../components/Auth/LoginComponent';
import Header from '../components/Header/Header';
import { AnimeListSkeleton } from '../components/Skeletons';

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

const SavedScreenNew = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isAuthenticated, userData } = useAuth();
  const layout = useWindowDimensions();
  
  const [pageIndex, setPageIndex] = useState(0);
  const [animeLists, setAnimeLists] = useState(Array(FILTERS.length).fill([]));
  const [loadingStates, setLoadingStates] = useState(Array(FILTERS.length).fill(false));
  const [initialLoadStates, setInitialLoadStates] = useState(Array(FILTERS.length).fill(false));
  const [errorStates, setErrorStates] = useState(Array(FILTERS.length).fill(null));
  const [sortOptions, setSortOptions] = useState(["watch_score:desc", "watch_created:desc"]);
  const [isSortingLoading, setIsSortingLoading] = useState(false);

  // Створюємо routes для TabView
  const routes = FILTERS.map((filter, index) => ({
    key: index.toString(),
    title: filter.label,
    filterKey: filter.type,
    status: filter.status,
  }));

  // Рендеримо сцену для кожного таба
  const renderScene = ({ route }) => {
    const index = parseInt(route.key);
    

    
    if (errorStates[index]) {
      return (
        <ErrorContainer>
          <ErrorText>{`⚠️ ${errorStates[index]}`}</ErrorText>
        </ErrorContainer>
      );
    }

    return (
      <AnimeListSection
        animeList={animeLists[index] || []}
        sortOptions={sortOptions}
        toggleSort={toggleSort}
        showRandomAnime={(navigation) => showRandomAnime(navigation)}
        theme={theme}
        onRefreshData={onRefreshData}
        isLoading={loadingStates[index]}
        skeletonCount={5}
        isSortingLoading={isSortingLoading}
        // Додаємо додаткову інформацію для улюблених аніме
        isFavouriteTab={FILTERS[index].type === 'favourite'}
      />
    );
  };

  // Функції для роботи з аніме
  const fetchAnimeDetails = async (slug, token) => {
    try {
      const response = await fetch(`https://api.hikka.io/anime/${slug}`, {
        headers: {
          auth: token
        }
      });
      const data = await response.json();
      return data.synopsis_ua || data.synopsis || '';
    } catch (error) {
      console.error('Error fetching anime details:', error);
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
      setInitialLoadStates(prev => {
        const arr = [...prev];
        arr[index] = true;
        return arr;
      });

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) throw new Error('Токен не знайдено');

      // Отримуємо username з AuthContext
      if (!userData?.username) {
        throw new Error('Username не знайдено');
      }

      const username = userData.username;
      const selected = FILTERS[index];
      let list = [];


      if (selected.type === 'favourite') {
        // Для улюблених аніме використовуємо правильний API endpoint
        const favRes = await fetch(`https://api.hikka.io/favourite/anime/${username}/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            auth: token
          },
          body: JSON.stringify({
            page: 1,
            size: 100
            // API для улюблених не підтримує параметри сортування
            // Сортування буде виконано на клієнті
          })
        });
        
        if (!favRes.ok) {
          const errorText = await favRes.text();
          throw new Error(`HTTP error! status: ${favRes.status}: ${errorText}`);
        }
        
        const favData = await favRes.json();
        
        // Перевіряємо структуру відповіді згідно з API документацією
        if (favData.list && Array.isArray(favData.list)) {
          list = favData.list.map(item => ({
            // Перетворюємо дані з API у формат, який очікує компонент
            title: item.title_ua || item.title_en || item.title_ja,
            title_ua: item.title_ua,
            title_en: item.title_en,
            title_ja: item.title_ja,
            synopsis: '',
            synopsis_ua: '',
            episodes: item.episodes_total || item.episodes_released || 0,
            episodes_total: item.episodes_total,
            episodes_released: item.episodes_released,
            score: item.score || item.native_score || 0,
            native_score: item.native_score,
            scored_by: item.scored_by || item.native_scored_by || 0,
            native_scored_by: item.native_scored_by,
            status: item.status,
            media_type: item.media_type,
            year: item.year,
            season: item.season,
            source: item.source,
            rating: item.rating,
            image: item.image,
            slug: item.slug,
            start_date: item.start_date,
            end_date: item.end_date,
            translated_ua: item.translated_ua,
            user_status: 'favourite',
            favourite_created: item.favourite_created
          }));
          
          // Застосовуємо клієнтське сортування для улюблених аніме
          if (sortOptions[0] === 'watch_score:desc') {
            list.sort((a, b) => (b.score || 0) - (a.score || 0));
          } else if (sortOptions[0] === 'watch_created:desc') {
            list.sort((a, b) => (b.favourite_created || 0) - (a.favourite_created || 0));
          }
        } else {
          console.warn('Unexpected favourite response structure:', favData);
          list = [];
        }
      } else {
           // Для списку перегляду передаємо watch_status
           const requestBody = {
             years: [null, null],
             include_multiseason: false,
             only_translated: false,
             score: [0, 10],
             native_score: [0, 10],
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
           };
         
         
         
         const watchRes = await fetch(`https://api.hikka.io/watch/${username}/list`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             auth: token
           },
           body: JSON.stringify(requestBody)
         });
        
                 if (!watchRes.ok) {
           const errorText = await watchRes.text();
 
           throw new Error(`HTTP error! status: ${watchRes.status}: ${errorText}`);
         }
        
        const watchData = await watchRes.json();

        
        // Перевіряємо структуру відповіді
        if (watchData.list && Array.isArray(watchData.list)) {
          list = watchData.list.map(item => ({
            ...item.anime,
            user_status: item.status
          }));
        } else {
          console.warn('Unexpected watch response structure:', watchData);
          list = [];
        }
      }



      // Завантажуємо деталі тільки якщо є аніме в списку
      let detailedList = [];
      if (list.length > 0) {
        detailedList = await Promise.all(
          list.map(async (anime) => {
            try {
              // Тепер slug знаходиться безпосередньо в anime об'єкті
              const slug = anime.slug;
              if (slug) {
                const description = await fetchAnimeDetails(slug, token);
                return { 
                  ...anime, 
                  synopsis_ua: description
                };
              }
              return anime;
            } catch (error) {
              console.warn(`Failed to fetch details for ${anime.slug}:`, error);
              return anime; // Повертаємо аніме без опису
            }
          })
        );
      }



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
      
      // Показуємо більш інформативні повідомлення про помилки
      const errorMessage = selected.type === 'favourite' 
        ? `Помилка завантаження улюблених аніме: ${err.message}`
        : `Помилка завантаження списку: ${err.message}`;
      
      Alert.alert('Помилка', errorMessage);
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

  const toggleSort = () => {
    setIsSortingLoading(true);
    const newSort = sortOptions[0] === "watch_score:desc"
      ? ["watch_created:desc", "watch_score:desc"]
      : ["watch_score:desc", "watch_created:desc"];
    setSortOptions(newSort);
  };

  const showRandomAnime = (navigation) => {
    const list = animeLists[pageIndex];
    if (!list?.length) return Alert.alert('Упс', 'Список порожній!');
    const random = list[Math.floor(Math.random() * list.length)];
    // Тепер slug знаходиться безпосередньо в anime об'єкті
    const slug = random.slug;
    if (slug) {
      navigation.navigate('AnimeDetails', { slug: slug });
    } else {
      Alert.alert('Помилка', 'Не вдалося знайти slug для аніме');
    }
  };

  const onRefreshData = async () => {
    // При оновленні завжди показуємо завантаження
    setLoadingStates(prev => {
      const arr = [...prev];
      arr[pageIndex] = true;
      return arr;
    });
    await fetchList(pageIndex);
  };

  // Завантажуємо дані при зміні сторінки
  useEffect(() => {
    if (isAuthenticated && userData?.username) {
      // Завантажуємо дані тільки якщо їх ще немає
      if (!initialLoadStates[pageIndex]) {
        fetchList(pageIndex);
      }
    }
  }, [pageIndex, isAuthenticated, userData?.username]);

  // Завантажуємо всі списки при першому вході
  useEffect(() => {
    if (isAuthenticated && userData?.username) {
      FILTERS.forEach((_, index) => {
        if (!initialLoadStates[index]) {
          fetchList(index);
        }
      });
    }
  }, [isAuthenticated, userData?.username]);

  // Перезавантажуємо дані при зміні сортування
  useEffect(() => {
    if (isAuthenticated && userData?.username) {
      FILTERS.forEach((_, index) => {
        if (initialLoadStates[index]) {
          fetchList(index);
        }
      });
      setIsSortingLoading(false);
    }
  }, [sortOptions]);

  // Перевіряємо чи користувач авторизований
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Header />
        <LoginComponent onLoginSuccess={() => {
          // Перезавантажуємо дані після успішного логіну
          // Дані автоматично завантажаться через useEffect коли userData оновиться
        }} />
      </View>
    );
  }

  return (
    <Container insets={insets} theme={theme}>
      <TabView
        navigationState={{ index: pageIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setPageIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled={true}
        animationEnabled={true}
        lazy={false}
        renderTabBar={(props) => (
          <CustomTabBar
            {...props}
            indicatorStyle={{
              backgroundColor: theme.colors.primary,
              height: 3,
              borderRadius: 2,
            }}
            style={{
              backgroundColor: theme.colors.background,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
            labelStyle={{
              fontWeight: '600',
              fontSize: 16,
              textTransform: 'none',
            }}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.gray}
            pressColor={theme.colors.primary + '20'}
            scrollEnabled={true}
            bounces={false}
            tabStyle={{
              minWidth: 80,
              paddingHorizontal: 16,
            }}
            contentContainerStyle={{
              paddingHorizontal: 12,
            }}
          />
        )}
      />
    </Container>
  );
};

export default SavedScreenNew;

// Стилі
const Container = styled.View`  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding-top: ${({ insets }) => insets.top}px;
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorText = styled.Text`
  color: red;
  font-size: 16px;
  text-align: center;
`;

const CustomTabBar = styled(TabBar)`
  height: 50px;
`;

