import React, { useCallback, useState, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Markdown from '../Custom/MarkdownText';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';

const LatestCommentCard = React.memo(({ item, index, showIndex = false }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const commentType = useMemo(() => ({
    collection: 'Колекція',
    edit: 'Правка',
    article: 'Стаття',
    anime: 'Аніме',
    novel: 'Ранобе',
    character: 'Персонаж',
    person: 'Особа',
  }), []);

  const timeAgo = useCallback((created) => {
    const secondsAgo = Math.floor(Date.now() / 1000) - created;
    if (secondsAgo < 60) return `щойно`;
    if (secondsAgo < 3600) return `близько ${Math.floor(secondsAgo / 60)} хв тому`;
    if (secondsAgo < 86400) return `близько ${Math.floor(secondsAgo / 3600)} год тому`;
    return `близько ${Math.floor(secondsAgo / 86400)} днів тому`;
  }, []);

  const fullText = useMemo(() => item.text || '', [item.text]);
  
  // Функція для перевірки наявності спойлерів у тексті
  const hasSpoilers = useCallback((text) => {
    const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
    return spoilerRegex.test(text);
  }, []);

  const maxLines = useMemo(() => 5, []);
  const shouldShowToggle = React.useMemo(() => {
    // Показуємо кнопку тільки для довгих текстів (більше 200 символів)
    return fullText.length > 200 && !isExpanded;
  }, [fullText, isExpanded]);

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


  const handleUserPress = useCallback(() => {
    if (item.author?.username) {
      navigation.navigate('UserProfileScreen', { username: item.author.username });
    }
  }, [navigation, item.author?.username]);

  const renderMarkdownWithSpoilers = useCallback(() => {
    // Використовуємо оригінальний текст без додаткової обробки
    let displayText = fullText.trimEnd(); // Прибираємо зайві пробіли та переноси в кінці
    
    // Додаємо ім'я користувача, на якого відповідаємо (якщо це відповідь)
    if (item.parentInfo && item.parentInfo.username) {
      const parentUsername = item.parentInfo.username;
      if (!fullText.startsWith(`@${parentUsername}`)) {
        displayText = `@${parentUsername}, ${displayText}`;
      }
    }
    
    return (
      <>
        <View style={{ 
          position: 'relative',
          zIndex: 1,
        }}>
          <View style={{
            maxHeight: isExpanded ? undefined : maxLines * 18, // maxLines * lineHeight
            overflow: isExpanded ? 'visible' : 'hidden',
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
              {displayText}
            </Markdown>
          </View>
          
          {/* Градієнт для плавного переходу при обрізанні */}
          {!isExpanded && shouldShowToggle && (
            <LinearGradient
              colors={[`${theme.colors.card}00`, theme.colors.card]} // Прозорий до непрозорого
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
  }, [fullText, item.parentInfo, isExpanded, maxLines, theme.colors.text, theme.colors.primary, shouldShowToggle, theme.colors.card]);

  const avatar = useMemo(() => item.author?.avatar || 'https://ui-avatars.com/api/?name=?', [item.author?.avatar]);
  const username = useMemo(() => item.author?.username || 'Користувач', [item.author?.username]);
  const time = useMemo(() => timeAgo(item.created), [item.created, timeAgo]);
  const preview = useMemo(() => item.preview || {}, [item.preview]);

  return (
    <CommentCardContainer>
      {showIndex && <CommentIndex>#{index + 1}</CommentIndex>}
      <CommentCard>
        <Row>
          <TouchableOpacity onPress={handleUserPress} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Avatar source={{ uri: avatar }} />
            <View>
              <Username>{username}</Username>
              <Timestamp>{time}</Timestamp>
            </View>
          </TouchableOpacity>
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
        {renderMarkdownWithSpoilers()}
        <TagsRow>
          <TypeTag>{commentType[item.content_type]}</TypeTag>
          {preview?.slug && (
            <LinkContainer onPress={() => handleNavigate(item)}>
              <LinkTag numberOfLines={1} ellipsizeMode="tail">{preview.title || 'Без назви'}</LinkTag>
            </LinkContainer>
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
const TagsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
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
const LinkContainer = styled.TouchableOpacity`
  flex: 1;
  min-width: 0;
`;
const LinkTag = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  padding: 5px 0px;
  font-weight: 500;
  text-decoration-line: underline;
  flex-shrink: 1;
`;
const TypeTag = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
  font-weight: 500;
  padding: 5px 16px;
  border-radius: 999px;
  flex-shrink: 0;
`;

const ShowText = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 12px;
  border-radius: 999px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray}; 
  font-weight: bold;
`;
