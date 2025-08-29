import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import CollectionCard from '../Cards/CollectionCard';

const Container = styled.View`
  width: 100%;

`;

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const CollectionSlider = React.memo(({ onRefresh }) => {
  const { theme } = useTheme();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchCollections = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
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
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Реєструємо функцію оновлення
  useEffect(() => {
    if (onRefresh) {
      const unregister = onRefresh(() => fetchCollections(true));
      return unregister;
    }
  }, [onRefresh, fetchCollections]);

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

  if (loading) {
    return (
      <Container>
        <RowLineHeader
          title="Колекції"
          onPress={() => navigation.navigate('AnimeCollectionsScreen')}
        />
        <LoadingContainer>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </LoadingContainer>
      </Container>
    );
  }

  if (!collections || collections.length === 0) return null;

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
        refreshing={refreshing}
      />
    </Container>
  );
});

CollectionSlider.displayName = 'CollectionSlider';

export default CollectionSlider;
