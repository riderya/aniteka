import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import Entypo from '@expo/vector-icons/Entypo';
import SpoilerText from '../components/CommentForm/SpoilerText';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const AnimeAllLatestComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const commentType = {
    collection: 'Колекція',
    edit: 'Правка',
    article: 'Стаття',
    anime: 'Аніме',
    manga: 'Манґа',
    novel: 'Ранобе',
  };

  const timeAgo = (created) => {
    const secondsAgo = Math.floor(Date.now() / 1000) - created;
    if (secondsAgo < 60) return `щойно`;
    if (secondsAgo < 3600) return `близько ${Math.floor(secondsAgo / 60)} хв тому`;
    if (secondsAgo < 86400) return `близько ${Math.floor(secondsAgo / 3600)} год тому`;
    return `близько ${Math.floor(secondsAgo / 86400)} днів тому`;
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/comments/list?page=${page}&size=20`);
        const newComments = response.data.list || [];
        
        // Фільтруємо коментарі, щоб показувати тільки аніме (не новел і манги)
        const filteredComments = newComments.filter(
          comment => comment.content_type === 'anime'
        );
        
        if (page === 1) {
          setComments(filteredComments);
        } else {
          setComments(prev => [...prev, ...filteredComments]);
        }
        
        // Перевіряємо чи є ще дані для завантаження
        setHasMore(newComments.length === 20);
      } catch (error) {
        console.error('Помилка при завантаженні коментарів:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchComments();
  }, [page]);

  const loadMoreComments = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  const parseCommentText = (text) => {
    const regex = /:::spoiler\s*\n([\s\S]*?)\n:::/g;
    let lastIndex = 0;
    const result = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const index = match.index;
      if (index > lastIndex) {
        result.push({ type: 'text', content: text.slice(lastIndex, index) });
      }
      result.push({ type: 'spoiler', content: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return result;
  };

  const RenderCommentText = ({ text }) => {
    const parts = parseCommentText(text);
    return (
      <>
        {parts.map((part, i) => {
          if (part.type === 'text') {
            return <CommentText key={i} numberOfLines={3}>{part.content}</CommentText>;
          }
          if (part.type === 'spoiler') {
            return <SpoilerText key={i} text={part.content} maxLines={3} />;
          }
          return null;
        })}
      </>
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <ActivityIndicator size="large" style={{ marginTop: 32 }} color={theme.colors.primary} />
      </ScreenContainer>
    );
  }

    const handleNavigate = (item) => {
    const preview = item.preview || {};
    
    switch (item.content_type) {
      case 'anime':
        if (preview.slug) {
          navigation.navigate('AnimeDetails', { slug: preview.slug });
        }
        break;
      case 'article':
        if (preview.slug) {
          navigation.navigate('ArticleDetailScreen', { slug: preview.slug });
        }
        break;
      case 'collection':
        if (preview.slug) {
          navigation.navigate('CollectionDetailScreen', { slug: preview.slug });
        }
        break;
      default:
        // Для інших типів контенту не робимо перехід
        break;
    }
  };

  return (
    <ScreenContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title="Останні коментарі" />
      </BlurOverlay>

      <Container
        contentContainerStyle={{
          paddingTop: 100,
          paddingBottom: 20 + insets.bottom,
        }}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom) {
            loadMoreComments();
          }
        }}
        scrollEventThrottle={400}
      >
        {comments.map((item, index) => {
          const avatar = item.author?.avatar || 'https://ui-avatars.com/api/?name=?';
          const username = item.author?.username || 'Користувач';
          const time = timeAgo(item.created);
          const preview = item.preview || {};

          return (
            <CommentCard key={`${item.id || index}-${page}`}>
              <Row>
                <CommentIndex>#{index + 1}</CommentIndex>
                <Avatar source={{ uri: avatar }} />
                <View>
                  <Username>{username}</Username>
                  <Timestamp>{time}</Timestamp>
                </View>

                {item.vote_score !== 0 && (
                  <RowScore>
                    <Entypo
                      name={item.vote_score > 0 ? 'arrow-bold-up' : 'arrow-bold-down'}
                      size={16}
                      color={item.vote_score > 0 ? 'green' : 'red'}
                    />
                    <LikeScore style={{ color: item.vote_score > 0 ? 'green' : 'red' }}>
                      {item.vote_score}
                    </LikeScore>
                  </RowScore>
                )}
              </Row>

              <RenderCommentText text={item.text} />

              <TagsRow>
                <TypeTag>{commentType[item.content_type]}</TypeTag>
                <TouchableOpacity onPress={() => handleNavigate(item)}>
                  <LinkTag numberOfLines={1}>{preview.title || 'Без назви'}</LinkTag>
                </TouchableOpacity>
              </TagsRow>
            </CommentCard>
          );
        })}
        
        {loadingMore && (
          <LoadingMoreContainer>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <LoadingText>Завантаження...</LoadingText>
          </LoadingMoreContainer>
        )}
        
        {!hasMore && comments.length > 0 && (
          <EndOfListContainer>
            <EndOfListText>Це всі коментарі</EndOfListText>
          </EndOfListContainer>
        )}
      </Container>
    </ScreenContainer>
  );
};

export default AnimeAllLatestComments;

// ====================== STYLES ======================

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px 12px;
  flex-direction: column;
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

const CommentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 20px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CommentIndex = styled.Text`
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 4px 14px;
  border-radius: 999px;
  text-align: center;
  z-index: 999;
  top: -30px;
  left: -10px;
`;

const Avatar = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 10px;
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const Timestamp = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  margin-top: 2px;
`;

const CommentText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  margin-top: 10px;
  font-size: 14px;
  line-height: 20px;
`;

const TagsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
`;

const LikeScore = styled.Text`
  font-size: 16px;
  padding: 5px 0px;
  font-weight: bold;
`;

const RowScore = styled.View`
  position: absolute;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  right: 12px;
`;

const LinkTag = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  padding: 5px 0px;
  font-weight: 500;
  max-width: 260px;
`;

const TypeTag = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
  font-weight: 500;
  padding: 5px 16px;
  border-radius: 999px;
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
