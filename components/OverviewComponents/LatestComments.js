import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import Entypo from '@expo/vector-icons/Entypo';

const Container = styled.View`
  margin-top: 25px;
  flex-direction: column;
  gap: 12px;
`;

const CommentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin: auto 12px;
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
  line-height: 20;
`;

const TagsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 12px;
`;

const LikeScore = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
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
  font-size: 13px;
  padding: 5px 0px;
  font-weight: 500;
  width: 77.7%;
`;

const TypeTag = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
  font-weight: 500;
  padding: 5px 16px;
  border-radius: 999px;
`;

const LatestComments = () => {
  const [comments, setComments] = useState([]);

  const commentType = {
    collection: 'Колекція',
    edit: 'Правка',
    article: 'Стаття',
    anime: 'Аніме',
    manga: 'Манґа',
    novel: 'Ранобе',
  }

  const timeAgo = (created) => {
  const secondsAgo = Math.floor(Date.now() / 1000) - created;

  if (secondsAgo < 60) return `щойно`;
  if (secondsAgo < 3600) return `близько ${Math.floor(secondsAgo / 60)} хвилин тому`;
  if (secondsAgo < 86400) return `близько ${Math.floor(secondsAgo / 3600)} годин тому`;
  return `близько ${Math.floor(secondsAgo / 86400)} днів тому`;
};


  useEffect(() => {
    const fetchComments = async () => {
        const response = await axios.get('https://api.hikka.io/comments/latest');
        setComments(response.data);
    };

    fetchComments();
  }, []);


  return (
      <Container>
      <RowLineHeader
        title="Коментарі"
        onPress={() => navigation.navigate('AnimeCharactersScreen')}
      />

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

              <CommentText numberOfLines={10}>{item.text}</CommentText>

              <TagsRow>
              <TypeTag>{commentType[item.content_type]}</TypeTag>
                <LinkTag numberOfLines={1}>{preview.title}</LinkTag>
              </TagsRow>
            </CommentCard>
          );
        })}
      </Container>
  );
};

export default LatestComments;
