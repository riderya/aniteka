import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import AnimeFilters from '../components/AnimeFilter/FilterPanel';
import AnimeResults from '../components/AnimeFilter/AnimeResults';

const API_BASE = 'https://api.hikka.io';

const yearsList = [];
for (let y = 1965; y <= new Date().getFullYear(); y++) {
  yearsList.push(y);
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ResultsContainer = styled.View`
  flex: 1;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: 16px;
  padding: 12px;
  background-color: #6c47ff;
  border-radius: 10px;
  align-self: flex-start;
`;

const BackButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
`;

export default function AnimeFilterScreen() {
  const [allGenres, setAllGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

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

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(`${API_BASE}/anime/genres`);
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

  const fetchAnimeByFilters = async () => {
    setLoadingAnime(true);
    closeAllDropdowns();

    try {
      let { yearFrom, yearTo } = filters;
      if (yearFrom && yearTo && yearFrom > yearTo) [yearFrom, yearTo] = [yearTo, yearFrom];

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
        sort: filters.selectedSort ? [filters.selectedSort] : ['score:desc', 'scored_by:desc'],
      };

      const res = await axios.post(`${API_BASE}/anime`, postData);
      setAnimeList(res.data.list || []);
      setShowResults(true);
    } catch (e) {
      console.error('Помилка запиту аніме:', e);
      setAnimeList([]);
      alert('Помилка запиту');
    } finally {
      setLoadingAnime(false);
    }
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
      selectedSort: 'score:desc',
    });
    setAnimeList([]);
    setShowResults(false);
  };

  if (loadingGenres) {
    return null;
  }

  return (
    <Container>
      {!showResults ? (
        <AnimeFilters
          allGenres={allGenres}
          filters={filters}
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
          applyFilters={fetchAnimeByFilters}
          resetFilters={resetFilters}
        />
      ) : (
        <ResultsContainer>
          <BackButton onPress={() => setShowResults(false)}>
            <BackButtonText>Назад до фільтрів</BackButtonText>
          </BackButton>

          <AnimeResults animeList={animeList} loadingAnime={loadingAnime} />
        </ResultsContainer>
      )}
    </Container>
  );
}
