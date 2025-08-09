import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import CollectionCard from '../Cards/CollectionCard';

const Container = styled.View`
  width: 100%;

`;

const CollectionSlider = React.memo(() => {
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

  const renderItem = useCallback(({ item }) => (
    <CollectionCard item={item} compact />
  ), []);

  const keyExtractor = useCallback((item, index) => `collection-${index}`, []);

  const ItemSeparator = useCallback(() => <View style={{ width: 12 }} />, []);

  const getItemLayout = useCallback((data, index) => ({
    length: 200, // Приблизна ширина картки
    offset: 200 * index + 12 * index, // 12px відступ між картками
    index,
  }), []);

  if (loading || !collections || collections.length === 0) return null;

  return (
    <Container>
      <RowLineHeader
        title="Колекції"
        onPress={() => navigation.navigate('AnimeCollectionsScreen')}
      />
      <FlatList
        data={collections}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 12 }}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={renderItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
        getItemLayout={getItemLayout}
      />
    </Container>
  );
});

CollectionSlider.displayName = 'CollectionSlider';

export default CollectionSlider;
