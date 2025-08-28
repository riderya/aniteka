import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import Markdown from '../Custom/MarkdownText';
import { View, Modal, TouchableOpacity, Pressable, Alert, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { processCommentText } from '../../utils/textUtils';



dayjs.extend(isToday);
dayjs.extend(isYesterday);

const CommentCardWrapper = styled.View`margin: 12px;`;
const RowInfo = styled.View`flex-direction: row;`;
const Avatar = styled.Image`
  width: 50px; height: 50px; border-radius: 999px; margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.card};
`;
const CommentBody = styled.View`flex: 1;`;
const RowInfoTitle = styled.View`flex-direction: row; gap: 12px;`;
const Username = styled.Text`
  font-weight: bold; color: ${({ theme }) => theme.colors.text}; font-size: 14px;
`;
const DateText = styled.Text`
  font-size: 14px; color: ${({ theme }) => theme.colors.gray};
`;
const RowSpaceBeetwin = styled.View`
  flex-direction: row; align-items: center; justify-content: space-between; margin-top: 8px;
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
  padding: 12px;
  border-radius: 999px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray}; font-weight: bold;
`;

const ReplyText = styled.Text`
  color: ${({ theme }) => theme.colors.gray}; font-weight: bold;
`;

const ReplyIndicatorContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  margin-left: 62px; /* Відступ під аватар */
`;

const ReplyLine = styled.View`
  width: 2px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.border};
  margin-right: 8px;
`;

const ReplyIndicatorText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: 500;
`;

const ReplyIndicatorButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
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

const ModalBackdrop = styled.Pressable`
  flex: 1; background-color: rgba(0, 0, 0, 0.6); justify-content: center; align-items: center;
`;
const ModalContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 25px; border-radius: 36px; width: 90%;
`;
const ModalButton = styled.TouchableOpacity`
  flex-direction: row; align-items: center; padding: 6px 0px;
  margin-bottom: ${({ isLast }) => (isLast ? '0px' : '16px')};
`;
const ModalButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.gray}; font-size: 16px; font-weight: 500;
`;


// === Основний CommentCard ===
const CommentCard = ({
  item,
  index,
  theme,
  comment,
  onDelete,
  navigation,
  content_type = 'anime',
  slug,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [voteScore, setVoteScore] = useState(item.vote_score);
  const [userVote, setUserVote] = useState(0);
  const [currentUserRef, setCurrentUserRef] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [repliesCount, setRepliesCount] = useState(0);

  const commentSlug = item.slug || item.reference;
  const fullText = item.text || '';

  const maxLines = 5;
  const shouldShowToggle = fullText.length > 200 && !isExpanded; // 5 рядків * ~40 символів

  // Функція для перевірки наявності спойлерів у тексті
  const hasSpoilers = (text) => {
    const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
    return spoilerRegex.test(text);
  };

  // Функція для створення скороченого тексту з обробкою спойлерів
  const getTruncatedText = (text, maxLength = 200) => {
    // Спочатку очищуємо текст
    const cleanedText = processCommentText(text);
    
    if (cleanedText.length <= maxLength) return cleanedText;
    
    const truncated = cleanedText.substring(0, maxLength);
    const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
    
    // Перевіряємо, чи є спойлери в повному тексті
    const hasSpoilersInFull = hasSpoilers(cleanedText);
    
    // Замінюємо спойлери на [спойлер] в скороченому тексті
    let processedText = truncated.replace(spoilerRegex, '[спойлер]');
    
    // Якщо в повному тексті є спойлери, але в скороченому їх немає (обрізалися),
    // або якщо скорочений текст закінчується на частині спойлера
    if (hasSpoilersInFull && !processedText.includes('[спойлер]')) {
      // Перевіряємо, чи скорочений текст закінчується на частині спойлера
      const lastSpoilerStart = cleanedText.lastIndexOf(':::spoiler', maxLength);
      if (lastSpoilerStart !== -1 && lastSpoilerStart < maxLength) {
        // Обрізаємо до початку спойлера і додаємо [спойлер]
        processedText = truncated.substring(0, lastSpoilerStart) + '[спойлер]';
      } else {
        // Якщо спойлер повністю за межами скороченого тексту, додаємо [спойлер] в кінець
        processedText += ' [спойлер]';
      }
    }
    
    return processedText + '...';
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
        const res = await axios.get(`https://api.hikka.io/vote/${comment}/${commentSlug}`, {
          headers: { auth: token },
        });
        setUserVote(res.data.score);
      } catch (e) {
        if (e.response?.status === 404) {
          setUserVote(0);
        }
      }
    };

    const fetchRepliesCount = async () => {
      if (!commentSlug) return;
      try {
        const res = await axios.get(`https://api.hikka.io/comments/thread/${commentSlug}`);
        setRepliesCount(res.data.replies?.length || 0);
      } catch (e) {
        // Якщо немає відповідей або API не підтримує відповіді, встановлюємо 0
        if (e.response?.status === 404 || e.response?.status === 400) {
          setRepliesCount(0);
        } else {
          console.error('Помилка при отриманні кількості відповідей:', e);
          setRepliesCount(0);
        }
      }
    };

    fetchVote();
    fetchRepliesCount();

  }, [fullText, commentSlug, comment]);

  const handleVote = async (score) => {
    // Не дозволяємо голосувати за оптимістичні коментарі
    if (item.is_optimistic) {
      Toast.show({
        type: 'info',
        text1: 'Зачекайте',
        text2: 'Коментар ще відправляється...',
      });
      return;
    }
    
    if (!commentSlug) return;
    try {
      const token = await SecureStore.getItemAsync('hikka_token');

      if (userVote === score) {
        await axios.put(
          `https://api.hikka.io/vote/comment/${commentSlug}`,
          { score: 0 },
          { headers: { auth: token } }
        );
        setVoteScore((prev) => prev - userVote);
        setUserVote(0);
        
        // Показуємо тост про скасування голосу
        Toast.show({
          type: 'info',
          text1: 'Голос скасовано',
          text2: 'Ваш голос було видалено',
        });
      } else {
        await axios.put(
          `https://api.hikka.io/vote/comment/${commentSlug}`,
          { score },
          { headers: { auth: token } }
        );
        setVoteScore((prev) => prev - userVote + score);
        setUserVote(score);
        
        // Показуємо тост відповідно до типу голосу
        if (score === 1) {
          Toast.show({
            type: 'success',
            text1: 'Лайк поставлено!',
            text2: 'Ви поставили позитивну оцінку',
          });
        } else if (score === -1) {
          Toast.show({
            type: 'success',
            text1: 'Дизлайк поставлено',
            text2: 'Ви поставили негативну оцінку',
          });
        }
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Помилка голосування',
        text2: 'Не вдалося проголосувати. Спробуйте пізніше.',
      });
    }
  };

  const handleDelete = async () => {
    // Не дозволяємо видаляти оптимістичні коментарі
    if (item.is_optimistic) {
      Toast.show({
        type: 'info',
        text1: 'Зачекайте',
        text2: 'Коментар ще відправляється...',
      });
      return;
    }
    
    if (!commentSlug) return;
    try {
      const token = await SecureStore.getItemAsync('hikka_token');
      await axios.delete(`https://api.hikka.io/comments/${commentSlug}`, {
        headers: { auth: token },
      });

      Toast.show({
        type: 'success',
        text1: 'Коментар видалено',
        text2: 'Ваш коментар успішно видалено',
      });
      closeModal();
      if (onDelete) onDelete(commentSlug);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Помилка видалення',
        text2: 'Не вдалося видалити коментар',
      });
    }
  };

  const handleLongPress = () => {
    // Не дозволяємо відкривати меню для оптимістичних коментарів
    if (item.is_optimistic) {
      return;
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleCopy = () => {
    // Очищуємо текст перед копіюванням
    const cleanedText = processCommentText(item.text || '');
    Clipboard.setString(cleanedText);
    Toast.show({
      type: 'success',
      text1: 'Скопійовано',
      text2: 'Текст коментаря скопійовано в буфер обміну',
    });
    closeModal();
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
      // Очищуємо текст перед відображенням
      const cleanedFullText = processCommentText(fullText);
      
      return (
        <>
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
            numberOfLines={isExpanded ? undefined : maxLines}
            ellipsizeMode="tail"
            hideSpoilers={!isExpanded}
          >
            {isExpanded ? cleanedFullText : getTruncatedText(cleanedFullText)}
          </Markdown>

          {(shouldShowToggle || isExpanded) && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <ShowText style={{ marginTop: 4 }}>
                {isExpanded ? 'Згорнути' : 'Показати більше...'}
              </ShowText>
            </TouchableOpacity>
          )}
        </>
      );
    };

  return (
    <>
      <TouchableOpacity 
        onLongPress={handleLongPress} 
        activeOpacity={item.is_optimistic ? 1 : 0.9}
        disabled={item.is_optimistic}
      >
        <CommentCardWrapper style={{ opacity: item.is_optimistic ? 0.8 : 1 }}>
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
                  </RowInfoTitle>
                </TouchableOpacity>

              {renderMarkdownWithSpoilers()}

                                             <RowSpaceBeetwin>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (navigation) {
                        navigation.replace('CommentRepliesScreen', {
                          parentComment: item,
                          contentType: content_type,
                          slug: slug,
                          title: 'Відповіді на коментар'
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <ReplyText>Відповісти</ReplyText>
                  </TouchableOpacity>
                  <RowLike>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation(); // Зупиняємо поширення події
                        handleVote(-1);
                      }}
                      style={{ 
                        opacity: item.is_optimistic ? 0.3 : (userVote === -1 ? 1 : 0.5) 
                      }}
                      disabled={item.is_optimistic}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={22}
                        color={userVote === -1 ? theme.colors.error : theme.colors.gray}
                      />
                    </Pressable>

                    <LikeText vote={voteScore}>{voteScore}</LikeText>

                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation(); // Зупиняємо поширення події
                        handleVote(1);
                      }}
                      style={{ 
                        opacity: item.is_optimistic ? 0.3 : (userVote === 1 ? 1 : 0.5) 
                      }}
                      disabled={item.is_optimistic}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={22}
                        color={userVote === 1 ? theme.colors.success : theme.colors.gray}
                      />
                    </Pressable>
                  </RowLike>
                </RowSpaceBeetwin>
              </CommentBody>
            </RowInfo>
            
            {/* Індикатор відповідей */}
            {repliesCount > 0 && (
              <ReplyIndicatorContainer>
                <ReplyLine />
                <ReplyIndicatorButton
                  onPress={(e) => {
                    e.stopPropagation();
                    if (navigation) {
                      navigation.replace('CommentRepliesScreen', {
                        parentComment: item,
                        contentType: content_type,
                        slug: slug,
                        title: 'Відповіді на коментар'
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <ReplyIndicatorText>
                    Показати {repliesCount} {repliesCount === 1 ? 'відповідь' : repliesCount < 5 ? 'відповіді' : 'відповідей'} {'>'}
                  </ReplyIndicatorText>
                </ReplyIndicatorButton>
              </ReplyIndicatorContainer>
            )}
        </CommentCardWrapper>
      </TouchableOpacity>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={closeModal}>
        <ModalBackdrop onPress={closeModal}>
          <ModalContainer>
            <ModalButton onPress={handleCopy}>
              <Ionicons name="copy" size={20} color={theme.colors.gray} style={{ marginRight: 10 }} />
              <ModalButtonText>Скопіювати</ModalButtonText>
            </ModalButton>

            {currentUserRef && currentUserRef === item.author?.reference && (
              <ModalButton onPress={handleDelete}>
                <Ionicons name="trash" size={20} color={theme.colors.gray} style={{ marginRight: 10 }} />
                <ModalButtonText>Видалити</ModalButtonText>
              </ModalButton>
            )}

            <ModalButton
              isLast
              onPress={() => {
                closeModal();
                Toast.show({
                  type: 'info',
                  text1: 'Скарга надіслана',
                  text2: 'Ваша скарга передана на розгляд',
                });
              }}
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color={theme.colors.gray}
                style={{ marginRight: 10 }}
              />
              <ModalButtonText>Поскаржитись</ModalButtonText>
            </ModalButton>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </>
  );
};

export default CommentCard;
