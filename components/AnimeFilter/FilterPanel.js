import React from 'react';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import {
  ScrollView,
  Modal,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import HeaderTitleBar from '../../components/Header/HeaderTitleBar';

const mediaTypeOptions = [
  { slug: 'special', label: 'Special' },
  { slug: 'movie', label: 'Movie' },
  { slug: 'music', label: 'Music' },
  { slug: 'ova', label: 'OVA' },
  { slug: 'ona', label: 'ONA' },
  { slug: 'tv', label: 'TV' },
];

const studioOptions = [
  { slug: 'kyoto-animation-d96090', label: 'Kyoto Animation' },
  { slug: 'madhouse-b52579', label: 'Madhouse' },
];

const sourceOptions = [
  { slug: "digital_manga", label: "Digital Manga" },
  { slug: "picture_book", label: "Picture Book" },
  { slug: "visual_novel", label: "Visual Novel" },
  { slug: "4_koma_manga", label: "4-Koma Manga" },
  { slug: "light_novel", label: "Light Novel" },
  { slug: "card_game", label: "Card Game" },
  { slug: "web_manga", label: "Web Manga" },
  { slug: "original", label: "Original" },
  { slug: "manga", label: "Manga" },
  { slug: "music", label: "Music" },
  { slug: "novel", label: "Novel" },
  { slug: "other", label: "Other" },
  { slug: "radio", label: "Radio" },
  { slug: "game", label: "Game" },
  { slug: "book", label: "Book" },
];

const statusOptions = [
  { slug: 'announced', label: 'Анонсовано' },
  { slug: 'finished', label: 'Завершено' },
  { slug: 'ongoing', label: 'Триває' },
];

const seasonOptions = [
  { slug: 'winter', label: 'Зима' },
  { slug: 'spring', label: 'Весна' },
  { slug: 'summer', label: 'Літо' },
  { slug: 'fall', label: 'Осінь' },
];

const ratingOptions = [
  { slug: 'r_plus', label: 'R+' },
  { slug: 'pg_13', label: 'PG-13' },
  { slug: 'pg', label: 'PG' },
  { slug: 'rx', label: 'RX' },
  { slug: 'g', label: 'G' },
  { slug: 'r', label: 'R' },
];

const sortOptions = [
  { slug: "score:desc", label: "За загальною оцінкою" },
  { slug: "start_date:desc", label: "За датою релізу" },
  { slug: "media_type:desc", label: "За типом" },
];

// Styled components

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0,0,0,0.6);
  justify-content: center;
  padding: 20px;
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

const ModalContainer = styled.ScrollView`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 32px;
  max-height: ${({ maxHeight }) => maxHeight}px;
  padding: 20px;
`;

const ModalYearContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 32px;
  max-height: ${({ maxHeight }) => maxHeight}px;
  padding: 20px;
`;

const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  margin-bottom: 10px;
`;

const ModalOption = styled.TouchableOpacity`
  padding-vertical: ${(props) => props.vertical || 8}px;
  padding: 12px;
  background-color: ${(props) =>
  props.selected ? props.theme.colors.primary : props.theme.colors.inputBackground};
  margin: 4px 0px;
  border-radius: 12px;
  flex-direction: ${(props) => (props.row ? 'row' : 'column')};
  justify-content: ${(props) => (props.spaceBetween ? 'space-between' : 'flex-start')};
  align-items: ${(props) => (props.center ? 'center' : 'flex-start')};
`;


const ModalOptionText = styled.Text`
  color: ${(props) => (props.selected ? props.theme.colors.background : props.theme.colors.gray)};
  font-weight: ${(props) => (props.bold ? 'bold' : 'normal')};
  font-size: ${(props) => props.fontSize || 14}px;
`;

const Checkmark = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;

const FilterButton = styled.TouchableOpacity`
  height: 55px;
  align-items: flex-start;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
  padding: 12px;
  border-radius: 12px;
`;

const FilterButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

const BottomButtonsContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding: 12px;
`;

const ApplyButton = styled.TouchableOpacity`
  flex: 1;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 16px;
  border-radius: 999px;
  margin-right: 10px;
`;

const ApplyButtonText = styled.Text`
  color: #fff;
  text-align: center;
  font-weight: bold;
`;

const ResetButton = styled.TouchableOpacity`
  flex: 1;
  padding: 16px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
`;

const ResetButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
  font-weight: bold;
`;

const Column = styled.View`
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

const LabelName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray};
`;

// Модалка для багатовибору
const FilterModal = ({
  visible,
  onClose,
  options,
  selected,
  toggleOption,
  labelKey = 'label',
  maxHeight = 350,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <ModalOverlay onPress={onClose} activeOpacity={1}>
      <ModalContainer maxHeight={maxHeight}>
        {options.map((option) => {
          const slug = option.slug;
          const isSelected = selected.includes(slug);
          const label = option[labelKey] || slug;

          return (
            <ModalOption
              key={slug}
              onPress={() => toggleOption(slug)}
              selected={isSelected}
              row
              spaceBetween
              center
            >
              <ModalOptionText selected={isSelected}>{label}</ModalOptionText>
              {isSelected && <Checkmark>✓</Checkmark>}
            </ModalOption>
          );
        })}
      </ModalContainer>
    </ModalOverlay>
  </Modal>
);

// Модалка для вибору одного року
const YearFilterModal = ({
  visible,
  onClose,
  options,
  selectedYear,
  onSelectYear,
  title,
  maxHeight = 300,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <ModalOverlay onPress={onClose} activeOpacity={1}>
      <ModalYearContainer maxHeight={maxHeight}>
        <ModalTitle>{title}</ModalTitle>
        <ScrollView>
          {options.map((year) => {
            const isSelected = selectedYear === year;
            return (
              <ModalOption
                key={year}
                onPress={() => onSelectYear(year)}
                selected={isSelected}
              >
                <ModalOptionText selected={isSelected}>{year}</ModalOptionText>
              </ModalOption>
            );
          })}
        </ScrollView>
      </ModalYearContainer>
    </ModalOverlay>
  </Modal>
);

// Модалка для вибору одного елемента сортування
const SingleSelectModal = ({
  visible,
  onClose,
  options,
  selected,
  onSelect,
  maxHeight = 300,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <ModalOverlay onPress={onClose} activeOpacity={1}>
      <ModalContainer maxHeight={maxHeight}>
        {options.map(({ slug, label }) => {
          const isSelected = selected === slug;
          return (
            <ModalOption
              key={slug}
              onPress={() => {
                onSelect(slug);
                onClose();
              }}
              selected={isSelected}
              vertical={12}
              horizontal={16}
            >
              <ModalOptionText selected={isSelected} fontSize={16}>
                {label}
              </ModalOptionText>
            </ModalOption>
          );
        })}
      </ModalContainer>
    </ModalOverlay>
  </Modal>
);

// Функція для відображення вибраних лейблів
const renderSelectedLabels = (selectedSlugs, options, labelKey = 'label', allGenres = []) => {
  if (!selectedSlugs.length) return 'Не вибрано';
  return selectedSlugs
    .map((slug) => {
      if (allGenres.length) {
        const found = allGenres.find((g) => g.slug === slug);
        return found ? found[labelKey] || slug : slug;
      } else {
        const found = options.find((o) => o.slug === slug);
        return found ? found[labelKey] || slug : slug;
      }
    })
    .join(', ');
};

export default function AnimeFilters({
  allGenres,
  filters,
  toggleGenre,
  toggleMediaType,
  toggleStudio,
  toggleSource,
  toggleStatus,
  toggleSeason,
  toggleRating,
  selectYearFrom,
  selectYearTo,
  setSelectedSort,
  dropdownStates,
  setDropdownStates,
  yearsList,
  applyFilters,
  resetFilters,
}) {
  const {
    selectedGenres,
    selectedMediaTypes,
    selectedStudios,
    selectedSources,
    selectedStatuses,
    selectedSeasons,
    selectedRatings,
    yearFrom,
    yearTo,
    selectedSort,
  } = filters;
  const { theme, isDark } = useTheme();

  return (
    <>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title='Фільтр' />
      </BlurOverlay>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 100, paddingBottom: 100, paddingLeft: 12, paddingRight: 12 }}>
        {/* Жанри */}
        <Column>
        <LabelName>Жанри</LabelName>
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownGenresVisible: true }))}
        >
          <FilterButtonText>
            {renderSelectedLabels(selectedGenres, [], 'name_ua', allGenres)}
          </FilterButtonText>
        </FilterButton>
        </Column>

        {/* Категорії */}
        <Column>
        <LabelName>Категорії</LabelName>
        <FilterButton
          mb={16}
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownMediaVisible: true }))}
        >
          <FilterButtonText>
            {renderSelectedLabels(selectedMediaTypes, mediaTypeOptions)}
          </FilterButtonText>
        </FilterButton>
        </Column>

        {/* Студії */}
        <Column>
        <LabelName>Студії</LabelName>
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownStudiosVisible: true }))}
        >
          <FilterButtonText>
            {renderSelectedLabels(selectedStudios, studioOptions)}
          </FilterButtonText>
        </FilterButton>
        </Column>

        {/* Джерела */}
        <Column>
        <LabelName>Джерела</LabelName>
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownSourcesVisible: true }))}
        >
          <FilterButtonText>
            {renderSelectedLabels(selectedSources, sourceOptions)}
          </FilterButtonText>
        </FilterButton>
        </Column>

        {/* Статус */}
        <Column>
        <LabelName>Статус</LabelName>
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownStatusVisible: true }))}
        >
          <FilterButtonText>
            {renderSelectedLabels(selectedStatuses, statusOptions)}
          </FilterButtonText>
        </FilterButton>
        </Column>

        {/* Сезон */}
        <Column>
        <LabelName>Сезон</LabelName>
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownSeasonVisible: true }))}
        >
          <FilterButtonText>
            {renderSelectedLabels(selectedSeasons, seasonOptions)}
          </FilterButtonText>
        </FilterButton>
        </Column>

        {/* Рейтинг */}
        <Column>
        <LabelName>Рейтинг</LabelName>
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownRatingVisible: true }))}
        >
          <FilterButtonText>
            {renderSelectedLabels(selectedRatings, ratingOptions)}
          </FilterButtonText>
        </FilterButton>
        </Column>

        {/* Рік від */}
        <Column>
        <LabelName>Рік виходу</LabelName>
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownYearFromVisible: true }))}
        >
          <FilterButtonText>Рік від: {yearFrom || 'не вибрано'}</FilterButtonText>
        </FilterButton>

        {/* Рік до */}
        <FilterButton
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownYearToVisible: true }))}
        >
          <FilterButtonText>Рік до: {yearTo || 'не вибрано'}</FilterButtonText>
        </FilterButton>
        </Column>

        {/* Сортування */}
        <Column>
        <LabelName>Сортування</LabelName>
        <FilterButton
          mb={16}
          onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownSortVisible: true }))}
        >
          <FilterButtonText>
            Сортування: {sortOptions.find((o) => o.slug === selectedSort)?.label || 'Не вибрано'}
          </FilterButtonText>
        </FilterButton>
        </Column>
      </ScrollView>

      {/* Фіксовані кнопки знизу */}
      <BottomButtonsContainer>
        <ResetButton onPress={resetFilters}>
          <ResetButtonText>Скинути</ResetButtonText>
        </ResetButton>
        
        <ApplyButton onPress={applyFilters}>
          <ApplyButtonText>Застосувати</ApplyButtonText>
        </ApplyButton>
      </BottomButtonsContainer>

      {/* Модалки */}
      <FilterModal
        visible={dropdownStates.dropdownGenresVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownGenresVisible: false }))}
        options={allGenres}
        selected={selectedGenres}
        toggleOption={toggleGenre}
        labelKey="name_ua"
      />

      <FilterModal
        visible={dropdownStates.dropdownMediaVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownMediaVisible: false }))}
        options={mediaTypeOptions}
        selected={selectedMediaTypes}
        toggleOption={toggleMediaType}
      />

      <FilterModal
        visible={dropdownStates.dropdownStudiosVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownStudiosVisible: false }))}
        options={studioOptions}
        selected={selectedStudios}
        toggleOption={toggleStudio}
      />

      <FilterModal
        visible={dropdownStates.dropdownSourcesVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownSourcesVisible: false }))}
        options={sourceOptions}
        selected={selectedSources}
        toggleOption={toggleSource}
      />

      <FilterModal
        visible={dropdownStates.dropdownStatusVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownStatusVisible: false }))}
        options={statusOptions}
        selected={selectedStatuses}
        toggleOption={toggleStatus}
      />

      <FilterModal
        visible={dropdownStates.dropdownSeasonVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownSeasonVisible: false }))}
        options={seasonOptions}
        selected={selectedSeasons}
        toggleOption={toggleSeason}
      />

      <FilterModal
        visible={dropdownStates.dropdownRatingVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownRatingVisible: false }))}
        options={ratingOptions}
        selected={selectedRatings}
        toggleOption={toggleRating}
      />

      <YearFilterModal
        visible={dropdownStates.dropdownYearFromVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownYearFromVisible: false }))}
        options={yearsList}
        selectedYear={yearFrom}
        onSelectYear={selectYearFrom}
        title="Рік від"
      />

      <YearFilterModal
        visible={dropdownStates.dropdownYearToVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownYearToVisible: false }))}
        options={yearsList}
        selectedYear={yearTo}
        onSelectYear={selectYearTo}
        title="Рік до"
      />

      <SingleSelectModal
        visible={dropdownStates.dropdownSortVisible}
        onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownSortVisible: false }))}
        options={sortOptions}
        selected={selectedSort}
        onSelect={setSelectedSort}
      />
    </>
  );
}
