import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Switch,
  FlatList,
  Dimensions,
  Modal,
  View,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import * as SecureStore from 'expo-secure-store';
import styled from 'styled-components/native';
import axios from 'axios';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import AnimeColumnCard from '../components/Cards/AnimeColumnCard';
import { FontAwesome6 } from '@expo/vector-icons';

const SEASONS = [
  { label: 'Зима', value: 'winter' },
  { label: 'Весна', value: 'spring' },
  { label: 'Літо', value: 'summer' },
  { label: 'Осінь', value: 'fall' },
];

const STATUSES = [
  { label: 'Онґоінґ', value: 'ongoing' },
  { label: 'Анонсовано', value: 'announced' },
  { label: 'Припинено', value: 'discontinued' },
  { label: 'Завершено', value: 'finished' },
  { label: 'На паузі', value: 'paused' },
];

const BASE_STATUSES = ['ongoing', 'announced'];

const groupByDay = (list) => {
  const daysOfWeek = {
    0: 'Неділя',
    1: 'Понеділок',
    2: 'Вівторок',
    3: 'Середа',
    4: 'Четвер',
    5: 'Пʼятниця',
    6: 'Субота',
    unknown: 'Невідомо',
  };

  const months = [
    'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
    'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
  ];

  const grouped = {};
  const todayUnix = new Date().setHours(0, 0, 0, 0);
  const todayItems = [];

  list.forEach((item) => {
    if (item.airing_at && item.airing_at > 0) {
      const airingDate = new Date(item.airing_at * 1000);
      const airingDayUnix = new Date(airingDate).setHours(0, 0, 0, 0);

      if (airingDayUnix === todayUnix) {
        todayItems.push(item);
        return;
      }

      const day = airingDate.getDay();
      const key = airingDayUnix;

      if (!grouped[key]) {
        grouped[key] = {
          dayOfWeek: day,
          dateString: `${airingDate.getDate()} ${months[airingDate.getMonth()]}`,
          items: [],
        };
      }
      grouped[key].items.push(item);
    } else {
      if (!grouped['unknown']) {
        grouped['unknown'] = {
          dayOfWeek: 'unknown',
          dateString: null,
          items: [],
        };
      }
      grouped['unknown'].items.push(item);
    }
  });

  const groupedArray = Object.entries(grouped)
    .sort(([a], [b]) => a - b)
    .map(([key, { dayOfWeek, dateString, items }]) => ({
      day: daysOfWeek[dayOfWeek] || 'Невідомо',
      date: dateString,
      data: items,
    }));

  return { todayItems, groupedArray };
};

const GreenDot = React.memo(() => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: 12,
        height: 12,
        backgroundColor: '#4caf50',
        borderRadius: 6,
        transform: [{ scale }],
      }}
    />
  );
});

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = 115;
const numColumns = Math.floor(SCREEN_WIDTH / CARD_WIDTH);
const HEADER_HEIGHT = 60;

// Константи для висот елементів
const FILTER_BUTTON_HEIGHT = 80;
const DAY_HEADER_HEIGHT = 60;
const CARD_HEIGHT = 200;
const CARD_MARGIN = 15;

const AnimeScheduleScreen = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const YEARS = useMemo(() => {
    const startYear = 2023;
    const yearsCount = currentYear - startYear + 1;
    return Array.from({ length: yearsCount }, (_, i) => startYear + i);
  }, [currentYear]);
  
  const [year, setYear] = useState(currentYear);
  const [season, setSeason] = useState('summer');
  const [status, setStatus] = useState(BASE_STATUSES);
  const [onlyWatch, setOnlyWatch] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Тимчасові значення для фільтрів в модальному вікні
  const [tempYear, setTempYear] = useState(currentYear);
  const [tempSeason, setTempSeason] = useState('summer');
  const [tempStatus, setTempStatus] = useState(BASE_STATUSES);
  const [tempOnlyWatch, setTempOnlyWatch] = useState(false);
  
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Мемоізовані дані для сьогоднішньої дати
  const todayDateString = useMemo(() => {
    const months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
    return `${new Date().getDate()} ${months[new Date().getMonth()]}`;
  }, []);

  // Мемоізована групування даних
  const groupedData = useMemo(() => {
    if (!animeList.length) return { todayItems: [], groupedArray: [] };
    return groupByDay(animeList);
  }, [animeList]);

  // Оптимізована структура даних для FlatList
  const flatListData = useMemo(() => {
    if (!animeList.length) return [];
    
    const { todayItems, groupedArray } = groupedData;
    const data = [];
    
    // Додаємо кнопку фільтрів як перший елемент
    data.push({ type: 'filterButton', id: 'filterButton' });
    
    // Додаємо сьогоднішні аніме якщо є
    if (todayItems.length > 0) {
      data.push({ 
        type: 'dayHeader', 
        id: 'today-header',
        title: 'Сьогодні',
        date: todayDateString,
        isToday: true
      });
      data.push({ type: 'animeGrid', id: 'today-anime', data: todayItems });
    }
    
    // Додаємо інші дні
    groupedArray.forEach((group, index) => {
      data.push({ 
        type: 'dayHeader', 
        id: `day-${index}`,
        title: group.day,
        date: group.date
      });
      data.push({ type: 'animeGrid', id: `anime-${index}`, data: group.data });
    });
    
    return data;
  }, [groupedData, todayDateString]);

  // Мемоізована функція навігації
  const handleAnimePress = useCallback((slug) => {
    navigation.navigate('AnimeDetails', { slug });
  }, [navigation]);

  // Мемоізовані функції рендерингу для кращої продуктивності
  const renderAnimeCard = useCallback(({ item, index }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
    return (
      <CardWrapper style={{ marginRight: isLastInRow ? 0 : 12 }}>
        <AnimeColumnCard
          anime={item.anime}
          onPress={() => handleAnimePress(item.anime.slug)}
          cardWidth={CARD_WIDTH}
          imageWidth={CARD_WIDTH}
          imageHeight={165}
        />
      </CardWrapper>
    );
  }, [handleAnimePress]);

  const renderFilterButton = useCallback(() => (
    <FilterButtonContainer>
      <FilterButton onPress={handleFilterPress}>
        <FontAwesome6 name="filter" size={18} color={theme.colors.gray} />
        <FilterButtonText>Фільтр</FilterButtonText>
      </FilterButton>
    </FilterButtonContainer>
  ), [handleFilterPress]);

  const renderDayHeader = useCallback(({ title, date, isToday }) => {
    if (!title) {
      console.warn('renderDayHeader: no title provided');
      return <View style={{ height: DAY_HEADER_HEIGHT }} />;
    }
    
    return (
      <DayHeaderContainer style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DayTitle>{title}</DayTitle>
        </View>
        {date && (
          <DayDate>
            <DateText>{date}</DateText>
          </DayDate>
        )}
        {isToday && <GreenDot />}
      </DayHeaderContainer>
    );
  }, []);

  // Оптимізований рендеринг сітки аніме без вкладених FlatList
  const renderAnimeGrid = useCallback(({ data }) => {
    if (!data || data.length === 0) {
      console.warn('renderAnimeGrid: no data provided');
      return <View style={{ paddingHorizontal: 12, height: 100 }} />;
    }
    
    const rows = [];
    for (let i = 0; i < data.length; i += numColumns) {
      const rowItems = data.slice(i, i + numColumns);
      const row = (
        <View key={`row-${i}`} style={{ flexDirection: 'row', marginBottom: CARD_MARGIN }}>
          {rowItems.map((item, index) => {
            if (!item || !item.anime) {
              console.warn('renderAnimeGrid: invalid item at index', i + index);
              return null;
            }
            
            const isLastInRow = (i + index + 1) % numColumns === 0;
            return (
              <CardWrapper key={`${item.anime.slug}-${i + index}`} style={{ marginRight: isLastInRow ? 0 : 12 }}>
                <AnimeColumnCard
                  anime={item.anime}
                  onPress={() => handleAnimePress(item.anime.slug)}
                  cardWidth={CARD_WIDTH}
                  imageWidth={CARD_WIDTH}
                  imageHeight={165}
                />
              </CardWrapper>
            );
          })}
        </View>
      );
      rows.push(row);
    }
    
    return (
      <View style={{ paddingHorizontal: 12 }}>
        {rows}
      </View>
    );
  }, [handleAnimePress]);

  const renderItem = useCallback(({ item }) => {
    if (!item) {
      console.warn('renderItem: item is null or undefined');
      return null;
    }
    
    switch (item.type) {
      case 'filterButton':
        return renderFilterButton();
      case 'dayHeader':
        return renderDayHeader(item);
      case 'animeGrid':
        return renderAnimeGrid(item);
      default:
        console.warn('renderItem: unknown item type:', item.type);
        return null;
    }
  }, [renderFilterButton, renderDayHeader, renderAnimeGrid]);

  // Оптимізований keyExtractor
  const keyExtractor = useCallback((item) => item.id, []);

  // Оптимізований getItemLayout з попередньо обчисленими висотами
  const getItemLayout = useCallback((data, index) => {
    if (!data || !data[index]) {
      return {
        length: 100,
        offset: 100 * index,
        index,
      };
    }
    
    const item = data[index];
    let height = FILTER_BUTTON_HEIGHT; // базова висота для кнопки фільтрів
    
    if (item.type === 'dayHeader') {
      height = DAY_HEADER_HEIGHT;
    } else if (item.type === 'animeGrid') {
      const rows = Math.ceil(item.data.length / numColumns);
      height = rows * CARD_HEIGHT + (rows - 1) * CARD_MARGIN + 40; // збільшена висота сітки аніме
    }
    
    return {
      length: height,
      offset: height * index,
      index,
    };
  }, [numColumns]);

const fetchSchedule = useCallback(async () => {
  setLoading(true);
  try {
    let axiosConfig = {};
    const token = await SecureStore.getItemAsync('hikka_token');
    if (token) {
      axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Cookie: `auth=${token}`,
        },
        withCredentials: true,
      };
    }
    const response = await axios.post(
      'https://api.hikka.io/schedule/anime?page=1&size=100',
      {
        airing_season: [season, year],
        status,
        only_watch: onlyWatch,
      },
      axiosConfig
    );

    const list = response.data.list;
    setAnimeList(list);
  } catch (err) {
    console.error('Error fetching schedule:', err);
  } finally {
    setLoading(false);
  }
}, [season, year, status, onlyWatch]);

// Мемоізовані колбеки для кращої продуктивності
const handleFilterPress = useCallback(() => {
  setTempYear(year);
  setTempSeason(season);
  setTempStatus(status);
  setTempOnlyWatch(onlyWatch);
  setFilterModalVisible(true);
}, [year, season, status, onlyWatch]);

const handleApplyFilters = useCallback(() => {
  setYear(tempYear);
  setSeason(tempSeason);
  setStatus(tempStatus);
  setOnlyWatch(tempOnlyWatch);
  setFilterModalVisible(false);
}, [tempYear, tempSeason, tempStatus, tempOnlyWatch]);

const handleCloseModal = useCallback(() => {
  setFilterModalVisible(false);
}, []);

  useEffect(() => {
    fetchSchedule();
  }, [year, season, status, onlyWatch]);

  const resetFilters = useCallback(() => {
    setTempYear(currentYear);
    setTempSeason('summer');
    setTempStatus(BASE_STATUSES);
    setTempOnlyWatch(false);
  }, [currentYear]);

  const onStatusChange = useCallback((value) => {
    setTempStatus([value]);
  }, []);

  const RadioButton = React.memo(({ checked }) => (
    <RadioButtonContainer checked={checked}>
      {checked && <RadioButtonInner />}
    </RadioButtonContainer>
  ));

  const renderFilterModal = useCallback(() => (
    <Modal visible={filterModalVisible} transparent animationType="slide">
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Фільтри</ModalTitle>
            <CloseButton onPress={handleCloseModal}>
              <CloseButtonText>✕</CloseButtonText>
            </CloseButton>
          </ModalHeader>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Рік */}
            <FilterSection>
              <FilterSectionTitle>Рік</FilterSectionTitle>
              <FilterOptions>
                {YEARS.map((y) => (
                  <FilterOption 
                    key={y} 
                    onPress={() => setTempYear(y)}
                    isSelected={tempYear === y}
                  >
                    <RadioButton checked={tempYear === y} />
                    <FilterOptionText isSelected={tempYear === y}>{y}</FilterOptionText>
                  </FilterOption>
                ))}
              </FilterOptions>
            </FilterSection>

            {/* Сезон */}
            <FilterSection>
              <FilterSectionTitle>Сезон</FilterSectionTitle>
              <FilterOptions>
                {SEASONS.map((s) => (
                  <FilterOption 
                    key={s.value} 
                    onPress={() => setTempSeason(s.value)}
                    isSelected={tempSeason === s.value}
                  >
                    <RadioButton checked={tempSeason === s.value} />
                    <FilterOptionText isSelected={tempSeason === s.value}>{s.label}</FilterOptionText>
                  </FilterOption>
                ))}
              </FilterOptions>
            </FilterSection>

            {/* Статус */}
            <FilterSection>
              <FilterSectionTitle>Статус</FilterSectionTitle>
              <FilterOptions>
                {STATUSES.map((s) => {
                  const isSelected = tempStatus.includes(s.value);
                  return (
                    <FilterOption 
                      key={s.value} 
                      onPress={() => onStatusChange(s.value)}
                      isSelected={isSelected}
                    >
                      <RadioButton checked={isSelected} />
                      <FilterOptionText isSelected={isSelected}>{s.label}</FilterOptionText>
                    </FilterOption>
                  );
                })}
              </FilterOptions>
            </FilterSection>

            {/* Аніме у списку */}
            <FilterSection>
              <SwitchRow>
                <Label>Аніме у списку</Label>
                <Switch value={tempOnlyWatch} onValueChange={setTempOnlyWatch} />
              </SwitchRow>
            </FilterSection>
          </ScrollView>

          <ModalActions>
            <ResetButton onPress={resetFilters}>
              <ResetText>Очистити</ResetText>
            </ResetButton>
            <ApplyButton onPress={handleApplyFilters}>
              <ApplyText>Застосувати</ApplyText>
            </ApplyButton>
          </ModalActions>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  ), [filterModalVisible, tempYear, tempSeason, tempStatus, tempOnlyWatch, YEARS, SEASONS, STATUSES, onStatusChange, resetFilters, handleApplyFilters, handleCloseModal]);

  return (
    <FlatListContainer>
      <HeaderTitleBar title="Календар" />
      
      {loading ? (
        <Center>
          <ActivityIndicator size="large" color="#fff" />
        </Center>
      ) : animeList.length === 0 ? (
        <Center>
          <NoDataText>Розклад аніме порожній</NoDataText>
        </Center>
      ) : (
        <FlatList
          data={flatListData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingTop: insets.top + 56 + 20,
            paddingBottom: 20 + insets.bottom,
          }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={3}
          initialNumToRender={2}
          updateCellsBatchingPeriod={100}
          onEndReachedThreshold={0.1}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          disableVirtualization={false}
          legacyImplementation={false}
          scrollEventThrottle={16}
        />
      )}

      {renderFilterModal()}
    </FlatListContainer>
  );
};

const FlatListContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
`;

const SwitchRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const ResetButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 14px 12px;
  border-radius: 12px;
  align-items: center;
`;

const ResetText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight: bold;
`;

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NoDataText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

const DayGroup = styled.View`
  margin-top: 20px;
`;

const DayHeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 0px 12px;
  margin-bottom: 20px;
  margin-top: 10px;
  gap: 10px;
`;

const DayTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
`;

const DayDate = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 4px 10px;
  border-radius: 999px;
`;

const DateText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-weight: bold;
  font-size: 14px;
`;


const CardWrapper = styled.View`
  margin-bottom: 15px;
`;

const ModalBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.View`
  background-color:  ${({ theme }) => theme.colors.card};
  border-radius: 32px;
  padding: 20px;
  max-height: 80%;
`;



const RadioButtonContainer = styled.View`
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border-width: 2px;
  border-color: ${({ theme, checked }) => 
    checked ? theme.colors.primary : theme.colors.border};
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, checked }) => 
    checked ? `${theme.colors.primary}20` : 'transparent'};
`;

const RadioButtonInner = styled.View`
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 999px;
`;

const FilterButtonContainer = styled.View`
  margin: 0px 12px;
  margin-bottom: 12px;
`;

const FilterButton = styled.TouchableOpacity`
  padding: 8px 16px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const FilterButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight: bold;
`;

const FilterIcon = styled.Text`
  font-size: 16px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: bold;
`;

const CloseButton = styled.TouchableOpacity`
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
`;

const CloseButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: bold;
`;

const FilterSection = styled.View`
  margin-bottom: 20px;
`;

const FilterSectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const FilterOptions = styled.View`
  gap: 8px;
`;

const FilterOption = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: transparent;
  border-radius: 8px;
  gap: 12px;
`;

const FilterOptionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

const ModalActions = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const ApplyButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 14px 12px;
  border-radius: 12px;
  align-items: center;
`;

const ApplyText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-weight: bold;
`;


export default AnimeScheduleScreen;
