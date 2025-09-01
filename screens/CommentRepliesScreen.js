import React, { useEffect, useState } from 'react';
import {
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
import { CommentCardSkeleton } from '../components/Skeletons';

import MarkdownText from '../components/Custom/MarkdownText';
import * as SecureStore from 'expo-secure-store';

dayjs.extend(relativeTime);
dayjs.locale('uk');
dayjs.extend(isToday);
dayjs.extend(isYesterday);

// ---------- Styled Components ----------
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

const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SortButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  margin-right: 4px;
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

const OriginalCommentContainer = styled.View`
  margin: 0px 12px;
  margin-bottom: 12px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.primary + '50'};
  opacity: 0.9;
`;

const OriginalCommentHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const OriginalCommentAvatar = styled.Image`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  margin-right: 8px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const OriginalCommentInfo = styled.View`
  flex: 1;
`;

const OriginalCommentUsername = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

const OriginalCommentDate = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
`;

const OriginalCommentTextContainer = styled.View`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  line-height: 18px;
`;

const ShowMoreButton = styled.TouchableOpacity`
  margin-top: 8px;
`;

const ShowMoreText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
`;

const OriginalCommentLabel = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

// ---------- Main Component ----------
const CommentRepliesScreen = () => {
  const { 
    parentComment, 
    contentType = 'anime', 
    slug, 
    title 
  } = useRoute().params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [sortOrder, setSortOrder] = useState('oldest'); // 'newest' or 'oldest'
  const [parentCommentForReply, setParentCommentForReply] = useState(parentComment);

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

  const handleDeleteComment = (deletedRef) => {
    setReplies((prev) => prev.filter((c) => c.reference !== deletedRef));
  };

  const handleReply = (comment) => {
    // Оновлюємо батьківський коментар для форми відповіді
    // Це дозволить CommentForm знати, на який коментар відповідаємо
    setParentCommentForReply(comment);
  };

  const handleCommentSent = async (optimisticComment = null, commentToRemove = null) => {
    if (commentToRemove) {
      // Видаляємо оптимістичний коментар у випадку помилки
      setReplies((prev) => prev.filter((c) => c.reference !== commentToRemove));
    } else if (optimisticComment) {
      // Додаємо оптимістичний коментар на початок списку
      setReplies((prev) => [optimisticComment, ...prev]);
      // Скидаємо батьківський коментар до оригінального після додавання оптимістичного коментаря
      setParentCommentForReply(parentComment);
    } else {
                     // Оновлюємо список коментарів, замінюючи оптимістичні коментарі на реальні
        try {
          if (!parentComment?.reference) return;
          
          const res = await axios.get(
            `https://api.hikka.io/comments/thread/${parentComment.reference}`
          );
          let newReplies = res.data.replies || [];
          
          // Рекурсивно завантажуємо відповіді на відповіді
          const allReplies = await fetchAllRepliesRecursively(newReplies);
          
          // Замінюємо оптимістичні коментарі на реальні
          setReplies((prev) => {
            const optimisticComments = prev.filter(c => c.is_optimistic);
            const realComments = allReplies.filter(c => !c.is_optimistic);
            
            // Якщо є оптимістичні коментарі, замінюємо їх на реальні
            if (optimisticComments.length > 0) {
              // Скидаємо батьківський коментар до оригінального після успішної відповіді
              setParentCommentForReply(parentComment);
              return realComments;
            }
            
            return allReplies;
          });
        } catch (e) {
          console.error('Помилка при оновленні відповідей:', e);
          // Якщо API не підтримує відповіді, просто очищаємо оптимістичні коментарі
          setReplies((prev) => prev.filter(c => !c.is_optimistic));
        }
    }
  };

  const fetchReplies = async () => {
    if (isFetching || !parentComment?.reference) return;
    setIsFetching(true);
    try {
      const res = await axios.get(
        `https://api.hikka.io/comments/thread/${parentComment.reference}`
      );
      let newReplies = res.data.replies || [];

      // Рекурсивно завантажуємо відповіді на відповіді
      const allReplies = await fetchAllRepliesRecursively(newReplies);
      setReplies(allReplies);
    } catch (e) {
      console.error('Помилка при завантаженні відповідей:', e);
      // Якщо немає відповідей, показуємо повідомлення
      if (e.response?.status === 404 || e.response?.status === 400) {
        setReplies([]);
      } else {
        Alert.alert('Помилка', 'Не вдалося завантажити відповіді. Спробуйте ще раз.');
      }
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  // Рекурсивна функція для завантаження всіх відповідей
  const fetchAllRepliesRecursively = async (replies, level = 0, parentInfo = null) => {
    if (!replies || replies.length === 0 || level > 5) return []; // Обмежуємо глибину до 5 рівнів
    
    const allReplies = [];
    
    for (const reply of replies) {
      // Додаємо рівень вкладеності та інформацію про батьківський коментар
      const replyWithLevel = { 
        ...reply, 
        level,
        parentInfo: parentInfo || { reference: parentComment.reference, username: parentComment.author?.username }
      };
      allReplies.push(replyWithLevel);
      
      // Рекурсивно завантажуємо відповіді на цей коментар (тільки якщо не перевищили ліміт)
      if (level < 5) {
        try {
          const res = await axios.get(
            `https://api.hikka.io/comments/thread/${reply.reference}`
          );
          const nestedReplies = res.data.replies || [];
          
          if (nestedReplies.length > 0) {
            const currentParentInfo = { reference: reply.reference, username: reply.author?.username };
            const nestedWithLevel = await fetchAllRepliesRecursively(nestedReplies, level + 1, currentParentInfo);
            allReplies.push(...nestedWithLevel);
          }
        } catch (e) {
          // Якщо немає відповідей або помилка, продовжуємо
          console.log(`Немає відповідей для коментаря ${reply.reference}`);
        }
      }
    }
    
    return allReplies;
  };

  const onRefresh = async () => {
    if (!parentComment?.reference) return;
    setRefreshing(true);
    try {
      const res = await axios.get(
        `https://api.hikka.io/comments/thread/${parentComment.reference}`
      );
      
      let newReplies = res.data.replies || [];
      // Рекурсивно завантажуємо відповіді на відповіді
      const allReplies = await fetchAllRepliesRecursively(newReplies);
      setReplies(allReplies);
    } catch (e) {
      console.error('Помилка при оновленні відповідей:', e);
      if (e.response?.status === 404 || e.response?.status === 400) {
        setReplies([]);
      } else {
        Alert.alert('Помилка', 'Не вдалося оновити відповіді. Спробуйте ще раз.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Скидаємо стан при зміні коментаря
    setReplies([]);
    setLoading(true);
    setIsTextExpanded(false);
    setParentCommentForReply(parentComment);
    fetchReplies();
  }, [parentComment.reference]);

  const handleEndReached = () => {
    // API thread повертає всі відповіді одразу, тому пагінація не потрібна
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  const getSortedReplies = () => {
    if (sortOrder === 'oldest') {
      return [...replies].sort((a, b) => a.created - b.created);
    } else {
      return [...replies].sort((a, b) => b.created - a.created);
    }
  };

  const getHeaderTitle = () => {
    return 'Відповіді';
  };

  const renderOriginalComment = () => {
    const createdDate = dayjs.unix(parentComment.created);
    const formattedDate = createdDate.isToday()
      ? `сьогодні о ${createdDate.format('HH:mm')}`
      : createdDate.isYesterday()
      ? `вчора о ${createdDate.format('HH:mm')}`
      : createdDate.format('D MMM о HH:mm');

    return (
      <OriginalCommentContainer>
        <OriginalCommentLabel>Відповідь на коментар</OriginalCommentLabel>
        <OriginalCommentHeader>
          <OriginalCommentAvatar
            source={{
              uri:
                parentComment.author?.avatar && parentComment.author.avatar !== 'string'
                  ? parentComment.author.avatar
                  : 'https://i.ibb.co/THsRK3W/avatar.jpg',
            }}
          />
          <OriginalCommentInfo>
            <OriginalCommentUsername>
              {parentComment.author?.username || 'Користувач'}
            </OriginalCommentUsername>
            <OriginalCommentDate>{formattedDate}</OriginalCommentDate>
          </OriginalCommentInfo>
        </OriginalCommentHeader>
        <OriginalCommentTextContainer>
          <View style={{ 
            maxHeight: isTextExpanded ? undefined : 90, // ~5 рядків * 18px line-height
            overflow: 'hidden',
            position: 'relative'
          }}>
            <MarkdownText
              style={{
                body: {
                  fontSize: 14,
                  lineHeight: 18,
                  color: theme.colors.text
                }
              }}
            >
              {parentComment.text}
            </MarkdownText>
            
          </View>
        </OriginalCommentTextContainer>
        {parentComment.text.length > 200 && (
          <ShowMoreButton
            onPress={() => setIsTextExpanded(!isTextExpanded)}
            activeOpacity={0.7}
          >
            <ShowMoreText>
              {isTextExpanded ? 'Згорнути' : 'Показати більше...'}
            </ShowMoreText>
          </ShowMoreButton>
        )}
      </OriginalCommentContainer>
    );
  };

  const renderListHeader = () => (
    <CommentsHeader>
      <CommentCount>{replies.length} Всього</CommentCount>
      <SortButton onPress={toggleSortOrder} activeOpacity={0.7}>
        <SortButtonText>
          {sortOrder === 'newest' ? 'Спочатку нові' : 'Спочатку старі'}
        </SortButtonText>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={theme.colors.text} 
        />
      </SortButton>
    </CommentsHeader>
  );

  const renderListFooter = () => {
    if (replies.length === 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <CommentCount style={{ fontSize: 14, opacity: 0.7 }}>
            Поки що немає відповідей
          </CommentCount>
        </View>
      );
    }
    
    return null;
  };

  const renderItem = ({ item, index }) => (
    <CommentCard
      item={item}
      slug={slug}
      content_type={contentType}
      comment="comment"
      index={index}
      theme={theme}
      onDelete={handleDeleteComment}
      onReply={handleReply}
      navigation={navigation}
      hideRepliesIndicator={true} // Приховуємо індикатор відповідей в екрані відповідей
      parentComment={parentComment} // Передаємо оригінальний коментар для порівняння
    />
  );

  if (loading && replies.length === 0) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Container>
          <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
            <HeaderTitleBar title={getHeaderTitle()} />
          </BlurOverlay>

          <View style={{ flex: 1, paddingTop: insets.top + 56 + 20 }}>
            {/* Скелетон з оригінальним коментарем та відповідями */}
            <CommentCardSkeleton showOriginalComment={true} />
          </View>
        </Container>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Container>
        <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar title={getHeaderTitle()} />
        </BlurOverlay>

        <FlatList
          data={getSortedReplies()}
          keyExtractor={(item) => item.reference}
          renderItem={renderItem}
          ListHeaderComponent={
            <View>
              {renderOriginalComment()}
              {renderListHeader()}
            </View>
          }
          ListFooterComponent={renderListFooter}
          contentContainerStyle={{ paddingTop: insets.top + 56 + 20, paddingBottom: insets.bottom + 160, paddingHorizontal: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressViewOffset={insets.top + 56}
              progressBackgroundColor={theme.colors.background}
              title="Оновлення відповідей..."
              titleColor={theme.colors.text}
            />
          }
          style={{ flex: 1 }}
        />
        
        <CommentFormContainer>
          <CommentForm 
            content_type={contentType} 
            slug={slug} 
            onCommentSent={handleCommentSent}
            currentUser={currentUser}
            parentComment={parentCommentForReply}
            isReply={true}
          />
        </CommentFormContainer>
      </Container>
    </KeyboardAvoidingView>
  );
};

export default CommentRepliesScreen;
