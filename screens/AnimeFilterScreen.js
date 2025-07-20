import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import AnimeFilters from '../components/AnimeFilter/FilterPanel';
import AnimeResults from '../components/AnimeFilter/AnimeResults';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'https://api.hikka.io';

const yearsList = [];
for (let y = new Date().getFullYear(); y >= 1965; y--) {
  yearsList.push(y);
}

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

const ResultsContainer = styled.View`
  flex: 1;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  right: 12px;
  top: 45px;
  margin-bottom: 16px;
  padding: 12px 24px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
  border-radius: 999px;
  align-self: flex-start;
  z-index: 99999;
`;

const BackButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;

export default function AnimeFilterScreen() {
  const [allGenres, setAllGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const { theme, isDark } = useTheme();

  const [authToken, setAuthToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);

  const [filters, setFilters] = useState({
    selectedGenres: [],
    selectedMediaTypes: [],
    selectedStudios: [],
    selectedSources: [],
    selectedStatuses: [],
    selectedSeasons: [],
    selectedRatings: [],
    yearFrom: null,
    yearTo: null,
    selectedSort: 'score:desc',
  });

  const [dropdownStates, setDropdownStates] = useState({
    dropdownGenresVisible: false,
    dropdownMediaVisible: false,
    dropdownStudiosVisible: false,
    dropdownSourcesVisible: false,
    dropdownStatusVisible: false,
    dropdownSeasonVisible: false,
    dropdownRatingVisible: false,
    dropdownYearFromVisible: false,
    dropdownYearToVisible: false,
    dropdownSortVisible: false,
  });

  const [animeList, setAnimeList] = useState([]);
  const [loadingAnime, setLoadingAnime] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Завантаження токена при старті
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('hikka_token');
        console.log('Fetched token:', token);
        if (token) setAuthToken(token);
      } catch (e) {
        console.error('Помилка отримання токена:', e);
      } finally {
        setTokenReady(true);
      }
    };
    loadToken();
  }, []);

  // Завантаження жанрів
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(`${API_BASE}/genres`);
        setAllGenres(res.data.list || []);
      } catch (e) {
        console.error('Помилка завантаження жанрів:', e);
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  const toggleOption = (key) => (slug) => {
    setFilters((prev) => {
      const exists = prev[key].includes(slug);
      const newArr = exists ? prev[key].filter((s) => s !== slug) : [...prev[key], slug];
      return { ...prev, [key]: newArr };
    });
  };

  const toggleGenre = toggleOption('selectedGenres');
  const toggleMediaType = toggleOption('selectedMediaTypes');
  const toggleStudio = toggleOption('selectedStudios');
  const toggleSource = toggleOption('selectedSources');
  const toggleStatus = toggleOption('selectedStatuses');
  const toggleSeason = toggleOption('selectedSeasons');
  const toggleRating = toggleOption('selectedRatings');

  const selectYearFrom = (year) => {
    setFilters((prev) => ({ ...prev, yearFrom: year }));
    setDropdownStates((prev) => ({ ...prev, dropdownYearFromVisible: false }));
  };

  const selectYearTo = (year) => {
    setFilters((prev) => ({ ...prev, yearTo: year }));
    setDropdownStates((prev) => ({ ...prev, dropdownYearToVisible: false }));
  };

  const setSelectedSort = (slug) => {
    setFilters((prev) => ({ ...prev, selectedSort: slug }));
    setDropdownStates((prev) => ({ ...prev, dropdownSortVisible: false }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      dropdownGenresVisible: false,
      dropdownMediaVisible: false,
      dropdownStudiosVisible: false,
      dropdownSourcesVisible: false,
      dropdownStatusVisible: false,
      dropdownSeasonVisible: false,
      dropdownRatingVisible: false,
      dropdownYearFromVisible: false,
      dropdownYearToVisible: false,
      dropdownSortVisible: false,
    });
  };

  const resetPage = () => {
    setPage(1);
    setHasMore(true);
  };

  const fetchAnimeByFilters = useCallback(
    async (newSearch = false) => {
      if (!tokenReady) return; // чекаємо токен
      if (!authToken) {
        console.warn('Токен відсутній, не можемо зробити запит.');
        return;
      }
      if (!hasMore && !newSearch) return;

      if (newSearch) {
        resetPage();
        setAnimeList([]);
      }

      setLoadingAnime(true);
      closeAllDropdowns();

      try {
        let { yearFrom, yearTo } = filters;
        if (yearFrom && yearTo && yearFrom > yearTo) [yearFrom, yearTo] = [yearTo, yearFrom];

        const sortParams = [];
        if (filters.selectedSort) sortParams.push(filters.selectedSort);
        if (filters.isSortByScoredBy) sortParams.push('score:asc');

        const postData = {
          genres: filters.selectedGenres,
          years: [yearFrom || null, yearTo || null],
          include_multiseason: false,
          only_translated: false,
          score: [null, null],
          media_type: filters.selectedMediaTypes,
          rating: filters.selectedRatings,
          status: filters.selectedStatuses,
          source: filters.selectedSources,
          season: filters.selectedSeasons,
          producers: [],
          studios: filters.selectedStudios,
          query: null,
          sort: sortParams,
        };

        const res = await axios.post(
          `${API_BASE}/anime?page=${newSearch ? 1 : page}&size=21`,
          postData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              Cookie: `auth=${authToken}`, // Ось кука з токеном
            },
            withCredentials: true, // якщо сервер потребує куків
          }
        );

        const newList = res.data.list || [];
        if (newSearch) {
          setAnimeList(newList);
          setShowResults(true);
        } else {
          setAnimeList((prev) => [...prev, ...newList]);
        }

        setHasMore(newList.length >= 20);
      } catch (e) {
        console.error('Помилка запиту аніме:', e);
        if (newSearch) setAnimeList([]);
        alert('Помилка запиту');
      } finally {
        setLoadingAnime(false);
      }
    },
    [filters, page, hasMore, authToken, tokenReady]
  );

  useEffect(() => {
    if (page === 1 || !tokenReady) return;
    fetchAnimeByFilters();
  }, [page, fetchAnimeByFilters, tokenReady]);

  const applyFilters = () => {
    if (!tokenReady || !authToken) return;
    resetPage();
    fetchAnimeByFilters(true);
  };

  const loadMore = () => {
    if (loadingAnime || !hasMore) return;
    setPage((prev) => prev + 1);
  };

  const resetFilters = () => {
    setFilters({
      selectedGenres: [],
      selectedMediaTypes: [],
      selectedStudios: [],
      selectedSources: [],
      selectedStatuses: [],
      selectedSeasons: [],
      selectedRatings: [],
      yearFrom: null,
      yearTo: null,
      selectedSort: null,
    });
    setAnimeList([]);
    setShowResults(false);
    setPage(1);
    setHasMore(true);
  };

  if (loadingGenres || !tokenReady) {
    return null; // або лоадер
  }

  return (
    <Container>
      {!showResults ? (
        <AnimeFilters
          allGenres={allGenres}
          filters={filters}
          setFilters={setFilters}
          toggleGenre={toggleGenre}
          toggleMediaType={toggleMediaType}
          toggleStudio={toggleStudio}
          toggleSource={toggleSource}
          toggleStatus={toggleStatus}
          toggleSeason={toggleSeason}
          toggleRating={toggleRating}
          selectYearFrom={selectYearFrom}
          selectYearTo={selectYearTo}
          setSelectedSort={setSelectedSort}
          dropdownStates={dropdownStates}
          setDropdownStates={setDropdownStates}
          yearsList={yearsList}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
        />
      ) : (
        <ResultsContainer>
          <BackButton onPress={() => setShowResults(false)}>
            <BackButtonText>Змінити</BackButtonText>
          </BackButton>

          <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
            <HeaderTitleBar title="Фільтр" />
          </BlurOverlay>

          <AnimeResults
            animeList={animeList}
            loadingAnime={loadingAnime}
            onEndReached={loadMore}
          />
        </ResultsContainer>
      )}
    </Container>
  );
}
