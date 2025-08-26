import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTheme } from '../context/ThemeContext';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import CommentForm from '../components/CommentForm/CommentForm';
import CommentCard from '../components/Cards/CommentCard';
import * as SecureStore from 'expo-secure-store';

dayjs.extend(relativeTime);
dayjs.locale('uk');
dayjs.extend(isToday);
dayjs.extend(isYesterday);

// ---------- Styled Components ----------
const CenterLoader = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled.View`
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

const CommentsHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 12px;
  margin-bottom: 12px;
`;



const CommentCount = styled.Text`
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`;

const CommentFormContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  z-index: 1000;
`;

// ---------- Spoiler Parser ----------
const parseTextWithSpoilers = (text) => {
  const regex = /:::spoiler\s*([\s\S]*?)\s*:::/gi;
  let lastIndex = 0;
  const result = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const beforeText = text.slice(lastIndex, match.index);
    if (beforeText.trim()) {
      result.push({ type: 'text', content: beforeText });
    }
    result.push({ type: 'spoiler', content: match[1] });
    lastIndex = regex.lastIndex;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText.trim()) {
    result.push({ type: 'text', content: remainingText });
  }

  return result;
};

// ---------- Main Component ----------
const AnimeCommentsDetailsScreen = () => {
  const { slug, title, commentsCount } = useRoute().params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [spoilerOpen, setSpoilerOpen] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Поточний користувач (reference) з SecureStore
  const [currentUserRef, setCurrentUserRef] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUserRef = async () => {
        const ref = await SecureStore.getItemAsync('hikka_user_reference');
        setCurrentUserRef(ref);
        
        // Отримуємо інформацію про користувача
        if (ref) {
          try {
            const token = await SecureStore.getItemAsync('hikka_token');
            const response = await axios.get('https://api.hikka.io/user/me', {
              headers: { auth: token }
            });
            setCurrentUser(response.data);
          } catch (e) {
            console.error('Помилка при отриманні інформації про користувача:', e);
          }
        }
    };
    getUserRef();
  }, []);

  const headerHeight = insets.top + 60;
  const shouldTruncate = (text) => text.length > 300;

  const handleDeleteComment = (deletedRef) => {
    setComments((prev) => prev.filter((c) => c.reference !== deletedRef));
  };

  const handleCommentSent = async (optimisticComment = null, commentToRemove = null) => {
    if (commentToRemove) {
      // Видаляємо оптимістичний коментар у випадку помилки
      setComments((prev) => prev.filter((c) => c.reference !== commentToRemove));
    } else if (optimisticComment) {
      // Додаємо оптимістичний коментар на початок списку
      setComments((prev) => [optimisticComment, ...prev]);
    } else {
      // Оновлюємо список коментарів, замінюючи оптимістичні коментарі на реальні
      try {
        const res = await axios.get(
          `https://api.hikka.io/comments/anime/${slug}/list?page=1&size=15`
        );
        let newComments = res.data.list || [];
        
        // Замінюємо оптимістичні коментарі на реальні
        setComments((prev) => {
          const optimisticComments = prev.filter(c => c.is_optimistic);
          const realComments = newComments.filter(c => !c.is_optimistic);
          
          // Якщо є оптимістичні коментарі, замінюємо їх на реальні
          if (optimisticComments.length > 0) {
            return realComments;
          }
          
          return newComments;
        });
        
        setHasMore(res.data.pagination.page < res.data.pagination.pages);
      } catch (e) {
        console.error('Помилка при оновленні коментарів:', e);
      }
    }
  };


  const fetchComments = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    try {
      const res = await axios.get(
        `https://api.hikka.io/comments/anime/${slug}/list?page=${page}&size=15`
      );
      let newComments = res.data.list || [];

      setComments((prev) => {
        const existingRefs = new Set(prev.map((c) => c.reference));
        const uniqueNew = newComments.filter(
          (c) => !existingRefs.has(c.reference)
        );
        return [...prev, ...uniqueNew];
      });

      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (e) {
      
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setPage(1);
      setHasMore(true);
      const res = await axios.get(
        `https://api.hikka.io/comments/anime/${slug}/list?page=1&size=15`
      );
      let newComments = res.data.list || [];
      setComments(newComments);
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (e) {
      
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  const handleEndReached = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const renderListHeader = () => (
    <CommentsHeader>
      <CommentCount>{commentsCount} Всього</CommentCount>
    </CommentsHeader>
  );

  const renderItem = ({ item, index }) => (
    <CommentCard
      item={item}
      slug={slug}
      comment="comment"
      index={index}
      theme={theme}
      spoilerOpen={spoilerOpen}
      setSpoilerOpen={setSpoilerOpen}
      expandedComments={expandedComments}
      setExpandedComments={setExpandedComments}
      parseTextWithSpoilers={parseTextWithSpoilers}
      shouldTruncate={shouldTruncate}
      onDelete={handleDeleteComment}
      currentUserRef={currentUserRef}
      navigation={navigation}
    />
  );

  if (loading && comments.length === 0) {
    return (
      <CenterLoader>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </CenterLoader>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Container>
        <BlurOverlay experimentalBlurMethod="dimezisBlurView"  intensity={100} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar title={`Коментарі: ${title}`} />
        </BlurOverlay>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.reference}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={{ paddingTop: insets.top + 56 + 20, paddingBottom: insets.bottom + 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.text}
              colors={[theme.colors.text]}
              progressViewOffset={insets.top + 56}
              progressBackgroundColor={isDark ? theme.colors.card : undefined}
            />
          }
          style={{ flex: 1 }}
        />
        
        <CommentFormContainer>
          <CommentForm 
            content_type="anime" 
            slug={slug} 
            onCommentSent={handleCommentSent}
            currentUser={currentUser}
          />
        </CommentFormContainer>


      </Container>
    </KeyboardAvoidingView>
  );
};

export default AnimeCommentsDetailsScreen;
