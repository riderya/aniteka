import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import CollectionCard from '../Cards/CollectionCard';
import { CollectionCardSkeleton } from '../Skeletons';

const Container = styled.View`
  width: 100%;

`;

const SkeletonContainer = styled.View`
  padding-horizontal: 12px;
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
        <SkeletonContainer>
          <FlatList
            data={[1, 2, 3, 4, 5]} // 5 скелетонів для показу
            keyExtractor={(item, index) => `skeleton-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 0 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => <CollectionCardSkeleton compact />}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            initialNumToRender={3}
            getItemLayout={(data, index) => ({
              length: 200,
              offset: 200 * index + 12 * index,
              index,
            })}
          />
        </SkeletonContainer>
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
        ListFooterComponent={refreshing ? (
          <View style={{ flexDirection: 'row', marginLeft: 12 }}>
            {[1, 2, 3].map((item, index) => (
              <View key={`refreshing-${index}`} style={{ marginRight: 12 }}>
                <CollectionCardSkeleton compact />
              </View>
            ))}
          </View>
        ) : null}
      />
    </Container>
  );
});

CollectionSlider.displayName = 'CollectionSlider';

export default CollectionSlider;
