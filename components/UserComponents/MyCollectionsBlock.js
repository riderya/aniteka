import React from 'react';
import { FlatList, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const IMAGE_HEIGHT = CARD_WIDTH * 0.65;

const Container = styled.View`
  width: 100%;
  margin-top: 15px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px 0px;
`;

const CollectionCard = styled.View`
  width: ${CARD_WIDTH}px;
  border-radius: 16px;
  overflow: hidden;
  margin-right: 15px;
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
  border-radius: 14px;
  position: absolute;
  top: 10px;
  z-index: 1;
  opacity: 0.2;
`;

const FirstImage = styled.Image`
  width: 100%;
  height: ${IMAGE_HEIGHT}px;
  border-radius: 14px;
  position: absolute;
  top: 20px;
  z-index: 2;

`;

const CardInner = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CollectionTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const MoreText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

const MyCollectionsSlider = ({ collections, navigation }) => {
  const { theme, isDark } = useTheme();
  if (!collections || collections.length === 0) return null;

  return (
    <Container>
      <RowLineHeader
        title="Мої колекції"
        onPress={() => navigation.navigate('AnimeCharactersScreen')}
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
                <CardInner>
                <LinearGradient
  colors={['transparent', theme.colors.card]}
  style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 140,
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
  {moreCount > 0 && <MoreText>+ ще {moreCount}</MoreText>}
</LinearGradient>
                </CardInner>
              </CardWrapper>
            </CollectionCard>
          );
        }}
      />
    </Container>
  );
};

export default MyCollectionsSlider;
