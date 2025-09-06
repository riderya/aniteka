import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from './RowLineHeader';
import AnimeColumnCard from '../Cards/AnimeColumnCard';
import { AnimeColumnCardSkeleton } from '../Skeletons';

const Spacer = styled.View`
  width: 12px;
`;

const SkeletonContainer = styled.View`
  padding-bottom: 50px;
`;

const AnimeRecommendationsSlider = ({ slug, onVisibilityChange }) => {
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

  // Відстежуємо зміни видимості та повідомляємо батьківський компонент
  useEffect(() => {
    if (onVisibilityChange) {
      const isVisible = !loading && recommendations.length > 0;
      onVisibilityChange(isVisible);
    }
  }, [loading, recommendations.length, onVisibilityChange]);

  if (loading) {
    return (
      <>
        <RowLineHeader title="Схожий контент" />
        <SkeletonContainer>
          <FlatList
            data={[1, 2, 3, 4, 5, 6]} // Показуємо 6 скелетонів
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={<Spacer />}
            ListFooterComponent={<Spacer />}
            ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
            renderItem={() => (
              <View style={{ width: 120 }}>
                <AnimeColumnCardSkeleton
                  cardWidth={120}
                  imageWidth={120}
                  imageHeight={170}
                  titleFontSize={14}
                  badgeFontSize={11}
                  footerFontSize={11}
                  starIconSize={11}
                  imageBorderRadius={24}
                  titleNumberOfLines={2}
                />
              </View>
            )}
          />
        </SkeletonContainer>
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
        ListFooterComponent={<Spacer />}
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
