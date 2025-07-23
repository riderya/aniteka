import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import CollectionCard from '../Cards/CollectionCard';
const Container = styled.View`
  width: 100%;
  margin-top: 25px;
  padding: 12px 0px;
`;

const CollectionSlider = () => {
  const { theme } = useTheme();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.post(
          'https://api.hikka.io/collections?page=1&size=10',
          {
            sort: ['created:desc', 'system_ranking:desc'],
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );

        setCollections(response.data.list);
      } catch (error) {
        console.error('Помилка при завантаженні колекцій:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading || !collections || collections.length === 0) return null;

  return (
    <Container>
      <RowLineHeader
        title="Колекції"
        onPress={() => navigation.navigate('AnimeCollectionsScreen')}
      />
      <FlatList
        data={collections}
        keyExtractor={(item, index) => `collection-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => <CollectionCard item={item} compact />}
      />
    </Container>
  );
};

export default CollectionSlider;
