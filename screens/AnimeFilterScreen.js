import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const genresList = ['action', 'comedy', 'fantasy', 'drama', 'romance'];
const statusesList = ['ongoing', 'finished', 'announced'];
const mediaTypes = ['tv', 'movie', 'ova', 'ona', 'special'];
const ratingsList = ['g', 'pg', 'pg_13', 'r', 'r_plus', 'rx'];
const seasonsList = ['winter', 'spring', 'summer', 'fall'];
const sourcesList = [
  'original', 'manga', 'light_novel', 'visual_novel', 'game', 'book',
  'web_manga', 'digital_manga', 'radio', 'card_game', 'music', 'novel',
  '4_koma_manga', 'picture_book', 'other'
];
const sortOptions = [
  'score:desc', 'score:asc',
  'scored_by:desc', 'scored_by:asc',
  'start_date:desc', 'start_date:asc'
];

const AnimeFilterScreen = () => {
  const [authToken, setAuthToken] = useState(null);
  const [activeTab, setActiveTab] = useState('results');

  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedSort, setSelectedSort] = useState('score:desc');
  const [onlyTranslated, setOnlyTranslated] = useState(false);
  const [scoreRange, setScoreRange] = useState([null, null]);
  const [yearRange, setYearRange] = useState([null, null]);
  const [filteredAnime, setFilteredAnime] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync('hikka_token');
      setAuthToken(token);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (authToken) fetchFilteredAnime();
  }, [authToken]);

  const fetchFilteredAnime = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.hikka.io/anime',
        {
          genres: selectedGenre ? [selectedGenre] : [],
          status: selectedStatus ? [selectedStatus] : [],
          media_type: selectedType ? [selectedType] : [],
          score: scoreRange,
          years: yearRange,
          sort: [selectedSort],
          only_translated: onlyTranslated,
          include_multiseason: false,
          query: null,
          rating: selectedRating ? [selectedRating] : [],
          season: selectedSeason ? [selectedSeason] : [],
          source: selectedSource ? [selectedSource] : [],
          producers: [],
          studios: [],
        },
        {
          headers: {
            auth: authToken,
          },
        }
      );

      setFilteredAnime(response.data.list || []);
      setActiveTab('results');
    } catch (error) {
      console.error('Помилка запиту:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedGenre(null);
    setSelectedStatus(null);
    setSelectedType(null);
    setSelectedRating(null);
    setSelectedSeason(null);
    setSelectedSource(null);
    setSelectedSort('score:desc');
    setOnlyTranslated(false);
    setScoreRange([null, null]);
    setYearRange([null, null]);
    setFilteredAnime([]);
    setActiveTab('results');
  };

  const renderAnimeItem = ({ item }) => (
    <AnimeCard>
      <AnimeImage source={{ uri: item.image }} />
      <View>
        <AnimeTitle>{item.title_ua || item.title_en}</AnimeTitle>
        <AnimeInfo>Рейтинг: {item.score} • {item.status}</AnimeInfo>
      </View>
    </AnimeCard>
  );

  return (
    <Container>
      {activeTab === 'filters' ? (
        <Header>
          <Title>Фільтрувати аніме</Title>

          <SectionTitle>Жанри</SectionTitle>
          <OptionsRow>
            {genresList.map((genre) => (
              <Option
                key={genre}
                selected={selectedGenre === genre}
                onPress={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
              >
                <OptionText selected={selectedGenre === genre}>{genre}</OptionText>
              </Option>
            ))}
          </OptionsRow>

          <SectionTitle>Статус</SectionTitle>
          <OptionsRow>
            {statusesList.map((status) => (
              <Option
                key={status}
                selected={selectedStatus === status}
                onPress={() => setSelectedStatus(status === selectedStatus ? null : status)}
              >
                <OptionText selected={selectedStatus === status}>{status}</OptionText>
              </Option>
            ))}
          </OptionsRow>

          <SectionTitle>Тип</SectionTitle>
          <OptionsRow>
            {mediaTypes.map((type) => (
              <Option
                key={type}
                selected={selectedType === type}
                onPress={() => setSelectedType(type === selectedType ? null : type)}
              >
                <OptionText selected={selectedType === type}>{type}</OptionText>
              </Option>
            ))}
          </OptionsRow>

          <SectionTitle>Рейтинг</SectionTitle>
          <OptionsRow>
            {ratingsList.map((rating) => (
              <Option
                key={rating}
                selected={selectedRating === rating}
                onPress={() => setSelectedRating(rating === selectedRating ? null : rating)}
              >
                <OptionText selected={selectedRating === rating}>{rating}</OptionText>
              </Option>
            ))}
          </OptionsRow>

          <SectionTitle>Сезон</SectionTitle>
          <OptionsRow>
            {seasonsList.map((season) => (
              <Option
                key={season}
                selected={selectedSeason === season}
                onPress={() => setSelectedSeason(season === selectedSeason ? null : season)}
              >
                <OptionText selected={selectedSeason === season}>{season}</OptionText>
              </Option>
            ))}
          </OptionsRow>

          <SectionTitle>Джерело</SectionTitle>
          <OptionsRow>
            {sourcesList.map((source) => (
              <Option
                key={source}
                selected={selectedSource === source}
                onPress={() => setSelectedSource(source === selectedSource ? null : source)}
              >
                <OptionText selected={selectedSource === source}>{source}</OptionText>
              </Option>
            ))}
          </OptionsRow>

          <SectionTitle>Оцінка (від - до)</SectionTitle>
          <OptionsRow>
            <Input
              placeholder="0"
              keyboardType="numeric"
              value={scoreRange[0]?.toString() ?? ''}
              onChangeText={(text) => setScoreRange([+text || null, scoreRange[1]])}
            />
            <Input
              placeholder="10"
              keyboardType="numeric"
              value={scoreRange[1]?.toString() ?? ''}
              onChangeText={(text) => setScoreRange([scoreRange[0], +text || null])}
            />
          </OptionsRow>

          <SectionTitle>Рік (від - до)</SectionTitle>
          <OptionsRow>
            <Input
              placeholder="2000"
              keyboardType="numeric"
              value={yearRange[0]?.toString() ?? ''}
              onChangeText={(text) => setYearRange([+text || null, yearRange[1]])}
            />
            <Input
              placeholder="2025"
              keyboardType="numeric"
              value={yearRange[1]?.toString() ?? ''}
              onChangeText={(text) => setYearRange([yearRange[0], +text || null])}
            />
          </OptionsRow>

          <SectionTitle>Сортувати за</SectionTitle>
          <OptionsRow>
            {sortOptions.map((sort) => (
              <Option
                key={sort}
                selected={selectedSort === sort}
                onPress={() => setSelectedSort(sort)}
              >
                <OptionText selected={selectedSort === sort}>{sort}</OptionText>
              </Option>
            ))}
          </OptionsRow>

          <SectionTitle>Перекладене</SectionTitle>
          <OptionsRow>
            <Option selected={onlyTranslated} onPress={() => setOnlyTranslated(!onlyTranslated)}>
              <OptionText selected={onlyTranslated}>
                {onlyTranslated ? 'Так' : 'Ні'}
              </OptionText>
            </Option>
          </OptionsRow>

          <ButtonsRow>
            <ApplyButton onPress={fetchFilteredAnime}>
              <ApplyButtonText>{loading ? 'Завантаження...' : 'Застосувати'}</ApplyButtonText>
            </ApplyButton>
            <ResetButton onPress={resetFilters}>
              <ResetButtonText>Скинути</ResetButtonText>
            </ResetButton>
          </ButtonsRow>
        </Header>
      ) : (
        <>
          <FilterTopRow>
            <FiltersButton onPress={() => setActiveTab('filters')}>
              <FiltersButtonText>Фільтри</FiltersButtonText>
            </FiltersButton>
          </FilterTopRow>
          <FlatList
            data={filteredAnime}
            keyExtractor={(item) => item.slug}
            renderItem={renderAnimeItem}
            ListEmptyComponent={
              !loading && (
                <Text style={{ color: 'gray', marginTop: 20, paddingHorizontal: 16 }}>
                  Нічого не знайдено
                </Text>
              )
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      )}
    </Container>
  );
};

export default AnimeFilterScreen;



const Container = styled.View`
  flex: 1;
  background-color: #000;
`;

const Header = styled.ScrollView`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-top: 18px;
  margin-bottom: 6px;
  color: #e0e0e0;
`;

const OptionsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Option = styled.TouchableOpacity`
  padding: 10px 16px;
  background-color: ${({ selected }) => (selected ? '#6c47ff' : '#1a1a1a')};
  border-radius: 20px;
  border: 1px solid #333;
`;

const OptionText = styled.Text`
  color: ${({ selected }) => (selected ? '#fff' : '#ccc')};
  font-weight: 500;
`;

const Input = styled.TextInput`
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 10px 14px;
  width: 100px;
  color: #fff;
  font-size: 14px;
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 24px;
  gap: 12px;
`;

const ApplyButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #6c47ff;
  padding: 14px;
  border-radius: 14px;
  align-items: center;
`;

const ApplyButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;

const ResetButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #262626;
  padding: 14px;
  border-radius: 14px;
  align-items: center;
`;

const ResetButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;

const AnimeCard = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #1e1e1e;
  padding: 14px;
  border-radius: 12px;
  margin: 10px 16px 0 16px;
`;

const AnimeImage = styled.Image`
  width: 60px;
  height: 85px;
  border-radius: 8px;
  margin-right: 14px;
`;

const AnimeTitle = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const AnimeInfo = styled.Text`
  color: #999;
  font-size: 13px;
`;

const FilterTopRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  padding: 12px 16px;
`;

const FiltersButton = styled.TouchableOpacity`
  background-color: #6c47ff;
  padding: 10px 16px;
  border-radius: 20px;
`;

const FiltersButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;
