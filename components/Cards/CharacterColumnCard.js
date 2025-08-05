// components/Cards/MainCharacterCard.js

import React, { useCallback } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity, Image } from 'react-native';
import avatarFallback from '../../assets/image/image404.png';
import { useNavigation } from '@react-navigation/native';

const Card = styled.View`
  margin-right: ${({ cardMarginRight }) => cardMarginRight || '15px'};
  width: ${({ cardWidth }) => cardWidth || '90px'};
`;

const CharacterImage = styled(Image)`
  width: ${({ width }) => width || '90px'};
  height: ${({ height }) => height || '120px'};
  border-radius: ${({ borderRadius }) => borderRadius || '24px'};
`;

const CharacterName = styled.Text`
  font-size: ${({ fontSize }) => fontSize || '14px'};
  font-weight: 500;
  margin-top: ${({ marginTop }) => marginTop || '10px'};
  color: ${({ theme }) => theme.colors.text};
`;

const CharacterColumnCard = React.memo(({
  character,
  width = '90px',
  height = '120px',
  borderRadius = '24px',
  fontSize = '14px',
  cardWidth = '90px',
  cardMarginRight = '15px',
  marginTop = '10px',
  onPress,
}) => {
  const navigation = useNavigation();

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
        <CharacterName fontSize={fontSize} marginTop={marginTop} numberOfLines={1}>
          {character.name_ua || character.name_en}
        </CharacterName>
      </Card>
    </TouchableOpacity>
  );
});

CharacterColumnCard.displayName = 'CharacterColumnCard';

export default CharacterColumnCard;
