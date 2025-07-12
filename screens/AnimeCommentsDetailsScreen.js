import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View, KeyboardAvoidingView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styled from 'styled-components/native';
import Markdown from 'react-native-markdown-display';
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

const CommentCard = styled.View`
  margin: 12px;
`;

const RowInfo = styled.View`
  flex-direction: row;
`;

const RowInfoTitle = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const Avatar = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 999px;
  margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const CommentBody = styled.View`
  flex: 1;
`;

const Username = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

const DateText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
`;

const SpoilerContentWrapper = styled.View`
  padding-left: 8px;
  border-left-width: 2px;
  border-left-color: ${({ theme }) => theme.colors.primary};
`;

const SpoilerToggle = styled.TouchableOpacity`
  flex-direction: row;
  align-self: flex-start;
  align-items: center;
  padding: 0px 24px;
  border-radius: 999px;
  height: 35px;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  margin-top: 4px;
`;

const SpoilerText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 12px;
`;

const ShowToggle = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-radius: 999px;
  height: 45px;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  margin-top: 4px;
`;

const ShowText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight:bold;
`;

const RowSpaceBeetwin = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const RowLike = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const LikeText = styled.Text`
  font-weight: bold;
  color: ${({ vote, theme }) => 
  vote > 0 
    ? theme.colors.success 
    : vote < 0 
    ? theme.colors.error 
    : theme.colors.gray};
`;

const LikeIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 22px;
`;

const CommentsHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 12px;
  margin-bottom: 12px;
`;

const FilterButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const FilterText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight: 600;
  font-size: 14px;
`;

const CommentCount = styled.Text`
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`;

// ---------- Спойлер парсер ----------
function parseTextWithSpoilers(text) {
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
}

// ---------- Основний Компонент ----------
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
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' або 'asc'
  const [isFetching, setIsFetching] = useState(false);

  // Окремо стан для pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  const headerHeight = insets.top + 60;
  const shouldTruncate = (text) => text.length > 300;

  const toggleSortOrder = () => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const fetchComments = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    try {
      const res = await axios.get(
        `https://api.hikka.io/comments/anime/${slug}/list?page=${page}&size=100`
      );
      let newComments = res.data.list || [];
  
      newComments.sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.created - a.created;
        } else {
          return a.created - b.created;
        }
      });
  
      setComments((prev) => {
        const existingRefs = new Set(prev.map((c) => c.reference));
        const uniqueNew = newComments.filter((c) => !existingRefs.has(c.reference));
        const combined = [...prev, ...uniqueNew];
  
        combined.sort((a, b) => {
          if (sortOrder === 'desc') {
            return b.created - a.created;
          } else {
            return a.created - b.created;
          }
        });
  
        return combined;
      });
  
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (e) {
      console.error('Помилка при завантаженні коментарів:', e);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  // Pull-to-refresh функція
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setPage(1);
      setHasMore(true);
      const res = await axios.get(
        `https://api.hikka.io/comments/anime/${slug}/list?page=1&size=100`
      );
      let newComments = res.data.list || [];
      newComments.sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.created - a.created;
        } else {
          return a.created - b.created;
        }
      });
      setComments(newComments);
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (e) {
      console.error('Помилка при оновленні коментарів:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, sortOrder]);

  const handleEndReached = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const renderMarkdownWithSpoilers = (text, commentIndex) => {
    const parsed = parseTextWithSpoilers(text);
    return parsed.map((block, idx) => {
      if (block.type === 'text') {
        return (
          <Markdown
            key={`text-${commentIndex}-${idx}`}
            style={{
              body: {
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 18,
              },
              link: {
                color: theme.colors.primary,
              },
            }}
          >
            {block.content}
          </Markdown>
        );
      } else if (block.type === 'spoiler') {
        const key = `${commentIndex}-${idx}`;
        const isOpen = spoilerOpen[key] || false;
        return (
          <View key={`spoiler-${key}`}>
            <SpoilerToggle
              onPress={() => {
                setSpoilerOpen((prev) => ({ ...prev, [key]: !prev[key] }));
              }}
            >
              <SpoilerText>{isOpen ? 'Приховати спойлер' : 'Показати спойлер'}</SpoilerText>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.primary}
                style={{ marginLeft: 6 }}
              />
            </SpoilerToggle>
            {isOpen && (
              <SpoilerContentWrapper>
                <Markdown
                  style={{
                    body: {
                      color: theme.colors.text,
                      fontSize: 14,
                      lineHeight: 20,
                    },
                    link: {
                      color: theme.colors.primary,
                    },
                  }}
                >
                  {block.content}
                </Markdown>
              </SpoilerContentWrapper>
            )}
          </View>
        );
      }
      return null;
    });
  };

  const renderListHeader = () => (
    <CommentsHeader style={{ paddingTop: headerHeight }}>
      <CommentCount>{commentsCount} Всього</CommentCount>
      <FilterButton onPress={toggleSortOrder}>
        <LikeIcon name="filter" />
        <FilterText>
          {sortOrder === 'desc' ? 'Спочатку нові' : 'Спочатку старі'}
        </FilterText>
        <LikeIcon name="chevron-down" />
      </FilterButton>
    </CommentsHeader>
  );  

  const renderItem = ({ item, index }) => {
    const author = item.author || {};
    const createdDate = dayjs.unix(item.created);

    let formattedDate = '';
    if (createdDate.isToday()) {
      formattedDate = `сьогодні о ${createdDate.format('HH:mm')}`;
    } else if (createdDate.isYesterday()) {
      formattedDate = `вчора о ${createdDate.format('HH:mm')}`;
    } else {
      formattedDate = createdDate.format('D MMM о HH:mm');
    }

    const commentKey = item.reference || `comment-${index}`;
    const isExpanded = expandedComments[commentKey];
    const fullText = item.text || '';
    const displayText = !isExpanded && shouldTruncate(fullText)
      ? fullText.slice(0, 300) + '...'
      : fullText;

    return (
      <CommentCard>
        <RowInfo>
          <Avatar
            source={{
              uri:
                author.avatar && author.avatar !== 'string'
                  ? author.avatar
                  : 'https://i.ibb.co/THsRK3W/avatar.jpg',
            }}
          />
          <CommentBody>
            <RowInfoTitle>
              <Username>{author.username || 'Користувач'}</Username>
              <DateText>{formattedDate}</DateText>
            </RowInfoTitle>
            {renderMarkdownWithSpoilers(displayText, index)}

            {shouldTruncate(fullText) && (
              <ShowToggle
                onPress={() =>
                  setExpandedComments((prev) => ({
                    ...prev,
                    [commentKey]: !isExpanded,
                  }))
                }
              >
                <ShowText>
                  {isExpanded ? 'Приховати' : 'Читати більше...'}
                </ShowText>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={theme.colors.gray}
                  style={{ marginLeft: 4 }}
                />
              </ShowToggle>
            )}
            <RowSpaceBeetwin>
              <ShowText>Відповісти</ShowText>
              <RowLike>
                <LikeText><LikeIcon name="chevron-down" /></LikeText>
                <LikeText vote={item.vote_score}>{item.vote_score}</LikeText>
                <LikeText><LikeIcon name="chevron-up" /></LikeText>
              </RowLike>
            </RowSpaceBeetwin>
          </CommentBody>
        </RowInfo>
      </CommentCard>
    );
  };

  if (loading && comments.length === 0) {
    return (
      <CenterLoader>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </CenterLoader>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={40}
    >
      <Container style={{ flexDirection: 'column' }}>
        <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar title={`Коментарі: ${title}`} />
        </BlurOverlay>

        <View style={{ flex: 0.85 }}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.reference}
            renderItem={renderItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            ListHeaderComponent={renderListHeader}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>

        <View style={{ flex: 0.15 }}>
          <CommentForm content_type="anime" slug={slug} />
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
};

export default AnimeCommentsDetailsScreen;
