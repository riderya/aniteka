import React, { useEffect, useState } from 'react';
import { FlatList, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';

dayjs.extend(relativeTime);
dayjs.locale('uk');

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const IMAGE_HEIGHT = CARD_WIDTH * 0.65;

const Container = styled.View`
  width: 100%;
  margin-top: 25px;
  padding: 12px 0px;
`;

const CollectionCard = styled.View`
  width: ${CARD_WIDTH}px;
  border-radius: 24px;
  overflow: hidden;
  margin-right: 20px;
`;

const CardWrapper = styled.View`
  position: relative;
  padding-top: ${IMAGE_HEIGHT}px;
`;

const FolderBackground = styled.View`
  position: absolute;
  top: 0;
  width: ${CARD_WIDTH + 12}px;
  height: ${IMAGE_HEIGHT + 30}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  z-index: 0;
  border-radius: 24px;
`;

const AnimeStack = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const SecondImage = styled.Image`
  width: 100%;
  height: ${IMAGE_HEIGHT}px;
  border-radius: 24px;
  position: absolute;
  top: 10px;
  z-index: 1;
  opacity: 0.2;
`;

const FirstImage = styled.Image`
  width: 100%;
  height: ${IMAGE_HEIGHT}px;
  border-radius: 24px;
  position: absolute;
  top: 20px;
  z-index: 2;
`;

const CardInner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const CollectionTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const MoreText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RowInner = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

// --- Основний компонент ---
const CollectionSlider = () => {
  const { theme } = useTheme(); // використовуй свій контекст теми
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.post(
          'https://api.hikka.io/collections?page=1&size=10',
          {
            sort: ['created:desc', 'system_ranking:desc'],
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );

        setCollections(response.data.list);
      } catch (error) {
        console.error('Помилка при завантаженні колекцій:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return null; // або ActivityIndicator
  }

  if (!collections || collections.length === 0) return null;

  return (
    <Container>
      <RowLineHeader
        title="Колекції"
        onPress={() => navigation.navigate('AnimeCollectionsScreen')}
      />
      <FlatList
        data={collections}
        keyExtractor={(item, index) => `collection-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => {
          const animeList = item.collection?.map((col) => col.content).filter(Boolean) || [];
          const first = animeList[0];
          const second = animeList[1];
          const moreCount = animeList.length - 2;

          return (
            <CollectionCard>
              <CardWrapper>
                <AnimeStack>
                  {first && <FirstImage source={{ uri: first.image }} resizeMode="cover" />}
                  {second && <SecondImage source={{ uri: second.image }} resizeMode="cover" />}
                </AnimeStack>
                <FolderBackground />
                <LinearGradient
                  colors={['transparent', theme.colors.card]}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 150,
                    paddingHorizontal: 12,
                    paddingTop: 12,
                    paddingBottom: 8,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    zIndex: 4,
                    justifyContent: 'flex-end',
                  }}
                >
                  <CollectionTitle numberOfLines={1}>
                    {item.title || 'Без назви'}
                  </CollectionTitle>
                  <CardInner>
                  {moreCount > 0 && <MoreText>+ ще {moreCount}</MoreText>}
                  <RowInner style={{ gap: 12 }}>
                  <RowInner>
                  <FontAwesome name="commenting" size={14} color={theme.colors.gray} />
                  <MoreText>{item.comments_count}</MoreText>
                  </RowInner>
                  <RowInner>
                  <Entypo style={{ marginRight: -2 }} name="arrow-bold-up" size={14} color={theme.colors.gray} />
                  <MoreText>{item.vote_score}</MoreText>
                  </RowInner>
                  </RowInner>
                  </CardInner>
                </LinearGradient>
              </CardWrapper>
            </CollectionCard>
          );
        }}
      />
    </Container>
  );
};

export default CollectionSlider;
