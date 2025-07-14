import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from './RowLineHeader';
import avatarFallback from '../../assets/image/image404.png';

const Container = styled.View``;

const LineGray = styled.View`
  margin: 25px 12px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const CharacterCard = styled.View`
  margin-right: 15px;
  width: 90px;
`;

const CharacterImage = styled.Image`
  width: 90px;
  height: 120px;
  border-radius: 24px;
`;

const CharacterName = styled.Text`
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const AnimeMainCharacters = ({ anime }) => {
  const navigation = useNavigation();
  const slug = anime.slug;
  const title = anime.title_ua || anime.title_en || anime.title_ja || 'Аніме';

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/anime/${slug}/characters`);
        const mainCharacters = response.data.list.filter(item => item.main);
        setCharacters(mainCharacters);
      } catch (e) {
        setError(true);
        console.error('Помилка при завантаженні персонажів:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [slug]);

  if (loading) {
    return (
      <Container>
        <ActivityIndicator size="large" color="#ff6f61" />
      </Container>
    );
  }

  if (error || characters.length === 0) {
    return (
      <Container>
        <RowLineHeader
          title="Головні персонажі"
          onPress={() => navigation.navigate('AnimeCharactersScreen', { slug, title })}
        />
      </Container>
    );
  }

  return (
    <Container>
      <RowLineHeader
        title="Головні персонажі"
        onPress={() => navigation.navigate('AnimeCharactersScreen', { slug, title })}
      />
      <FlatList
        data={characters}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        contentContainerStyle={{ paddingHorizontal: 15 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AnimeCharacterDetailsScreen', {
                slug: item.character.slug,
                name_ua: item.character.name_ua,
              })
            }
          >
            <CharacterCard>
            <CharacterImage 
  source={
    item?.character?.image?.trim()
      ? { uri: item.character.image }
      : avatarFallback
  }
/>
              <CharacterName numberOfLines={1}>
                {item.character.name_ua || item.character.name_en}
              </CharacterName>
            </CharacterCard>
          </TouchableOpacity>
        )}
      />
      <LineGray />
    </Container>
  );
};

export default AnimeMainCharacters;
