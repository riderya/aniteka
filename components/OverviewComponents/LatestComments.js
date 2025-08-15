import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import { useNavigation } from '@react-navigation/native';
import LatestCommentCard from '../Cards/LatestCommentCard';
import LatestCommentsSkeleton from '../Skeletons/LatestCommentsSkeleton';

const LatestComments = React.memo(() => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.hikka.io/comments/list');
        // Фільтруємо коментарі, виключаючи manga, novel та edit, і обмежуємо до 5
        const filteredComments = response.data.list.filter(comment => 
          comment.content_type !== 'manga' && comment.content_type !== 'novel' && comment.content_type !== 'edit'
        ).slice(0, 5);
        setComments(filteredComments);
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  return (
    <Container>
      <RowLineHeader title="Коментарі" onPress={() => navigation.navigate('AnimeAllLatestCommentsScreen')} />
      {loading ? (
        <LatestCommentsSkeleton showIndex={false} />
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
  padding: 0 12px;
`;

const Column = styled.View`
  flex-direction: column;
`;
