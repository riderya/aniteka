import React, { useState, useEffect } from 'react';
import {
  TextInput,
  FlatList,
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

import avatarFallback from '../assets/image/image404.png';
import noSearchImage from '../assets/image/noSearchImage.png';

const API_ANIME = 'https://api.hikka.io/anime';
const API_CHARACTERS = 'https://api.hikka.io/characters';
const API_COMPANIES = 'https://api.hikka.io/companies';
const API_PEOPLE = 'https://api.hikka.io/people';
const API_USERS = 'https://api.hikka.io/user/list';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('anime');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const HISTORY_KEY = 'search_history';

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error('Failed to load search history', err);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (err) {
      console.error('Failed to save search history', err);
    }
  };

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (type === 'anime') {
          response = await axios.post(API_ANIME, { query });
        } else if (type === 'characters') {
          response = await axios.post(API_CHARACTERS, { query });
        } else if (type === 'companies') {
          response = await axios.post(API_COMPANIES, { query, type: "studio" });
        } else if (type === 'people') {
          response = await axios.post(API_PEOPLE, { query });
        } else if (type === 'users') {
          response = await axios.post(API_USERS, { query });
        }
        const list = type === 'users' ? response?.data : response?.data?.list;
        setResults(list || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, type]);

  const handleSubmit = () => {
    if (query.trim().length >= 3) {
      setHistory((prev) => {
        const trimmed = query.trim();
        const filtered = prev.filter((item) => item !== trimmed);
        const newHistory = [trimmed, ...filtered].slice(0, 20);
        saveHistory(newHistory);
        return newHistory;
      });
      Keyboard.dismiss();
    }
  };
  

  const handleHistoryPress = (term) => {
    setQuery(term);
  };

  const handleDeleteHistoryItem = (termToDelete) => {
    const newHistory = history.filter((item) => item !== termToDelete);
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    AsyncStorage.removeItem(HISTORY_KEY);
  };

  const handlePress = (item) => {
    if (type === 'anime') {
      navigation.navigate('AnimeDetails', { slug: item.slug });
    } else if (type === 'characters') {
      navigation.navigate('AnimeCharacterDetailsScreen', {
        slug: item.slug,
        name_ua: item.name_ua,
      });
    } else if (type === 'companies') {
      navigation.navigate('CompanyDetailsScreen', { slug: item.slug });
    } else if (type === 'people') {
      navigation.navigate('AnimePeopleDetailsScreen', { slug: item.slug, })
    } else if (type === 'users') {
      navigation.navigate('UserProfileScreen', { reference: item.reference });
    }
  };

  const media_Type = {
    tv: 'ТБ-серіал',
    movie: 'Фільм',
    ova: 'OVA',
    ona: 'ONA',
    special: 'Спешл',
    music: 'Музичне',
  };

  return (
    <Container>
      <BlurHeader intensity={100} tint={isDark ? 'dark' : 'light'}>
        <Row>
          <ButtonBack onPress={() => navigation.goBack()}>
            <StyledInfo name="arrow-back-outline" />
          </ButtonBack>

          <Input
            placeholder={
              type === 'anime'
                ? 'Пошук аніме...'
                : type === 'characters'
                ? 'Пошук персонажів...'
                : type === 'companies'
                ? 'Пошук компаній...'
                : type === 'people'
                ? 'Пошук людей...'
                : 'Пошук користувачів...'
            }
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />

          {query.length > 0 && (
            <ClearButton onPress={() => setQuery('')}>
              <StyledInfo name="close-outline" />
            </ClearButton>
          )}
        </Row>

        <ScrollRow horizontal showsHorizontalScrollIndicator={false}>
          {['anime', 'characters', 'companies', 'people', 'users'].map((t) => (
            <Button key={t} isActive={type === t} onPress={() => setType(t)}>
              <ButtonText isActive={type === t}>
                {t === 'anime'
                  ? 'Аніме'
                  : t === 'characters'
                  ? 'Персонажі'
                  : t === 'companies'
                  ? 'Компанії'
                  : t === 'people'
                  ? 'Люди'
                  : 'Користувачі'}
              </ButtonText>
            </Button>
          ))}
        </ScrollRow>
      </BlurHeader>

      {loading && <ActivityIndicator size="large" color="#555" />}

      {query.length < 3 && history.length > 0 && (
  <HistoryWrapper>
    <HistoryTitle>Історія пошуку</HistoryTitle>

    <ScrollView showsVerticalScrollIndicator={false}>
      {history.map((term, index) => (
        <HistoryItemRow key={index}>
          <TouchableOpacity onPress={() => handleHistoryPress(term)}>
            <HistoryItem>{term}</HistoryItem>
          </TouchableOpacity>
          <DeleteButton onPress={() => handleDeleteHistoryItem(term)}>
            <Ionicons name="close" size={16} color="#999" />
          </DeleteButton>
        </HistoryItemRow>
      ))}
    </ScrollView>

    <ClearAllButton onPress={handleClearAllHistory}>
      <ClearAllText>Очистити все</ClearAllText>
    </ClearAllButton>
  </HistoryWrapper>
)}


      <FlatList
        contentContainerStyle={{ paddingTop: 150 }}
        data={results}
        keyExtractor={(item) => item.slug || item.reference}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <Item>
              {type === 'users' ? (
                <>
                  <Thumbnail source={{ uri: item.avatar || 'https://i.imgur.com/R8uKmI0.png' }} />
                  <Content>
                    <Title numberOfLines={1}>{item.username}</Title>
                    <TitleEn numberOfLines={1}>{item.description || 'Без опису'}</TitleEn>
                    <RowInfo>
                      <Info>{item.role || 'Користувач'}</Info>
                      {item.active && <Info><StyledDot name="ellipse" /> Активний</Info>}
                    </RowInfo>
                  </Content>
                </>
              ) : (
                <>
                  <Thumbnail source={item.image ? { uri: item.image } : avatarFallback} />
                  <Content>
                    <Title numberOfLines={2}>
                      {type === 'anime'
                        ? item.title_ua || item.title_ja || '?'
                        : type === 'characters'
                        ? item.name_ua || item.name_ja || '?'
                        : type === 'companies'
                        ? item.name
                        : item.name_ua || '?'}
                    </Title>
                    <TitleEn numberOfLines={1}>
                      {type === 'anime'
                        ? item.title_en || '?'
                        : type === 'characters'
                        ? item.name_en || '?'
                        : type === 'companies'
                        ? item.name || '?'
                        : item.name_en || '?'}
                    </TitleEn>
                    <RowInfo>
                      {type === 'anime' && <Info>{item.score}</Info>}
                      {type === 'anime' && <Info><StyledDot name="circle" /></Info>}
                      {type === 'anime' && <Info>{item.year}</Info>}
                      {type === 'anime' && <Info><StyledDot name="circle" /></Info>}
                      {type === 'anime' && <Info>{media_Type[item.media_type]}</Info>}
                      {type === 'characters' && <Info><TitleEn>{item.name_ja}</TitleEn></Info>}
                    </RowInfo>
                    {type === 'characters' && item.synonyms?.length > 0 && (
                      <Info>Синоніми: {item.synonyms.join(', ')}</Info>
                    )}
                    {type === 'people' && item.description_ua && (
                      <Info numberOfLines={2}>{item.description_ua}</Info>
                    )}
                  </Content>
                </>
              )}
            </Item>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: 'center' }}>
              <SearchImage source={noSearchImage} />
              <EmptyText>Нічого не знайдено</EmptyText>
            </View>
          )
        }
      />
    </Container>
  );
}


const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurHeader = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding-top: 48px;
  padding-bottom: 10px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0px 12px;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const RowInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ButtonBack = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const StyledInfo = styled(Ionicons)`
  color: #888;
  font-size: 28px;
`;

const ScrollRow = styled.ScrollView`
  padding: 10px;
  padding-bottom: 0px;
`;

const Button = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 0px 32px;
  height: 35px;
  background-color: ${({ isActive, theme }) => isActive ? theme.colors.primary : theme.colors.inputBackground};
  margin-right: 10px;
  border-radius: 999px;
`;

const ButtonText = styled.Text`
  font-size: 14px;
  text-align: center;
  font-weight: bold;
  color: ${({ isActive, theme }) => isActive ? theme.colors.background : theme.colors.gray};
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  padding: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const ClearButton = styled.TouchableOpacity`

`;

const Item = styled.View`
  flex-direction: row;
  padding: 10px;
`;

const Thumbnail = styled.Image`
  width: 90px;
  height: 130px;
  border-radius: 12px;
`;

const SearchImage = styled.Image`
  width: 120px;
  height: 120px;
  margin-top: 20px;
`;

const Content = styled.View`
  margin-left: 20px;
  flex: 1;
`;

const Title = styled.Text`
  font-weight: bold;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const TitleEn = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.placeholder};
`;

const Info = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
`;

const StyledDot = styled(FontAwesome)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 4px;
`;

const EmptyText = styled.Text`
  text-align: center;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
`;

const HistoryWrapper = styled.View`
  padding: 0px 12px;
  padding-top: 170px;
  padding-bottom: 40px;
  height: 100%;
`;

const ScrollArea = styled.ScrollView`
  max-height: 200px;
`;

const HistoryTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const HistoryItemRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const HistoryItem = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.placeholder};
`;

const DeleteButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ClearAllButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
  margin-top: 10px;
`;

const ClearAllText = styled.Text`
  font-weight: bold;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
`;