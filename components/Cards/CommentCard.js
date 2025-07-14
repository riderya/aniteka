import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Markdown from 'react-native-markdown-display';
import { View, Modal, TouchableOpacity, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

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
const ShowToggle = styled.TouchableOpacity`
  flex-direction: row; align-items: center; border-radius: 999px; height: 45px;
  justify-content: center; background-color: ${({ theme }) => theme.colors.inputBackground};
  margin-top: 4px;
`;
const ShowText = styled.Text`
  color: ${({ theme }) => theme.colors.gray}; font-weight: bold;
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
const SpoilerToggle = styled.TouchableOpacity`
  flex-direction: row; align-self: flex-start; align-items: center;
  padding: 0px 24px; border-radius: 999px; height: 35px; justify-content: center;
  background-color: ${({ theme }) => theme.colors.inputBackground}; margin-top: 4px;
`;
const SpoilerText = styled.Text`
  color: ${({ theme }) => theme.colors.primary}; font-weight: 600; font-size: 12px;
`;
const SpoilerContentWrapper = styled.View`
  padding-left: 8px; border-left-width: 2px;
  border-left-color: ${({ theme }) => theme.colors.primary};
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

const CommentCard = ({
  item,
  index,
  theme,
  comment, // тип коментаря (наприклад, "comment")
  spoilerOpen,
  setSpoilerOpen,
  expandedComments,
  setExpandedComments,
  parseTextWithSpoilers,
  shouldTruncate,
  onDelete, // колбек для видалення в батьківському компоненті
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [voteScore, setVoteScore] = useState(item.vote_score);
  const [userVote, setUserVote] = useState(0);

  const commentSlug = item.slug || item.reference;

  useEffect(() => {
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
          setUserVote(0); // користувач ще не голосував
        } else {
          console.warn('Vote fetch error:', e);
        }
      }
    };
    fetchVote();
  }, []);

  const handleVote = async (score) => {
    if (!commentSlug) return;
    try {
      const token = await SecureStore.getItemAsync('hikka_token');

      if (userVote === score) {
        // Видаляємо голос
        await axios.put(
          `https://api.hikka.io/vote/comment/${commentSlug}`,
          { score: 0 },
          { headers: { auth: token } }
        );
        setVoteScore((prev) => prev - userVote);
        setUserVote(0);
      } else {
        // Ставимо новий голос
        await axios.put(
          `https://api.hikka.io/vote/comment/${commentSlug}`,
          { score },
          { headers: { auth: token } }
        );
        setVoteScore((prev) => prev - userVote + score);
        setUserVote(score);
      }
    } catch (e) {
      Alert.alert('Помилка', 'Не вдалося проголосувати. Спробуйте пізніше.');
    }
  };

const handleDelete = async () => {
  if (!commentSlug) return;
  try {
    const token = await SecureStore.getItemAsync('hikka_token');
    await axios.delete(`https://api.hikka.io/comments/${commentSlug}`, {
      headers: { auth: token },
    });

    Alert.alert('Готово', 'Коментар видалено.');
    closeModal();
    if (onDelete) onDelete(commentSlug); // виклик колбеку з батьківського компонента
  } catch (e) {
    console.warn('Помилка при видаленні коментаря:', e);
    Alert.alert('Помилка', 'Не вдалося видалити коментар.');
  }
};


  const handleLongPress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleCopy = () => {
    Clipboard.setString(item.text || '');
    Alert.alert('Скопійовано', 'Текст коментаря скопійовано в буфер обміну.');
    closeModal();
  };

  const createdDate = dayjs.unix(item.created);
  const formattedDate = createdDate.isToday()
    ? `сьогодні о ${createdDate.format('HH:mm')}`
    : createdDate.isYesterday()
    ? `вчора о ${createdDate.format('HH:mm')}`
    : createdDate.format('D MMM о HH:mm');

  const commentKey = item.reference || `comment-${index}`;
  const isExpanded = expandedComments[commentKey];
  const fullText = item.text || '';
  const displayText = !isExpanded && shouldTruncate(fullText)
    ? fullText.slice(0, 300) + '...'
    : fullText;

  const parsed = parseTextWithSpoilers(displayText);

  const renderMarkdownWithSpoilers = () => {
    return parsed.map((block, idx) => {
      const key = `${index}-${idx}`;
      if (block.type === 'text') {
        return (
          <Markdown
            key={`text-${key}`}
            style={{
              body: { color: theme.colors.text, fontSize: 14, lineHeight: 18 },
              link: { color: theme.colors.primary },
            }}
          >
            {block.content}
          </Markdown>
        );
      } else if (block.type === 'spoiler') {
        const isOpen = spoilerOpen[key] || false;
        return (
          <View key={`spoiler-${key}`}>
            <SpoilerToggle onPress={() =>
              setSpoilerOpen((prev) => ({ ...prev, [key]: !prev[key] }))
            }>
              <SpoilerText>
                {isOpen ? 'Приховати спойлер' : 'Показати спойлер'}
              </SpoilerText>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.primary}
                style={{ marginLeft: 6 }}
              />
            </SpoilerToggle>
            {isOpen && (
              <SpoilerContentWrapper>
                <Markdown style={{
                  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
                  link: { color: theme.colors.primary },
                }}>
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

  return (
    <>
    <TouchableOpacity onPress={handleLongPress} activeOpacity={0.9}>
        <CommentCardWrapper>
          <RowInfo>
            <Avatar
              source={{
                uri:
                  item.author?.avatar && item.author.avatar !== 'string'
                    ? item.author.avatar
                    : 'https://i.ibb.co/THsRK3W/avatar.jpg',
              }}
            />
            <CommentBody>
              <RowInfoTitle>
                <Username>{item.author?.username || 'Користувач'}</Username>
                <DateText>{formattedDate}</DateText>
              </RowInfoTitle>

              {renderMarkdownWithSpoilers()}

              {shouldTruncate(fullText) && (
                <ShowToggle onPress={() =>
                  setExpandedComments((prev) => ({
                    ...prev,
                    [commentKey]: !isExpanded,
                  }))
                }>
                  <ShowText>{isExpanded ? 'Приховати' : 'Читати більше...'}</ShowText>
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
                  <Pressable
                    onPress={() => handleVote(-1)}
                    style={{ opacity: userVote === -1 ? 1 : 0.5 }}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={22}
                      color={userVote === -1 ? theme.colors.error : theme.colors.gray}
                    />
                  </Pressable>

                  <LikeText vote={voteScore}>{voteScore}</LikeText>

                  <Pressable
                    onPress={() => handleVote(1)}
                    style={{ opacity: userVote === 1 ? 1 : 0.5 }}
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
        </CommentCardWrapper>
      </TouchableOpacity>

      {/* Modal */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={closeModal}>
        <ModalBackdrop onPress={closeModal}>
          <ModalContainer>
            <ModalButton onPress={closeModal}>
              <Ionicons name="star" size={20} color={theme.colors.gray} style={{ marginRight: 10 }} />
              <ModalButtonText>Оцінили</ModalButtonText>
            </ModalButton>
            <ModalButton onPress={handleCopy}>
              <Ionicons name="copy" size={20} color={theme.colors.gray} style={{ marginRight: 10 }} />
              <ModalButtonText>Скопіювати</ModalButtonText>
            </ModalButton>
            <ModalButton onPress={handleDelete}>
              <Ionicons name="trash" size={20} color={theme.colors.gray} style={{ marginRight: 10 }} />
              <ModalButtonText>Видалити</ModalButtonText>
            </ModalButton>
            <ModalButton isLast onPress={() => {
              closeModal();
              Alert.alert('Скарга', 'Скаргу надіслано.');
            }}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.gray} style={{ marginRight: 10 }} />
              <ModalButtonText>Поскаржитись</ModalButtonText>
            </ModalButton>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </>
  );
};

export default CommentCard;
