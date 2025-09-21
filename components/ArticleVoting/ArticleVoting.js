import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Share } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const ArticleVoting = ({ 
  articleSlug, 
  title,
  initialScore = 0, 
  commentsCount = 0,
  onVoteChange,
  navigation 
}) => {
  const { theme } = useTheme();
  const { token: authToken } = useAuth();
  const [currentVote, setCurrentVote] = useState(0);
  const [voteScore, setVoteScore] = useState(initialScore);
  const [voteLoading, setVoteLoading] = useState(false);

  // Оновлюємо voteScore коли змінюється initialScore
  useEffect(() => {
    setVoteScore(initialScore);
  }, [initialScore]);

  useEffect(() => {
    checkVoteStatus();
  }, [articleSlug]);

  const checkVoteStatus = async () => {
    if (!authToken) return;

    // Перевіряємо чи є articleSlug
    if (!articleSlug) {
      return;
    }

    try {
      const headers = {
        auth: authToken,
      };
      const response = await axios.get(
        `https://api.hikka.io/vote/article/${articleSlug}`,
        { headers }
      );
      if (response.data && typeof response.data.score === 'number') {
        setCurrentVote(response.data.score);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error checking vote status:', error);
      }
    }
  };

  const handleVote = async (voteValue) => {
    if (voteLoading) return;
    
    if (!authToken) {
      Toast.show({
        type: 'info',
        text1: 'Потрібна авторизація',
        text2: 'Щоб голосувати, потрібно увійти в акаунт.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    // Перевіряємо чи є articleSlug
    if (!articleSlug) {
      Toast.show({
        type: 'error',
        text1: 'Помилка при голосуванні',
      });
      return;
    }
    
    setVoteLoading(true);

    try {
      const newVote = currentVote === voteValue ? 0 : voteValue;
      
      const headers = {
        auth: authToken,
      };
      
      // Відправляємо голос
      await axios.put(
        `https://api.hikka.io/vote/article/${articleSlug}`,
        { score: newVote },
        { headers }
      );

      setCurrentVote(newVote);
      
      // Оновлюємо загальний рахунок локально
      let newVoteScore = voteScore;
      if (currentVote === 1 && newVote === 0) {
        // Було +1, стало 0 - віднімаємо 1
        newVoteScore = voteScore - 1;
      } else if (currentVote === -1 && newVote === 0) {
        // Було -1, стало 0 - додаємо 1
        newVoteScore = voteScore + 1;
      } else if (currentVote === 0 && newVote === 1) {
        // Було 0, стало +1 - додаємо 1
        newVoteScore = voteScore + 1;
      } else if (currentVote === 0 && newVote === -1) {
        // Було 0, стало -1 - віднімаємо 1
        newVoteScore = voteScore - 1;
      } else if (currentVote === 1 && newVote === -1) {
        // Було +1, стало -1 - віднімаємо 2
        newVoteScore = voteScore - 2;
      } else if (currentVote === -1 && newVote === 1) {
        // Було -1, стало +1 - додаємо 2
        newVoteScore = voteScore + 2;
      }
      
      setVoteScore(newVoteScore);
      
      // Показуємо тост в залежності від типу голосу
      if (newVote === 1) {
        Toast.show({
          type: 'success',
          text1: 'Ви поставили лайк',
        });
      } else if (newVote === -1) {
        Toast.show({
          type: 'success',
          text1: 'Ви поставили дизлайк',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Ваш голос скасовано',
        });
      }
      
      if (onVoteChange) {
        onVoteChange(newVote);
      }
    } catch (error) {
      console.error('Error voting:', error);
      Toast.show({
        type: 'error',
        text1: 'Помилка при голосуванні',
      });
    } finally {
      setVoteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://hikka.io/article/${articleSlug}`;
      await Share.share({
        message: `${title}\n\n${shareUrl}`,
        url: shareUrl,
        title: title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Container>
      {/* Vote Counter Section */}
      <VoteSection>
        <VoteButton 
          onPress={() => handleVote(1)}
          disabled={voteLoading}
          activeOpacity={0.7}
        >
          <Entypo 
            name="chevron-up" 
            size={20} 
            color={currentVote === 1 ? theme.colors.success : theme.colors.gray} 
          />
        </VoteButton>
        
        <VoteScore style={{ 
          color: currentVote === 1 ? theme.colors.success : 
                 currentVote === -1 ? theme.colors.error : 
                 theme.colors.gray
        }}>
          {voteScore}
        </VoteScore>
        
        <VoteButton 
          onPress={() => handleVote(-1)}
          disabled={voteLoading}
          activeOpacity={0.7}
        >
          <Entypo 
            name="chevron-down" 
            size={20} 
            color={currentVote === -1 ? theme.colors.error : theme.colors.gray} 
          />
        </VoteButton>
      </VoteSection>

      {/* Comments Section */}
      <CommentSection 
        onPress={() => navigation.navigate('CommentsDetailsScreen', { 
          contentType: 'article', 
          slug: articleSlug,
          title: title,
          commentsCount: commentsCount
        })}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="chatbubble-ellipses-outline" 
          size={18} 
          color={theme.colors.gray}
        />
        <CommentText>{commentsCount}</CommentText>
      </CommentSection>
    </Container>
  );
};

const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

const VoteSection = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const VoteButton = styled.Pressable`
  padding: 4px;
`;

const VoteScore = styled.Text`
  font-size: 16px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const CommentSection = styled.Pressable`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 12px 20px;
  gap: 6px;
  margin-left: 8px;
`;

const CommentText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: 500;
`;

export default ArticleVoting;
