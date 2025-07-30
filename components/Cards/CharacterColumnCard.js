// components/Cards/MainCharacterCard.js

import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import avatarFallback from '../../assets/image/image404.png';
import { useNavigation } from '@react-navigation/native';

const Card = styled.View`
  margin-right: ${({ cardMarginRight }) => cardMarginRight || '15px'};
  width: ${({ cardWidth }) => cardWidth || '90px'};
`;

const CharacterImage = styled.Image`
  width: ${({ width }) => width || '90px'};
  height: ${({ height }) => height || '120px'};
  border-radius: ${({ borderRadius }) => borderRadius || '24px'};
`;

const CharacterName = styled.Text`
  font-size: ${({ fontSize }) => fontSize || '14px'};
  font-weight: 500;
  margin-top: ${({ marginTop }) => marginTop || '4px'};
  color: ${({ theme }) => theme.colors.text};
`;

const CharacterColumnCard = ({
  character,
  width = '90px',
  height = '120px',
  borderRadius = '24px',
  fontSize = '14px',
  cardWidth = '90px',
  cardMarginRight = '15px',
  marginTop = '4px',
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AnimeCharacterDetailsScreen', {
          slug: character.slug,
          name_ua: character.name_ua,
        })
      }
    >
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
        />
        <CharacterName fontSize={fontSize} marginTop={marginTop} numberOfLines={1}>
          {character.name_ua || character.name_en}
        </CharacterName>
      </Card>
    </TouchableOpacity>
  );
};

export default CharacterColumnCard;
