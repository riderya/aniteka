import React from 'react';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { View, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
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
  { slug: "score:desc", label: "За загальною оцінкою (спадання)" },
  { slug: "score:asc", label: "За загальною оцінкою (зростання)" },
  { slug: "start_date:desc", label: "За датою релізу (спадання)" },
  { slug: "start_date:asc", label: "За датою релізу (зростання)" },
  { slug: "media_type:desc", label: "За типом (спадання)" },
  { slug: "media_type:asc", label: "За типом (зростання)" },
];



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
  padding: ${(props) => props.vertical || 8}px;
  padding: 12px;
  /* background-color: ${(props) =>
  props.selected ? props.theme.colors.primary : props.theme.colors.inputBackground}; */
  margin: 4px 0px;
  border-radius: 12px;
  flex-direction: ${(props) => (props.row ? 'row' : 'column')};
  justify-content: ${(props) => (props.spaceBetween ? 'space-between' : 'flex-start')};
  align-items: ${(props) => (props.center ? 'center' : 'flex-start')};
`;

const ModalOptionText = styled.Text`
  color: ${(props) => (props.selected ? props.theme.colors.primary : props.theme.colors.gray)};
  font-weight: ${(props) => (props.bold ? 'bold' : 'normal')};
  font-size: 14px;
`;

const FilterButton = styled.TouchableOpacity`
  align-items: flex-start;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 12px;
  border-radius: 12px;
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.inputBackground : 'transparent'};
`;

const FilterButtonText = styled.Text`
  padding: ${({ selected }) => (selected ? '4px 12px' : '4px 0px')};
  color: ${({ selected, theme }) =>
    selected ? theme.colors.background : theme.colors.text};
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.primary : 'transparent'};
  border-radius: 8px;
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

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
`;

const Column = styled.View`
 flex: 1; 
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

const LabelName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray};
`;


const Checkbox = styled.View`
  width: 20px;
  height: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
background-color: ${({ selected, theme }) =>
  selected ? theme.colors.primary : theme.colors.card};
  border-radius: 6px;
  margin-right: 12px;
  align-items: center;
  justify-content: center;
`;

const CheckmarkText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: 14px;
  font-weight: bold;
`;


const SelectedValuesContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;


const FilterModal = ({
  visible,
  onClose,
  options,
  selected,
  toggleOption,
  labelKey = 'label',
  maxHeight = 350,
  title,
}) => (
<Modal visible={visible} transparent animationType="fade">
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
    
    {/* Клік по фону */}
    <TouchableOpacity
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      activeOpacity={1}
      onPress={onClose}
    />

    {/* НЕ обгортай ScrollView в TouchableWithoutFeedback */}
    <View style={{ overflow: 'hidden', borderRadius: 32 }}>
      <ModalContainer maxHeight={maxHeight}>
        {title && <ModalTitle>{title}</ModalTitle>}
        <ScrollView
          style={{ maxHeight: maxHeight - 50 }}
          keyboardShouldPersistTaps="handled"
        >
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
                center
              >
                <Checkbox selected={isSelected}>
                  <CheckmarkText>{isSelected ? '✓' : ''}</CheckmarkText>
                </Checkbox>
                <ModalOptionText selected={isSelected}>{label}</ModalOptionText>
              </ModalOption>
            );
          })}
        </ScrollView>
      </ModalContainer>
    </View>
  </View>
</Modal>

);


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
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
      
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={{ overflow: 'hidden', borderRadius: 32 }}>
        <ModalYearContainer maxHeight={maxHeight}>
          {title && <ModalTitle>{title}</ModalTitle>}
          <ScrollView
            style={{ maxHeight: maxHeight - 50 }}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <ModalOption
                  key={year}
                  onPress={() => onSelectYear(year)}
                  selected={isSelected}
                  row
                  center
                >
                  <Checkbox selected={isSelected}>
                    <CheckmarkText>{isSelected ? '✓' : ''}</CheckmarkText>
                  </Checkbox>
                  <ModalOptionText selected={isSelected}>{year}</ModalOptionText>
                </ModalOption>
              );
            })}
          </ScrollView>
        </ModalYearContainer>
      </View>
    </View>
  </Modal>
);


const SingleSelectModal = ({
  visible,
  onClose,
  options,
  selected,
  onSelect,
  maxHeight = 300,
  title,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
      
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={{ overflow: 'hidden', borderRadius: 32 }}>
        <ModalContainer maxHeight={maxHeight}>
          {title && <ModalTitle>{title}</ModalTitle>}
          <ScrollView
            style={{ maxHeight: maxHeight - 50 }}
            keyboardShouldPersistTaps="handled"
          >
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
                  row
                  center
                >
                  <Checkbox selected={isSelected}>
                    <CheckmarkText>{isSelected ? '✓' : ''}</CheckmarkText>
                  </Checkbox>
                  <ModalOptionText selected={isSelected}>{label}</ModalOptionText>
                </ModalOption>
              );
            })}
          </ScrollView>
        </ModalContainer>
      </View>
    </View>
  </Modal>
);


const renderSelectedLabelsAsTags = (selectedSlugs, options, labelKey = 'label', allGenres = []) => {
  if (!selectedSlugs.length) return <FilterButtonText>Не вибрано</FilterButtonText>;

  return selectedSlugs.map((slug) => {
    const found = allGenres.length
      ? allGenres.find((g) => g.slug === slug)
      : options.find((o) => o.slug === slug);
    const label = found ? found[labelKey] || slug : slug;

    return (
      <FilterButtonText key={slug} selected>
        {label}
      </FilterButtonText>
    );
  });
};




const hasSelection = (val) => {
  if (Array.isArray(val)) return val.length > 0;
  return Boolean(val);
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


<Column>
  <LabelName>Жанри</LabelName>
  <FilterButton
    selected={hasSelection(selectedGenres)}
    onPress={() =>
      setDropdownStates((prev) => ({
        ...prev,
        dropdownGenresVisible: true,
      }))
    }
  >
    <SelectedValuesContainer>
      {renderSelectedLabelsAsTags(selectedGenres, [], 'name_ua', allGenres)}
    </SelectedValuesContainer>
  </FilterButton>
</Column>



        {/* Категорії */}
<Column>
  <LabelName>Категорії</LabelName>
  <FilterButton
    selected={hasSelection(selectedMediaTypes)}
    onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownMediaVisible: true }))}
  >
    <SelectedValuesContainer>
      {renderSelectedLabelsAsTags(selectedMediaTypes, mediaTypeOptions)}
    </SelectedValuesContainer>
  </FilterButton>
</Column>


        {/* Студії */}
<Column>
  <LabelName>Студії</LabelName>
  <FilterButton
    selected={hasSelection(selectedStudios)}
    onPress={() =>
      setDropdownStates((prev) => ({ ...prev, dropdownStudiosVisible: true }))
    }
  >
    <SelectedValuesContainer>
      {renderSelectedLabelsAsTags(selectedStudios, studioOptions)}
    </SelectedValuesContainer>
  </FilterButton>
</Column>

        {/* Джерела */}
        <Column>
          <LabelName>Джерела</LabelName>
          <FilterButton
            selected={hasSelection(selectedSources)}
            onPress={() => 
              setDropdownStates((prev) => ({ ...prev, dropdownSourcesVisible: true }))
            }
          >
            <SelectedValuesContainer>
              {renderSelectedLabelsAsTags(selectedSources, sourceOptions)}
            </SelectedValuesContainer>
          </FilterButton>
        </Column>

        {/* Статус */}
        <Column>
          <LabelName>Статус</LabelName>
          <FilterButton
            selected={hasSelection(selectedStatuses)}
            onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownStatusVisible: true }))}
          >
            <SelectedValuesContainer>
              {renderSelectedLabelsAsTags(selectedStatuses, statusOptions)}
            </SelectedValuesContainer>
          </FilterButton>
        </Column>

        {/* Сезон */}
        <Row>
        <Column>
          <LabelName>Сезон</LabelName>
          <FilterButton
            selected={hasSelection(selectedSeasons)}
            onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownSeasonVisible: true }))}
          >
            <SelectedValuesContainer>
              {renderSelectedLabelsAsTags(selectedSeasons, seasonOptions)}
            </SelectedValuesContainer>
          </FilterButton>
        </Column>

        {/* Рейтинг */}
        <Column>
          <LabelName>Рейтинг</LabelName>
          <FilterButton
            selected={hasSelection(selectedRatings)}
            onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownRatingVisible: true }))}
          >
            <SelectedValuesContainer>
              {renderSelectedLabelsAsTags(selectedRatings, ratingOptions)}
            </SelectedValuesContainer>
          </FilterButton>
        </Column>
        </Row>

       <Row>
  {/* Рік від */}
  <Column>
    <LabelName>Рік виходу</LabelName>
    <FilterButton
      selected={hasSelection(yearFrom)}
      onPress={() =>
        setDropdownStates((prev) => ({ ...prev, dropdownYearFromVisible: true }))
      }
    >
      <FilterButtonText selected={hasSelection(yearFrom)}>
        Рік від: {yearFrom || 'не вибрано'}
      </FilterButtonText>
    </FilterButton>
  </Column>

  {/* Рік до */}
  <Column>
    <LabelName style={{ opacity: 0 }}>Прихований</LabelName>
    <FilterButton
      selected={hasSelection(yearTo)}
      onPress={() =>
        setDropdownStates((prev) => ({ ...prev, dropdownYearToVisible: true }))
      }
    >
      <FilterButtonText selected={hasSelection(yearTo)}>
        Рік до: {yearTo || 'не вибрано'}
      </FilterButtonText>
    </FilterButton>
  </Column>
</Row>


        {/* Сортування */}
        <Column>
          <LabelName>Сортування</LabelName>
          <FilterButton
            selected={hasSelection(selectedSort)}
            onPress={() => setDropdownStates((prev) => ({ ...prev, dropdownSortVisible: true }))}
          >
            <FilterButtonText selected={hasSelection(selectedSort)}>
              Сортування: {sortOptions.find((o) => o.slug === selectedSort)?.label || 'Не вибрано'}
            </FilterButtonText>
          </FilterButton>
        </Column>
      </ScrollView>

      {/* Кнопки знизу */}
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
  title="Жанри"
/>

<FilterModal
  visible={dropdownStates.dropdownMediaVisible}
  onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownMediaVisible: false }))}
  options={mediaTypeOptions}
  selected={selectedMediaTypes}
  toggleOption={toggleMediaType}
  title="Категорії"
/>

<FilterModal
  visible={dropdownStates.dropdownStudiosVisible}
  onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownStudiosVisible: false }))}
  options={studioOptions}
  selected={selectedStudios}
  toggleOption={toggleStudio}
  title="Студії"
/>

<FilterModal
  visible={dropdownStates.dropdownSourcesVisible}
  onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownSourcesVisible: false }))}
  options={sourceOptions}
  selected={selectedSources}
  toggleOption={toggleSource}
  title="Джерела"
/>

<FilterModal
  visible={dropdownStates.dropdownStatusVisible}
  onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownStatusVisible: false }))}
  options={statusOptions}
  selected={selectedStatuses}
  toggleOption={toggleStatus}
  title="Статус"
/>

<FilterModal
  visible={dropdownStates.dropdownSeasonVisible}
  onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownSeasonVisible: false }))}
  options={seasonOptions}
  selected={selectedSeasons}
  toggleOption={toggleSeason}
  title="Сезон"
/>

<FilterModal
  visible={dropdownStates.dropdownRatingVisible}
  onClose={() => setDropdownStates((prev) => ({ ...prev, dropdownRatingVisible: false }))}
  options={ratingOptions}
  selected={selectedRatings}
  toggleOption={toggleRating}
  title="Рейтинг"
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
  title="Сортування"
/>

    </>
  );
}
