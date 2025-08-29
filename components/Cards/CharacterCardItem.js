import React from 'react';
import styled from 'styled-components/native';
import avatarFallback from '../../assets/image/image404.png';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Card = styled.View`
  flex-direction: row;
  margin: 6px 12px;
`;

const CharacterImage = styled.Image`
  width: ${({ imageWidth }) => imageWidth || 90}px;
  height: ${({ imageHeight }) => imageHeight || 120}px;
  border-radius: ${({ imageBorderRadius }) => imageBorderRadius || 16}px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ fontSize }) => fontSize || '16px'};
  font-weight: bold;
`;

const AltName = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ fontSize }) => fontSize || '14px'};
  margin-top: 4px;
`;

const CharacterCardItem = ({ 
  character, 
  imageBorderRadius = 16,
  imageWidth = 90,
  imageHeight = 120,
  nameFontSize = '16px',
  altNameFontSize = '14px'
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AnimeCharacterDetailsScreen', {
          slug: character.slug,
        })
      }
    >
      <Card>
        <CharacterImage
          source={
            character?.image?.trim()
              ? { uri: character.image }
              : avatarFallback
          }
          imageBorderRadius={imageBorderRadius}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
        <Info>
          <Name fontSize={nameFontSize} numberOfLines={1}>{character.name_ua || '?'}</Name>
          <AltName fontSize={altNameFontSize}>{character.name_en || '?'}</AltName>
          <AltName fontSize={altNameFontSize}>{character.name_ja || '?'}</AltName>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default CharacterCardItem;
