import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import Markdown from '../Custom/MarkdownText';
import { View, TouchableOpacity, Pressable, Alert, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { processCommentText } from '../../utils/textUtils';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const CommentCardWrapper = styled.View`
  margin: 8px 12px;
  margin-left: ${({ level }) => 12 + (level * 16)}px;
`;

const RowInfo = styled.View`flex-direction: row;`;

const Avatar = styled.Image`
  width: 40px; 
  height: 40px; 
  border-radius: 20px; 
  margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const CommentBody = styled.View`flex: 1;`;

const RowInfoTitle = styled.View`
  flex-direction: row; 
  gap: 12px; 
  margin-bottom: 4px;
  align-items: center;
`;

const Username = styled.Text`
  font-weight: bold; 
  color: ${({ theme }) => theme.colors.text}; 
  font-size: 14px;
`;

const DateText = styled.Text`
  font-size: 12px; 
  color: ${({ theme }) => theme.colors.gray};
`;

const EditIcon = styled(Ionicons)`
  margin-left: 4px;
  color: ${({ theme }) => theme.colors.gray};
`;

const RowSpaceBeetwin = styled.View`
  flex-direction: row; 
  align-items: center; 
  justify-content: space-between; 
  margin-top: 8px;
`;

const RowLike = styled.View`flex-direction: row; align-items: center; gap: 8px;`;

const LikeText = styled.Text`
  font-weight: bold;
  color: ${({ vote, theme }) =>
    vote > 0 ? theme.colors.success :
    vote < 0 ? theme.colors.error :
    theme.colors.gray};
`;

const ShowText = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 8px 12px;
  border-radius: 999px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray}; 
  font-weight: bold;
  font-size: 12px;
`;

const ReplyText = styled.Text`
  color: ${({ theme }) => theme.colors.gray}; 
  font-weight: bold;
  font-size: 12px;
`;

const OptimisticIndicator = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}20;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  padding: 4px 8px;
  margin-left: 8px;
  flex-direction: row;
  align-items: center;
`;

const OptimisticText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: bold;
  margin-left: 4px;
`;

const HierarchicalCommentCard = ({
  item,
  level = 0,
  theme,
  onReply,
  onDelete,
  navigation,
  content_type = 'anime',
  slug,
}) => {
  const [voteScore, setVoteScore] = useState(item.vote_score || 0);
  const [userVote, setUserVote] = useState(0);
  const [currentUserRef, setCurrentUserRef] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const commentSlug = item.slug || item.reference;
  const fullText = item.text || '';

  const maxLines = 5;
  const shouldShowToggle = fullText.length > 200 && !isExpanded;

  // Функція для створення скороченого тексту
  const getTruncatedText = (text, maxLength = 200) => {
    const cleanedText = processCommentText(text);
    if (cleanedText.length <= maxLength) return cleanedText;
    return cleanedText.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    (async () => {
      const refRaw = await SecureStore.getItemAsync('hikka_user_reference');
      const ref = refRaw?.trim();
      setCurrentUserRef(ref);
    })();

    const fetchVote = async () => {
      if (!commentSlug) return;
      try {
        const token = await SecureStore.getItemAsync('hikka_token');
        const res = await axios.get(`https://api.hikka.io/vote/comment/${commentSlug}`, {
          headers: { auth: token },
        });
        setUserVote(res.data.score);
      } catch (e) {
        if (e.response?.status === 404) {
          setUserVote(0);
        }
      }
    };

    fetchVote();
  }, [commentSlug]);

  const handleVote = async (vote) => {
    if (!commentSlug || item.is_optimistic) return;
    
    try {
      const token = await SecureStore.getItemAsync('hikka_token');
      const res = await axios.post(
        `https://api.hikka.io/vote/comment/${commentSlug}`,
        { score: vote },
        { headers: { auth: token } }
      );
      
      setVoteScore(res.data.vote_score);
      setUserVote(vote);
    } catch (e) {
      console.error('Помилка при голосуванні:', e);
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося проголосувати',
      });
    }
  };

  const handleDelete = async () => {
    if (!commentSlug || item.is_optimistic) return;
    
    Alert.alert(
      'Видалити коментар',
      'Ви впевнені, що хочете видалити цей коментар?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('hikka_token');
              await axios.delete(`https://api.hikka.io/comments/${commentSlug}`, {
                headers: { auth: token },
              });
              
              onDelete(commentSlug);
              Toast.show({
                type: 'success',
                text1: 'Коментар видалено',
                text2: 'Коментар успішно видалено',
              });
            } catch (e) {
              console.error('Помилка при видаленні коментаря:', e);
              Toast.show({
                type: 'error',
                text1: 'Помилка',
                text2: 'Не вдалося видалити коментар',
              });
            }
          },
        },
      ]
    );
  };

  const handleCopy = () => {
    const cleanedText = processCommentText(item.text || '');
    Clipboard.setString(cleanedText);
    Toast.show({
      type: 'success',
      text1: 'Скопійовано',
      text2: 'Текст коментаря скопійовано в буфер обміну',
    });
  };

  const createdDate = dayjs.unix(item.created);
  const formattedDate = createdDate.isToday()
    ? `сьогодні о ${createdDate.format('HH:mm')}`
    : createdDate.isYesterday()
    ? `вчора о ${createdDate.format('HH:mm')}`
    : createdDate.format('D MMM о HH:mm');

  const handleUserPress = () => {
    if (navigation && item.author?.username) {
      navigation.navigate('UserProfileScreen', { username: item.author.username });
    }
  };

  const renderMarkdownWithSpoilers = () => {
    const cleanedFullText = processCommentText(fullText);
    
    return (
      <>
        <View style={{ 
          maxHeight: isExpanded ? undefined : maxLines * 18, // maxLines * lineHeight
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Markdown
            style={{
              body: {
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 18,
              },
              link: { color: theme.colors.primary },
              paragraph: {
                marginVertical: 0,
              },
            }}
            hideSpoilers={!isExpanded}
          >
            {cleanedFullText}
          </Markdown>
        </View>

        {shouldShowToggle && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <ShowText style={{ marginTop: 8 }}>
              {isExpanded ? 'Згорнути' : 'Показати більше...'}
            </ShowText>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <CommentCardWrapper level={level}>
      <RowInfo>
        <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
          <Avatar
            source={{
              uri:
                item.author?.avatar && item.author.avatar !== 'string'
                  ? item.author.avatar
                  : 'https://i.ibb.co/THsRK3W/avatar.jpg',
            }}
          />
        </TouchableOpacity>
        <CommentBody>
          <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
            <RowInfoTitle>
              <Username>{item.author?.username || 'Користувач'}</Username>
              <DateText>{formattedDate}</DateText>
              {item.is_edited && <EditIcon name="pencil" size={12} />}
            </RowInfoTitle>
          </TouchableOpacity>

          {renderMarkdownWithSpoilers()}

          <RowSpaceBeetwin>
            <TouchableOpacity
              onPress={() => onReply(item)}
              activeOpacity={0.7}
            >
              <ReplyText>Відповісти</ReplyText>
            </TouchableOpacity>
            <RowLike>
              <Pressable
                onPress={() => handleVote(-1)}
                style={{ 
                  opacity: item.is_optimistic ? 0.3 : (userVote === -1 ? 1 : 0.5) 
                }}
                disabled={item.is_optimistic}
              >
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={userVote === -1 ? theme.colors.error : theme.colors.gray}
                />
              </Pressable>

              <LikeText vote={voteScore}>{voteScore}</LikeText>

              <Pressable
                onPress={() => handleVote(1)}
                style={{ 
                  opacity: item.is_optimistic ? 0.3 : (userVote === 1 ? 1 : 0.5) 
                }}
                disabled={item.is_optimistic}
              >
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={userVote === 1 ? theme.colors.success : theme.colors.gray}
                />
              </Pressable>
            </RowLike>
          </RowSpaceBeetwin>
        </CommentBody>
      </RowInfo>
    </CommentCardWrapper>
  );
};

export default HierarchicalCommentCard;
