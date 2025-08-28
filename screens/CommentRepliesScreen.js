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
import CommentCardSkeleton from '../components/Skeletons/CommentCardSkeleton';
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

const OriginalCommentContainer = styled.View`
  margin: 12px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.primary};
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

const OriginalCommentText = styled.Text`
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

  const handleCommentSent = async (optimisticComment = null, commentToRemove = null) => {
    if (commentToRemove) {
      // Видаляємо оптимістичний коментар у випадку помилки
      setReplies((prev) => prev.filter((c) => c.reference !== commentToRemove));
    } else if (optimisticComment) {
      // Додаємо оптимістичний коментар на початок списку
      setReplies((prev) => [optimisticComment, ...prev]);
    } else {
             // Оновлюємо список коментарів, замінюючи оптимістичні коментарі на реальні
       try {
         if (!parentComment?.reference) return;
         
         const res = await axios.get(
           `https://api.hikka.io/comments/thread/${parentComment.reference}`
         );
         let newReplies = res.data.replies || [];
         
         // Замінюємо оптимістичні коментарі на реальні
         setReplies((prev) => {
           const optimisticComments = prev.filter(c => c.is_optimistic);
           const realComments = newReplies.filter(c => !c.is_optimistic);
           
           // Якщо є оптимістичні коментарі, замінюємо їх на реальні
           if (optimisticComments.length > 0) {
             return realComments;
           }
           
           return newReplies;
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

      setReplies(newReplies);
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

  const onRefresh = async () => {
    if (!parentComment?.reference) return;
    setRefreshing(true);
    try {
      // Скидаємо стан перед оновленням
      setLoading(true);
      
      const res = await axios.get(
        `https://api.hikka.io/comments/thread/${parentComment.reference}`
      );
      
      let newReplies = res.data.replies || [];
      setReplies(newReplies);
    } catch (e) {
      console.error('Помилка при оновленні відповідей:', e);
      if (e.response?.status === 404 || e.response?.status === 400) {
        setReplies([]);
      } else {
        Alert.alert('Помилка', 'Не вдалося оновити відповіді. Спробуйте ще раз.');
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Скидаємо стан при зміні коментаря
    setReplies([]);
    setLoading(true);
    setIsTextExpanded(false);
    fetchReplies();
  }, [parentComment.reference]);

  const handleEndReached = () => {
    // API thread повертає всі відповіді одразу, тому пагінація не потрібна
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
        <OriginalCommentLabel>Оригінальний коментар</OriginalCommentLabel>
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
        <OriginalCommentText
          numberOfLines={isTextExpanded ? undefined : 5}
          ellipsizeMode="tail"
        >
          {parentComment.text}
        </OriginalCommentText>
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
      <CommentCount>{replies.length} Відповідей</CommentCount>
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
      navigation={navigation}
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
            <HeaderTitleBar title="Відповіді на коментар" />
          </BlurOverlay>

          <FlatList
            data={[1, 2, 3, 4, 5]} // Show 5 skeleton items
            keyExtractor={(item) => `skeleton-${item}`}
            renderItem={() => <CommentCardSkeleton />}
            contentContainerStyle={{ paddingTop: insets.top + 56 + 20, paddingBottom: insets.bottom + 120 }}
            style={{ flex: 1 }}
          />
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
          <HeaderTitleBar title="Відповіді на коментар" />
        </BlurOverlay>

        <FlatList
          data={replies}
          keyExtractor={(item) => item.reference}
          renderItem={renderItem}
          ListHeaderComponent={
            <View>
              {renderOriginalComment()}
              {renderListHeader()}
            </View>
          }
          ListFooterComponent={renderListFooter}
          contentContainerStyle={{ paddingTop: insets.top + 56 + 20, paddingBottom: insets.bottom + 120 }}
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
            parentComment={parentComment}
            isReply={true}
          />
        </CommentFormContainer>
      </Container>
    </KeyboardAvoidingView>
  );
};

export default CommentRepliesScreen;
