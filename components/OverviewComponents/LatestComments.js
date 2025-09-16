import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import { useNavigation } from '@react-navigation/native';
import LatestCommentCard from '../Cards/LatestCommentCard';
import LatestCommentsSkeleton from '../Skeletons/LatestCommentsSkeleton';
import { useTheme } from '../../context/ThemeContext';

const LatestComments = React.memo(({ onRefresh }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { theme } = useTheme();

  const fetchComments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await axios.get('https://api.hikka.io/comments/list');
      // Фільтруємо коментарі, показуючи тільки аніме, персонажів, статті, авторів та колекції, і обмежуємо до 5
      const filteredComments = response.data.list.filter(comment => 
        ['anime', 'character', 'article', 'person', 'collection'].includes(comment.content_type) && comment.content_type !== 'edit'
      ).slice(0, 5);
      setComments(filteredComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Якщо помилка 502, встановлюємо стан помилки
      if (error.response?.status === 502) {
        setError('502');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Реєструємо функцію оновлення
  useEffect(() => {
    if (onRefresh) {
      const unregister = onRefresh(() => fetchComments(true));
      return unregister;
    }
  }, [onRefresh, fetchComments]);

  return (
    <Container>
      <RowLineHeader title="Останні коментарі" onPress={() => navigation.navigate('AnimeAllLatestCommentsScreen')} />
      {loading || error === '502' ? (
        <LatestCommentsSkeleton showIndex={false} />
      ) : refreshing ? (
        <LoadingContainer>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </LoadingContainer>
      ) : (
        <Column>
          {comments.map((item, index) => (
            <LatestCommentCard key={index} item={item} index={index} showIndex={false} />
          ))}
        </Column>
      )}
    </Container>
  );
});

LatestComments.displayName = 'LatestComments';

export default LatestComments;

// --- Styled Components ---

const Container = styled.View`
  flex-direction: column;
`;

const Column = styled.View`
  flex-direction: column;
  padding: 0 12px;
`;

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
`;
