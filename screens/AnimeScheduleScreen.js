import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Switch,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  View,
  SafeAreaView,
  Animated,
  Easing,
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

const GreenDot = () => {
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
  const insets = useSafeAreaInsets();

const fetchSchedule = async () => {
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
        only_watch: onlyWatch,  // передаємо true або false
      },
      axiosConfig
    );

    const list = response.data.list;
    const { todayItems, groupedArray } = groupByDay(list);
    setAnimeList(list);
    setTodayList(todayItems);
    setGroupedList(groupedArray);
  } catch (err) {
    
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
          anime={item.anime}
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

  const Checkbox = ({ checked }) => (
  <CheckboxContainer>
    {checked && <CheckboxInner />}
  </CheckboxContainer>
);

const renderModal = (type, options, selectedValues, onSelect) => (
  <Modal visible={modalVisible === type} transparent animationType="slide">
    <ModalBackdrop>
      <ModalContent>
        <ScrollView>
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <ModalOption key={opt.value} onPress={() => onSelect(opt.value)}>
                <ModalOptionRow>
                  <Checkbox checked={isSelected} />
                  <ModalText>{opt.label}</ModalText>
                </ModalOptionRow>
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
    <>
      <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title="Календар" />
      </BlurOverlay>

      <ScrollContainer insets={insets}>
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
    <DayHeaderContainer style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <DayTitle>Сьогодні</DayTitle>
      </View>
      <DayDate>
        <DateText>
          {new Date().getDate()}{' '}
          {['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'][new Date().getMonth()]}
        </DateText>
      </DayDate>
      <GreenDot />
    </DayHeaderContainer>

    <View style={{ paddingHorizontal: 12 }}>
      <FlatList
        data={todayList}
        keyExtractor={(item, index) => `${item.anime.slug}-today-${index}`}
        renderItem={renderAnimeCard}
        numColumns={numColumns}
        scrollEnabled={false}
      />
    </View>
  </DayGroup>
)}


{groupedList.map((group, index) => (
  <DayGroup key={`${group.day}-${index}`}>
    <DayHeaderContainer>
      <DayTitle>{group.day}</DayTitle>
      {group.date && (
        <DayDate>
          <DateText>{group.date}</DateText>
        </DayDate>
      )}
    </DayHeaderContainer>

    <View style={{ paddingHorizontal: 12 }}>
      <FlatList
        data={group.data}
        keyExtractor={(item, i) => `${item.anime.slug}-${i}`}
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
      </>
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
  padding-top: ${(props) => props.insets.top + HEADER_HEIGHT}px;
  padding-bottom: ${(props) => props.insets.bottom}px;
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
  font-weight: 500;
  font-size: 14px;
`;

const ModalClose = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 14px 12px;
  border-radius: 999px;
  margin-top: 12px;
  align-items: center;
`;

const ModalOptionRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const CheckboxContainer = styled.View`
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.borderInput};
  justify-content: center;
  align-items: center;
`;

const CheckboxInner = styled.View`
  width: 10px;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 999px;
`;


export default AnimeScheduleScreen;
