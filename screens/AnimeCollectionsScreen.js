import React, { useEffect, useState } from 'react';
import { FlatList, Dimensions, ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 1;
const IMAGE_HEIGHT = CARD_WIDTH * 0.6;

const AnimeCollectionsScreen = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();

  useEffect(() => {
  const fetchCollections = async () => {
    try {
      const response = await axios.post(
        'https://api.hikka.io/collections?page=1&size=20',
        {
          sort: ['created:desc', 'system_ranking:desc'],
          only_public: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setCollections(response.data.list || []);
    } catch (error) {
      console.error('Помилка при завантаженні колекцій:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchCollections();
}, []);

  const renderCollection = ({ item }) => {
    const animeList = item.collection?.map(col => col.content).filter(Boolean) || [];
    const first = animeList[0];
    const second = animeList[1];
    const moreCount = animeList.length - 2;

    return (
      <Card>
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
              height: 200,
              paddingHorizontal: 12,
              paddingTop: 12,
              paddingBottom: 8,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              zIndex: 4,
              justifyContent: 'flex-end',
            }}
          >
            <CollectionTitle numberOfLines={3}>
              {item.title || 'Без назви'}
            </CollectionTitle>
<CardInner>
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  {moreCount > 0 ? <RowInner style={{ minWidth: 70 }}>
    <MoreText>+ ще {moreCount}</MoreText>
  </RowInner>: null}

    <RowInner>
      <FontAwesome name="commenting" size={14} color={theme.colors.gray} />
      <MoreText>{item.comments_count}</MoreText>
    </RowInner>
    <RowInner>
      <Entypo name="arrow-bold-up" size={14} color={theme.colors.gray} />
      <MoreText>{item.vote_score}</MoreText>
    </RowInner>
  </View>
</CardInner>

          </LinearGradient>
        </CardWrapper>
      </Card>
    );
  };

  return (
    <>
      <HeaderTitleBar title="Колекції" />
      <Wrapper>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={collections}
            keyExtractor={(item, index) => item.reference + index}
            renderItem={renderCollection}
            contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Wrapper>
    </>
  );
};

export default AnimeCollectionsScreen;

// -------------------- Styled Components --------------------

const Wrapper = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Card = styled.View`
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
`;

const CardWrapper = styled.View`
  position: relative;
  padding-top: ${IMAGE_HEIGHT}px;
`;

const FolderBackground = styled.View`
  position: absolute;
  top: 0;
  width: 100%;
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

const CollectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const MoreText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CardInner = styled.View`
  position: absolute;
  top: 0px;
  left: 12px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const RowInner = styled.View`
  background-color: ${({ theme }) => theme.colors.transparentBackground70};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
  padding: 6px 12px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;
