import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from './RowLineHeader';
import AnimeColumnCard from '../Cards/AnimeColumnCard';

const Spacer = styled.View`
  width: 12px;
`;

const AnimeRecommendationsSlider = ({ slug }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigation = useNavigation();

  const SIZE = 15;

  const mergeUniqueBySlug = (prevList, newList) => {
    const map = new Map();
    [...prevList, ...newList].forEach((item) => {
      if (item && item.slug) {
        map.set(item.slug, item);
      }
    });
    return Array.from(map.values());
  };

  const loadRecommendations = async (targetPage = 1) => {
    // Захист від паралельних запитів
    if (targetPage > 1 && (isLoadingMore || !hasMore)) return;
    try {
      if (targetPage === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const res = await fetch(`https://api.hikka.io/anime/${slug}/recommendations?page=${targetPage}&size=${SIZE}`);
      const json = await res.json();
      const incoming = json.list || [];
      const nextPage = json?.pagination?.page ?? targetPage;
      const pages = json?.pagination?.pages ?? targetPage;

      setRecommendations((prev) => (targetPage === 1 ? incoming : mergeUniqueBySlug(prev, incoming)));
      setPage(nextPage);
      setHasMore(nextPage < pages);
    } catch (e) {
      
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    // Скидаємо стан при зміні аніме
    setRecommendations([]);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    loadRecommendations(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <>
        <RowLineHeader title="Схожий контент" />
        <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
      </>
    );
  }

  if (recommendations.length === 0) return null;

  const handleEndReached = () => {
    if (!loading && !isLoadingMore && hasMore) {
      const next = page + 1;
      loadRecommendations(next);
    }
  };

  return (
    <>
      <RowLineHeader title="Схожий контент" />
      <FlatList
        horizontal
        data={recommendations}
        keyExtractor={(item) => item.slug}
        ListHeaderComponent={<Spacer />}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <Spacer />
          )
        }
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        showsHorizontalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={10}
        renderItem={({ item }) => (
          <View style={{ width: 120 }}>
            <AnimeColumnCard
              anime={item}
              onPress={() => navigation.push('AnimeDetails', { slug: item.slug })}
              cardWidth={120}
              imageWidth={120}
              imageHeight={170}
              titleNumberOfLines={2}
            />
          </View>
        )}
      />
    </>
  );
};

export default AnimeRecommendationsSlider;
