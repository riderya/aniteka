// components/Cards/MainCharacterCard.js

import React, { useCallback } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import avatarFallback from '../../assets/image/image404.png';
import { useNavigation } from '@react-navigation/native';
import { useWatchStatus } from '../../context/WatchStatusContext';

const Card = styled.View`
  margin-right: ${({ cardMarginRight }) => cardMarginRight || '15px'};
  width: ${({ cardWidth }) => cardWidth || '90px'};
  position: relative;
`;

const CharacterImage = styled(Image)`
  width: ${({ width }) => width || '90px'};
  height: ${({ height }) => height || '120px'};
  border-radius: ${({ borderRadius }) => borderRadius || 24}px;
`;

const CharacterName = styled.Text`
  font-size: ${({ fontSize }) => fontSize || '14px'};
  font-weight: 500;
  margin-top: ${({ marginTop }) => marginTop || '10px'};
  color: ${({ theme }) => theme.colors.text};
`;

const HeartIcon = styled(Ionicons)`
  position: absolute;
  top: 8px;
  right: 8px;
  color: ${({ theme }) => theme.colors.favourite};
  background-color: ${({ theme }) => theme.colors.favourite + '60'};
  padding: 4px;
  border-radius: 10px;
  font-size: 20px;
`;

const CharacterColumnCard = React.memo(({
  character,
  width = '90px',
  height = '120px',
  borderRadius = 24,
  fontSize = '14px',
  cardWidth = '90px',
  cardMarginRight = '0px',
  marginTop = '10px',
  onPress,
  nameFontSize = '14px',
}) => {
  const navigation = useNavigation();
  const { getCharacterFavourite, fetchCharacterFavourite } = useWatchStatus();
  
  // Отримуємо статус улюбленого персонажа
  const isLiked = getCharacterFavourite(character.slug);
  
  // Завантажуємо статус при першому рендері
  React.useEffect(() => {
    if (character.slug && isLiked === null) {
      fetchCharacterFavourite(character.slug);
    }
  }, [character.slug, isLiked, fetchCharacterFavourite]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('AnimeCharacterDetailsScreen', {
        slug: character.slug,
        name_ua: character.name_ua,
      });
    }
  }, [onPress, navigation, character.slug, character.name_ua]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card cardWidth={cardWidth} cardMarginRight={cardMarginRight}>
        <CharacterImage
          width={width}
          height={height}
          borderRadius={borderRadius}
          source={
            character?.image?.trim()
              ? { uri: character.image }
              : avatarFallback
          }
          resizeMode="cover"
        />
        {isLiked === true && (
          <HeartIcon
            name="heart"
            isLiked={true}
          />
        )}
        <CharacterName 
          fontSize={nameFontSize} 
          marginTop={marginTop} 
          numberOfLines={1}
        >
          {character.name_ua || character.name_en}
        </CharacterName>
      </Card>
    </TouchableOpacity>
  );
});

CharacterColumnCard.displayName = 'CharacterColumnCard';

export default CharacterColumnCard;
