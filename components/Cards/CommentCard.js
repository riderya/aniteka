import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import Markdown from '../Custom/MarkdownText';
import { View, Modal, TouchableOpacity, Pressable, Alert, Text, FlatList } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import CommentForm from '../CommentForm/CommentForm';
import { LinearGradient } from 'expo-linear-gradient';


dayjs.extend(isToday);
dayjs.extend(isYesterday);

const CommentCardWrapper = styled.View`
  margin: 12px 0px;
`;
const RowInfo = styled.View`flex-direction: row;`;
const Avatar = styled.Image`
  width: 50px; height: 50px; border-radius: 999px; margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.card};
`;
const CommentBody = styled.View`flex: 1;`;
const RowInfoTitle = styled.View`flex-direction: row; gap: 12px; margin-bottom: 8px;`;
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
  padding: 25px; border-radius: 32px; width: 90%;
`;
const ModalButton = styled.TouchableOpacity`
  flex-direction: row; align-items: center; padding: 6px 0px;
  margin-bottom: ${({ isLast }) => (isLast ? '0px' : '16px')};
`;
const ModalButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.gray}; font-size: 16px; font-weight: 500;
`;

const ReplyContainer = styled.View`
  margin-left: 62px;
  margin-top: 8px;
  border-left-width: 2px;
  border-left-color: ${({ theme }) => theme.colors.border};
  padding-left: 12px;
`;

const ReplyItem = styled.View`
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ReplyHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const ReplyAvatar = styled.Image`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  margin-right: 8px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const ReplyUsername = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
`;

const ReplyDate = styled.Text`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray};
  margin-left: 8px;
`;

const ReplyActions = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
`;

const ReplyVoteContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ReplyVoteText = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray};
`;

const ShowRepliesButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  align-self: flex-start;
`;

const ShowRepliesText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  margin-left: 4px;
`;

const ReplyFormContainer = styled.View`
  margin-top: 8px;
  margin-left: 62px;
  padding-left: 12px;
`;


// === Основний CommentCard ===
const CommentCard = ({
  item,
  index,
  theme,
  comment,
  onDelete,
  onReply,
  navigation,
  content_type = 'anime',
  slug,
  hideRepliesIndicator = false, // Новий параметр для приховування індикатора відповідей
  parentComment = null, // Батьківський коментар для відображення імені користувача
  refreshKey = 0, // Ключ для примусового оновлення
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [voteScore, setVoteScore] = useState(item.vote_score);
  const [userVote, setUserVote] = useState(0);
  const [currentUserRef, setCurrentUserRef] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [repliesCount, setRepliesCount] = useState(0);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const commentSlug = item.slug || item.reference;
  const fullText = item.text || '';

  // Функція для перевірки наявності спойлерів у тексті
  const hasSpoilers = (text) => {
    const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
    return spoilerRegex.test(text);
  };

  const maxLines = 5;
  const shouldShowToggle = React.useMemo(() => {
    // Показуємо кнопку коли є 2 рядки І спойлер
    const hasSpoiler = hasSpoilers(fullText);
    const isLongEnough = fullText.length > 100; // Зменшуємо поріг для 2 рядків
    return isLongEnough && hasSpoiler && !isExpanded;
  }, [fullText, isExpanded]);



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
        const directReplies = res.data.replies || [];
        
        // Рекурсивно підраховуємо всі відповіді
        const countAllReplies = async (replies, level = 0) => {
          if (!replies || replies.length === 0 || level > 5) return 0; // Обмежуємо глибину до 5 рівнів
          
          let totalCount = replies.length;
          
          for (const reply of replies) {
            if (level < 5) {
              try {
                const nestedRes = await axios.get(`https://api.hikka.io/comments/thread/${reply.reference}`);
                const nestedReplies = nestedRes.data.replies || [];
                if (nestedReplies.length > 0) {
                  totalCount += await countAllReplies(nestedReplies, level + 1);
                }
              } catch (e) {
                // Якщо немає відповідей або помилка, продовжуємо
                console.log(`Немає відповідей для коментаря ${reply.reference}`);
              }
            }
          }
          
          return totalCount;
        };
        
        const totalReplies = await countAllReplies(directReplies);
        setRepliesCount(totalReplies);
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

  }, [fullText, commentSlug, comment, refreshKey]);

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
    // Використовуємо оригінальний текст для копіювання
    const originalText = item.text || '';
    Clipboard.setString(originalText);
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
    // Використовуємо оригінальний текст без додаткової обробки
    let displayText = fullText;
    
    // Додаємо ім'я користувача, на якого відповідаємо (якщо це відповідь)
    if (item.parentInfo && item.parentInfo.username) {
      const parentUsername = item.parentInfo.username;
      if (!fullText.startsWith(`@${parentUsername}`)) {
        displayText = `@${parentUsername}, ${fullText}`;
      }
    }
    
    return (
      <>
        <View style={{ 
          maxHeight: isExpanded ? undefined : maxLines * 18, // maxLines * lineHeight
          overflow: isExpanded ? 'visible' : 'hidden',
          position: 'relative',
          zIndex: 1,
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
            disableLinks
          >
            {displayText}
          </Markdown>
          
          {/* Градієнт для плавного переходу при обрізанні */}
          {!isExpanded && shouldShowToggle && (
            <LinearGradient
              colors={[`${theme.colors.background}00`, theme.colors.background]} // Прозорий до непрозорого
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 20,
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          )}
        </View>

        {(shouldShowToggle || isExpanded) && (
          <TouchableOpacity 
            onPress={() => setIsExpanded(!isExpanded)}
            style={{ 
              marginTop: shouldShowToggle && !isExpanded ? 4 : 8,
              zIndex: 3 
            }}
          >
            <ShowText>
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
        <CommentCardWrapper 
          style={{ opacity: item.is_optimistic ? 0.8 : 1 }}
        >
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
                      if (onReply) {
                        onReply(item);
                      } else if (navigation) {
                        navigation.navigate('CommentRepliesScreen', {
                          parentComment: item,
                          contentType: content_type,
                          slug: slug,
                          title: 'Відповіді'
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
            {repliesCount > 0 && !hideRepliesIndicator && (
              <ReplyIndicatorContainer>
                <ReplyLine />
                <ReplyIndicatorButton
                  onPress={(e) => {
                    e.stopPropagation();
                    if (navigation) {
                      navigation.navigate('CommentRepliesScreen', {
                        parentComment: item,
                        contentType: content_type,
                        slug: slug,
                        title: 'Відповіді'
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
