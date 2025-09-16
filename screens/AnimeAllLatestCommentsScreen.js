import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, StatusBar, FlatList } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LatestCommentCard from '../components/Cards/LatestCommentCard';
import LatestCommentsSkeleton from '../components/Skeletons/LatestCommentsSkeleton';

const AnimeAllLatestComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/comments/list?page=${page}&size=20`);
        const newComments = response.data.list || [];
        
        // Фільтруємо коментарі, щоб показувати аніме, персонажів, статті, авторів та колекції (не новел, манги та правки)
        const filteredComments = newComments.filter(
          comment => ['anime', 'character', 'article', 'person', 'collection'].includes(comment.content_type) && comment.content_type !== 'edit'
        );
        
        if (page === 1) {
          setComments(filteredComments);
          setTotalComments(filteredComments.length);
        } else {
          setComments(prev => [...prev, ...filteredComments]);
          setTotalComments(prev => prev + filteredComments.length);
        }
        
        // Перевіряємо чи є ще дані для завантаження
        setHasMore(newComments.length === 20);
      } catch (error) {

      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchComments();
  }, [page]);

  const loadMoreComments = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore, loading]);

  const renderComment = useCallback(({ item, index }) => {
    // Розраховуємо глобальний номер коментаря
    const globalIndex = index + 1;
    return (
      <LatestCommentCard 
        item={item} 
        index={globalIndex - 1} 
        showIndex={true}
      />
    );
  }, []);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <LoadingMoreContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <LoadingText>Завантаження нових коментарів...</LoadingText>
        </LoadingMoreContainer>
      );
    }
    
    if (!hasMore && comments.length > 0) {
      return (
        <EndOfListContainer>
          <EndOfListText>Це всі коментарі</EndOfListText>
        </EndOfListContainer>
      );
    }
    
    return null;
  }, [loadingMore, hasMore, comments.length, theme.colors.primary]);

  const keyExtractor = useCallback((item, index) => `${item.id || `comment-${index}`}`, []);

  const SeparatorComponent = useCallback(() => <Separator />, []);

  const contentContainerStyle = useMemo(() => ({
    paddingTop: insets.top + 56 + 30,
    paddingBottom: 20 + insets.bottom,
    paddingHorizontal: 12,
  }), [insets.top, insets.bottom]);

  if (loading) {
    return (
      <ScreenContainer>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar title="Останні коментарі" />
        </BlurOverlay>
        <LatestCommentsSkeleton showIndex={true} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title="Останні коментарі" />
      </BlurOverlay>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        ItemSeparatorComponent={SeparatorComponent}
        onEndReached={loadMoreComments}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
        getItemLayout={null}
        legacyImplementation={false}
      />
    </ScreenContainer>
  );
};

export default AnimeAllLatestComments;


const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const LoadingMoreContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const LoadingText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const EndOfListContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const EndOfListText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-style: italic;
`;

const Separator = styled.View`
  height: 12px;
`;
