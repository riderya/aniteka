import React from 'react';
import { View, Dimensions, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native'; // 🔹 додаємо навігацію

const SCREEN_WIDTH = Dimensions.get('window').width;

const CollectionCard = ({ item, compact = false }) => {
  const { theme } = useTheme();
  const navigation = useNavigation(); // 🔹 отримуємо navigation

  const cardWidth = compact ? SCREEN_WIDTH * 0.6 : SCREEN_WIDTH - 24;
  const imageHeight = cardWidth * 0.6;

  const animeList = item.collection?.map(col => col.content).filter(Boolean) || [];
  const first = animeList[0];
  const second = animeList[1];
  const moreCount = animeList.length - 2;

  const handlePress = () => {
    navigation.navigate('CollectionDetailScreen', { reference: item.reference });
  };

  return (
    <Pressable onPress={handlePress}>
      <Card style={{ width: cardWidth }} compact={compact}>
        {!compact && (
          <CardInner>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {moreCount > 0 && (
                <RowInner style={{ minWidth: 70 }}>
                  <MoreText>+ ще {moreCount}</MoreText>
                </RowInner>
              )}
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
        )}

        <CardWrapper style={{ paddingTop: imageHeight }}>
          <AnimeStack>
            {first && <FirstImage source={{ uri: first.image }} style={{ height: imageHeight }} resizeMode="cover" />}
            {second && <SecondImage source={{ uri: second.image }} style={{ height: imageHeight }} resizeMode="cover" />}
          </AnimeStack>

          <FolderBackground style={{ height: imageHeight + 30 }} />

          <LinearGradient
            colors={['transparent', theme.colors.card]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 160,
              paddingHorizontal: 12,
              paddingTop: 12,
              paddingBottom: 8,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              zIndex: 4,
              justifyContent: 'flex-end',
            }}
          >
            <CollectionTitle numberOfLines={2}>
              {item.title || 'Без назви'}
            </CollectionTitle>
          </LinearGradient>
        </CardWrapper>
      </Card>
    </Pressable>
  );
};

export default CollectionCard;


// стилі — без змін, окрім Card, де можна додати marginRight лише для compact

const Card = styled.View`
  border-radius: 24px;
  overflow: hidden;
  border: 2px;
  border-color: ${({ theme }) => theme.colors.border};
  ${(props) => props.compact && 'margin-right: 12px;'}
`;

const CardWrapper = styled.View`
  position: relative;
`;

const FolderBackground = styled.View`
  position: absolute;
  top: 0;
  width: 100%;
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

const FirstImage = styled.Image`
  width: 100%;
  border-radius: 24px;
  position: absolute;
  top: 20px;
  z-index: 2;
`;

const SecondImage = styled.Image`
  width: 100%;
  border-radius: 24px;
  position: absolute;
  top: 10px;
  z-index: 1;
  opacity: 0.2;
`;

const CollectionTitle = styled.Text`
  font-size: 16px;
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
  top: 32px;   
  left: 12px;
  right: 12px; 
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  z-index: 3;
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
