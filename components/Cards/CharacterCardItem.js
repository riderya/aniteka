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
  width: 80px;
  height: 100px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
`;

const AltName = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  margin-top: 4px;
`;

const CharacterCardItem = ({ character }) => {
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
        />
        <Info>
          <Name numberOfLines={1}>{character.name_ua || '?'}</Name>
          <AltName>{character.name_en || '?'}</AltName>
          <AltName>{character.name_ja || '?'}</AltName>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default CharacterCardItem;
