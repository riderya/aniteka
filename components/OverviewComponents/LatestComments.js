import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import SpoilerText from '../../components/CommentForm/SpoilerText';

const LatestComments = () => {
  const [comments, setComments] = useState([]);
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
        const response = await axios.get('https://api.hikka.io/comments/latest');
        setComments(response.data);
      } catch (error) {
        console.error('Помилка при завантаженні коментарів:', error);
      }
    };

    fetchComments();
  }, []);

  const handleNavigate = (item) => {
    if (item.content_type === 'anime' && item.preview?.slug) {
      navigation.navigate('AnimeDetails', { slug: item.preview.slug });
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

  return (
    <Container>
      <RowLineHeader title="Коментарі" onPress={() => navigation.navigate('AnimeCharactersScreen')} />
      <Column>
        {comments.map((item, index) => {
          const avatar = item.author?.avatar || 'https://ui-avatars.com/api/?name=?';
          const username = item.author?.username || 'Користувач';
          const time = timeAgo(item.created);
          const preview = item.preview || {};

          return (
            <CommentCard key={index}>
              <Row>
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
      </Column>
    </Container>
  );
};

export default LatestComments;

// --- Styled Components ---

const Container = styled.View`
  margin-top: 25px;
  flex-direction: column;
  padding: 0 12px;
`;

const Column = styled.View`
  flex-direction: column;
  gap: 20px;
`;

const CommentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
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
  right: 0px;
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
