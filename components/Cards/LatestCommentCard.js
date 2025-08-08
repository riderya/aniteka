import React, { useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import SpoilerText from '../CommentForm/SpoilerText';
import * as WebBrowser from 'expo-web-browser';

const LatestCommentCard = React.memo(({ item, index, showIndex = false }) => {
  const navigation = useNavigation();

  const commentType = {
    collection: 'Колекція',
    edit: 'Правка',
    article: 'Стаття',
    anime: 'Аніме',
    novel: 'Ранобе',
    character: 'Персонаж',
    person: 'Особа',
  };

  const timeAgo = useCallback((created) => {
    const secondsAgo = Math.floor(Date.now() / 1000) - created;
    if (secondsAgo < 60) return `щойно`;
    if (secondsAgo < 3600) return `близько ${Math.floor(secondsAgo / 60)} хв тому`;
    if (secondsAgo < 86400) return `близько ${Math.floor(secondsAgo / 3600)} год тому`;
    return `близько ${Math.floor(secondsAgo / 86400)} днів тому`;
  }, []);

  const handleNavigate = useCallback((item) => {
    const { content_type, preview } = item;
    
    if (!preview?.slug) return;

    switch (content_type) {
      case 'anime':
        navigation.navigate('AnimeDetails', { slug: preview.slug });
        break;
      case 'novel':
        WebBrowser.openBrowserAsync(`https://hikka.io/novel/${preview.slug}`);
        break;
      case 'article':
        navigation.navigate('ArticleDetailScreen', { slug: preview.slug });
        break;
      case 'collection':
        navigation.navigate('CollectionDetailScreen', { reference: preview.slug });
        break;
      case 'character':
        navigation.navigate('AnimeCharacterDetailsScreen', { slug: preview.slug });
        break;
      case 'person':
        navigation.navigate('AnimePeopleDetailsScreen', { slug: preview.slug });
        break;
      case 'edit':
        console.log('Перехід на правку не реалізований');
        break;
      default:
        console.log(`Невідомий тип контенту: ${content_type}`);
    }
  }, [navigation]);

  const parseCommentText = useCallback((text) => {
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
  }, []);

  const RenderCommentText = useCallback(({ text }) => {
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
  }, [parseCommentText]);

  const avatar = item.author?.avatar || 'https://ui-avatars.com/api/?name=?';
  const username = item.author?.username || 'Користувач';
  const time = timeAgo(item.created);
  const preview = item.preview || {};

  return (
    <CommentCardContainer>
      {showIndex && <CommentIndex>#{index + 1}</CommentIndex>}
      <CommentCard>
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
          {preview?.slug && (
            <TouchableOpacity onPress={() => handleNavigate(item)}>
              <LinkTag numberOfLines={1}>{preview.title || 'Без назви'}</LinkTag>
            </TouchableOpacity>
          )}
        </TagsRow>
      </CommentCard>
    </CommentCardContainer>
  );
});

LatestCommentCard.displayName = 'LatestCommentCard';

export default LatestCommentCard;

// --- Styled Components ---

const CommentCardContainer = styled.View`
  position: relative;
  margin-bottom: 20px;
`;

const CommentIndex = styled.Text`
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 4px 14px;
  border-radius: 999px;
  text-align: center;
  z-index: 999;
  top: -15px;
  left: 10px;
`;

const CommentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  padding: 16px;
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
  text-decoration-line: underline;
`;

const TypeTag = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
  font-weight: 500;
  padding: 5px 16px;
  border-radius: 999px;
`;
