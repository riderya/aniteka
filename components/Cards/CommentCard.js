import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import Markdown from 'react-native-markdown-display';
import { View, Modal, TouchableOpacity, Pressable, Alert, Text, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


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

// === Внутрішній компонент SpoilerText ===
const SpoilerText = ({ text, theme }) => {
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSpoiler = async () => {
    if (!revealed) {
      setLoading(true);
      // Імітуємо завантаження для кращого UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    }
    setRevealed(prev => !prev);
  };

  return (
    <TouchableOpacity onPress={toggleSpoiler} activeOpacity={0.8} style={{ width: '100%', marginVertical: 4 }}>
      {revealed ? (
        <RevealedContainer theme={theme}>
          <Markdown 
            style={{
              body: {
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
              },
              link: {
                color: theme.colors.primary,
              },
            }}
          >
            {text}
          </Markdown>
        </RevealedContainer>
      ) : (
        <SpoilerContainer theme={theme}>
          <HiddenText>{text}</HiddenText>
          <SpoilerOverlay theme={theme}>
            <SpoilerMessage>
              {loading ? (
                <>
                  <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginBottom: 8 }} />
                  <SpoilerMessageLine theme={theme}>Завантаження...</SpoilerMessageLine>
                </>
              ) : (
                <>
                  <SpoilerMessageLine theme={theme}>Цей текст може містити спойлер.</SpoilerMessageLine>
                  <SpoilerMessageLineBold theme={theme}>Натисніть, щоб прочитати</SpoilerMessageLineBold>
                </>
              )}
            </SpoilerMessage>
          </SpoilerOverlay>
        </SpoilerContainer>
      )}
    </TouchableOpacity>
  );
};

const SpoilerContainer = styled.View`
  position: relative;
  padding: 8px;
  border-radius: 6px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const HiddenText = styled(Text)`
  font-size: 14px;
  line-height: 20px;
  color: transparent;
`;

const SpoilerOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  justify-content: center;
  align-items: center;
  border-radius: 6px;
`;

const SpoilerMessage = styled.View`
  align-items: center;
  padding: 8px;
`;

const SpoilerMessageLine = styled(Text)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  font-style: italic;
`;

const SpoilerMessageLineBold = styled(Text)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  font-weight: bold;
`;

const RevealedContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 8px;
  border-radius: 6px;
`;

// === Основний CommentCard ===
const CommentCard = ({
  item,
  index,
  theme,
  comment,
  spoilerOpen,
  setSpoilerOpen,
  parseTextWithSpoilers,
  onDelete,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [voteScore, setVoteScore] = useState(item.vote_score);
  const [userVote, setUserVote] = useState(0);
  const [currentUserRef, setCurrentUserRef] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [textTooLong, setTextTooLong] = useState(false);

  const commentSlug = item.slug || item.reference;

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
    fetchVote();
  }, []);

  const handleVote = async (score) => {
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
      } else {
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
      if (onDelete) onDelete(commentSlug);
    } catch (e) {
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

  const fullText = item.text || '';
  const parsed = parseTextWithSpoilers(fullText);

  // Обробник для визначення чи текст довший за 5 рядків
  const onTextLayout = (e) => {
    if (e.nativeEvent.lines.length > 5) {
      setTextTooLong(true);
    } else {
      setTextTooLong(false);
    }
  };

  const renderMarkdownWithSpoilers = () => {
    const textBlocks = parsed.map((block, idx) => {
      const key = `${index}-${idx}`;
      if (block.type === 'text') {
        return (
          <Markdown
            key={`text-${key}`}
            style={{
              body: {
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 18,
              },
              link: { color: theme.colors.primary },
            }}
          >
            {block.content}
          </Markdown>
        );
      } else if (block.type === 'spoiler') {
        return <SpoilerText key={`spoiler-${key}`} text={block.content} theme={theme} />;
      }
      return null;
    });

    if (!isExpanded) {
      return (
        <>
          <View
            style={{
              maxHeight: 17 * 5, // приблизно 5 рядків * lineHeight
              overflow: 'hidden',
            }}
          >
            {/* Прихований текст для підрахунку рядків */}
            <Text
              onTextLayout={onTextLayout}
              style={{
                position: 'absolute',
                opacity: 0,
                fontSize: 14,
                lineHeight: 18,
                width: '100%',
              }}
              numberOfLines={undefined}
            >
              {fullText}
            </Text>

            {/* Відображення Markdown та спойлерів */}
            {textBlocks}
          </View>

          {textTooLong && (
            <TouchableOpacity onPress={() => setIsExpanded(true)}>
              <ShowText style={{ marginTop: 8 }}>Показати більше...</ShowText>
            </TouchableOpacity>
          )}
        </>
      );
    } else {
      return (
        <>
          {textBlocks}
          <TouchableOpacity onPress={() => setIsExpanded(false)}>
            <ShowText style={{ marginTop: 8 }}>Згорнути</ShowText>
          </TouchableOpacity>
        </>
      );
    }
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

              <RowSpaceBeetwin>
                <ReplyText>Відповісти</ReplyText>
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
                Alert.alert('Скарга', 'Скаргу надіслано.');
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
