import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from './RowLineHeader';
import CharacterColumnCard from '../Cards/CharacterColumnCard';

const Container = styled.View``;

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
          <CharacterColumnCard character={item.character} />
        )}
      />
    </Container>
  );
};

export default AnimeMainCharacters;
