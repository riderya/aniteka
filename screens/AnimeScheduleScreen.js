import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Switch,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  View,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import styled from 'styled-components/native';
import axios from 'axios';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import AnimeColumnCard from '../components/Cards/AnimeColumnCard';

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
const YEARS = Array.from({ length: 6 }, (_, i) => 2023 + i);

const groupByDay = (list) => {
  const daysOfWeek = {
    0: 'Неділя',
    1: 'Понеділок',
    2: 'Вівторок',
    3: 'Середа',
    4: 'Четвер',
    5: "Пʼятниця",
    6: 'Субота',
    unknown: 'Невідомо',
  };

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
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item);
    } else {
      if (!grouped['unknown']) grouped['unknown'] = [];
      grouped['unknown'].push(item);
    }
  });

  const groupedArray = Object.entries(grouped)
    .sort(([a], [b]) => {
      const order = [1, 2, 3, 4, 5, 6, 0, 'unknown'];
      return order.indexOf(Number(a)) - order.indexOf(Number(b));
    })
    .map(([key, value]) => ({
      day: daysOfWeek[key] || 'Невідомо',
      data: value,
    }));

  return { todayItems, groupedArray };
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = 115;
const numColumns = Math.floor(SCREEN_WIDTH / CARD_WIDTH);
const HEADER_HEIGHT = 60;

const AnimeScheduleScreen = () => {
  const [animeList, setAnimeList] = useState([]);
  const [groupedList, setGroupedList] = useState([]);
  const [todayList, setTodayList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(2025);
  const [season, setSeason] = useState('summer');
  const [status, setStatus] = useState(BASE_STATUSES);
  const [onlyWatch, setOnlyWatch] = useState(false);
  const [modalVisible, setModalVisible] = useState(null);
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.hikka.io/schedule/anime?page=1&size=100',
        {
          airing_season: [season, year],
          status,
          only_watch: onlyWatch,
        }
      );
      const list = response.data.list;
      setAnimeList(list);
      const { todayItems, groupedArray } = groupByDay(list);
      setTodayList(todayItems);
      setGroupedList(groupedArray);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [year, season, status, onlyWatch]);

  const resetFilters = () => {
    setYear(2025);
    setSeason('summer');
    setStatus(BASE_STATUSES);
    setOnlyWatch(false);
  };

  const onStatusChange = (value) => {
    const isSelected = status.includes(value);
    let newStatus = isSelected
      ? status.filter((s) => s !== value)
      : [...status, value];
    if (newStatus.length === 0) return;
    setStatus(newStatus);
  };

  const renderAnimeCard = ({ item, index }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
    return (
      <CardWrapper style={{ marginRight: isLastInRow ? 0 : 12 }}>
        <AnimeColumnCard
          anime={{ ...item.anime, watch: item.watch || [] }}
          onPress={() =>
            navigation.navigate('AnimeDetails', { slug: item.anime.slug })
          }
          cardWidth={CARD_WIDTH}
          imageWidth={CARD_WIDTH}
          imageHeight={165}
        />
      </CardWrapper>
    );
  };

  const renderModal = (type, options, selectedValues, onSelect) => (
    <Modal visible={modalVisible === type} transparent animationType="slide">
      <ModalBackdrop>
        <ModalContent>
          <ScrollView>
            {options.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <ModalOption
                  key={opt.value}
                  onPress={() => onSelect(opt.value)}
                  selected={isSelected}
                >
                  <ModalText>{opt.label}</ModalText>
                </ModalOption>
              );
            })}
          </ScrollView>
          <ModalClose onPress={() => setModalVisible(null)}>
            <ModalText>Закрити</ModalText>
          </ModalClose>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title="Календар" />
      </BlurOverlay>

      <ScrollContainer contentContainerStyle={{ paddingBottom: 20 }}>
        <FiltersContainer>
          <SelectBox onPress={() => setModalVisible('year')}>
            <SelectText>{year}</SelectText>
          </SelectBox>
          <SelectBox onPress={() => setModalVisible('season')}>
            <SelectText>
              {SEASONS.find((s) => s.value === season)?.label || 'Сезон'}
            </SelectText>
          </SelectBox>
          <SelectBox onPress={() => setModalVisible('status')}>
            <SelectText>
              {status.length === 0
                ? 'Статус'
                : STATUSES.filter((s) => status.includes(s.value))
                    .map((s) => s.label)
                    .join(', ')}
            </SelectText>
          </SelectBox>
          <SwitchRow>
            <Label>Аніме у списку</Label>
            <Switch value={onlyWatch} onValueChange={setOnlyWatch} />
          </SwitchRow>
          <ResetButton onPress={resetFilters}>
            <ResetText>Очистити</ResetText>
          </ResetButton>
        </FiltersContainer>

        {loading ? (
          <Center>
            <ActivityIndicator size="large" color="#fff" />
          </Center>
        ) : animeList.length === 0 ? (
          <Center>
            <NoDataText>Розклад аніме порожній</NoDataText>
          </Center>
        ) : (
          <>
            {todayList.length > 0 && (
              <DayGroup>
                <DayHeader>Сьогодні</DayHeader>
                <View style={{ paddingHorizontal: 12 }}>
                  <FlatList
                    data={todayList}
                    keyExtractor={(item, index) =>
                      `${item.anime.slug}-today-${index}`
                    }
                    renderItem={renderAnimeCard}
                    numColumns={numColumns}
                    scrollEnabled={false}
                  />
                </View>
              </DayGroup>
            )}

            {groupedList.map((group) => (
              <DayGroup key={group.day}>
                <DayHeader>{group.day}</DayHeader>
                <View style={{ paddingHorizontal: 12 }}>
                  <FlatList
                    data={group.data}
                    keyExtractor={(item, index) =>
                      `${item.anime.slug}-${index}`
                    }
                    renderItem={renderAnimeCard}
                    numColumns={numColumns}
                    scrollEnabled={false}
                  />
                </View>
              </DayGroup>
            ))}
          </>
        )}

        {renderModal(
          'year',
          YEARS.map((y) => ({ label: `${y}`, value: y })),
          [year],
          (val) => {
            setYear(val);
            setModalVisible(null);
          }
        )}
        {renderModal('season', SEASONS, [season], (val) => {
          setSeason(val);
          setModalVisible(null);
        })}
        {renderModal('status', STATUSES, status, onStatusChange)}
      </ScrollContainer>
    </SafeAreaView>
  );
};

// Styled Components
const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ScrollContainer = styled.ScrollView`
  padding-top: ${HEADER_HEIGHT}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const FiltersContainer = styled.View`
  margin: 0px 12px;
  gap: 12px;
`;

const SelectBox = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px;
`;

const SelectText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const SwitchRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

const ResetButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 14px 12px;
  border-radius: 12px;
  align-items: center;
`;

const ResetText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
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

const DayHeader = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
  margin: 12px;
`;

const DayGroup = styled.View`
  margin-top: 20px;
`;

const CardWrapper = styled.View`
  margin-bottom: 25px;
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

const ModalOption = styled.Pressable`
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const ModalText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
`;

const ModalClose = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 14px 12px;
  border-radius: 999px;
  margin-top: 12px;
  align-items: center;
`;

export default AnimeScheduleScreen;
