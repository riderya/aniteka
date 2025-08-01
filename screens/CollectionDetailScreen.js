import React, { useState, useCallback } from 'react';
import { ActivityIndicator, Dimensions, View, Text } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Markdown from 'react-native-markdown-display';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import styled from 'styled-components/native';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import AnimeColumnCard from '../components/Cards/AnimeColumnCard';
import CharacterColumnCard from '../components/Cards/CharacterColumnCard';
import StaffColumnCard from '../components/Cards/StaffColumnCard';
import SpoilerText from '../components/CommentForm/SpoilerText';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CollectionDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reference } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  // States
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdated, setShowUpdated] = useState(false);
  const [hasSeenUpdated, setHasSeenUpdated] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [voteScore, setVoteScore] = useState(0);
  const [voteLoading, setVoteLoading] = useState(false);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 300;

  // Function to process spoilers in text
  const processSpoilers = (text) => {
    if (!text) return [];
    
    const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = spoilerRegex.exec(text)) !== null) {
      // Add text before spoiler
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Add spoiler content
      parts.push({
        type: 'spoiler',
        content: match[1].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last spoiler
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  // Функція для обрізання тексту з урахуванням спойлерів
  const truncateTextWithSpoilers = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    
    const parts = processSpoilers(text);
    let currentLength = 0;
    const truncatedParts = [];
    
    for (const part of parts) {
      if (part.type === 'text') {
        const remainingLength = maxLength - currentLength;
        if (remainingLength <= 0) break;
        
        if (part.content.length <= remainingLength) {
          truncatedParts.push(part);
          currentLength += part.content.length;
        } else {
          // Обрізаємо текст до доступної довжини
          truncatedParts.push({
            type: 'text',
            content: part.content.slice(0, remainingLength) + '...'
          });
          break;
        }
      } else if (part.type === 'spoiler') {
        // Для спойлерів перевіряємо чи можемо додати весь спойлер
        const spoilerLength = part.content.length + 20; // Приблизна довжина для спойлера
        if (currentLength + spoilerLength <= maxLength) {
          truncatedParts.push(part);
          currentLength += spoilerLength;
        } else {
          // Якщо спойлер не вміщується, зупиняємося
          break;
        }
      }
    }
    
    // Відновлюємо оригінальний текст з обрізаними частинами
    let result = '';
    for (const part of truncatedParts) {
      if (part.type === 'text') {
        result += part.content;
      } else if (part.type === 'spoiler') {
        result += `:::spoiler\n${part.content}\n:::`;
      }
    }
    
    return result;
  };

  // Card layout calculations
  const screenWidth = Dimensions.get('window').width;
  const cardSpacing = 12;
  const numColumns = 3;
  const totalSpacing = cardSpacing * (numColumns - 1);
  const cardWidth = (screenWidth - totalSpacing - 24) / numColumns;

  const markdownStyles = {
  body: {
    color: theme.colors.gray,
    fontSize: 16,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.text,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.text,
  },
  text: {
    color: theme.colors.gray,
    fontSize: 16,
    lineHeight: 22,
  },
  paragraph: {
    marginVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
    paddingLeft: 16,
    marginLeft: 0,
    marginTop: 8,
    marginBottom: 8,
  },
  code_block: {
    backgroundColor: theme.colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  code_inline: {
    backgroundColor: theme.colors.inputBackground,
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  list_item: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet_list: {
    marginLeft: 16,
  },
  ordered_list: {
    marginLeft: 16,
  }
};

const fetchCollection = async () => {
  const token = await SecureStore.getItemAsync('hikka_token');
  try {
    const response = await axios.get(`https://api.hikka.io/collections/${reference}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `auth=${token}`,
      },
    });
    setCollection(response.data);
    setVoteScore(response.data.vote_score);
  } catch (error) {
    console.error('Помилка завантаження колекції:', error);
  } finally {
    setLoading(false);
  }
};

  const checkIsFavourite = async () => {
    const token = await SecureStore.getItemAsync('hikka_token');
    if (!token) return;

    try {
      await axios.get(
        `https://api.hikka.io/favourite/collection/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Cookie: `auth=${token}`,
          },
        }
      );
      setIsFavourite(true);
    } catch (error) {
      setIsFavourite(false);
    }
  };

  const toggleFavourite = async () => {
    if (favouriteLoading) return;
    setFavouriteLoading(true);

    const token = await SecureStore.getItemAsync('hikka_token');
    try {
      if (isFavourite) {
        await axios.delete(`https://api.hikka.io/favourite/collection/${reference}`, {
          headers: { Authorization: `Bearer ${token}`, Cookie: `auth=${token}` },
        });
        setIsFavourite(false);
        Toast.show({
          type: 'error',
          text1: 'Видалено з улюбленого',
        });
      } else {
        await axios.put(`https://api.hikka.io/favourite/collection/${reference}`, {}, {
          headers: { Authorization: `Bearer ${token}`, Cookie: `auth=${token}` },
        });
        setIsFavourite(true);
        Toast.show({
          type: 'success',
          text1: 'Додано в улюблене',
        });
      }
    } catch (error) {
      console.error('Помилка оновлення уподобаного:', error);
      Toast.show({
        type: 'info',
        text1: 'Помилка при оновленні улюбленого',
      });
    } finally {
      setFavouriteLoading(false);
    }
  };
  
  // Add after checkIsFavourite function
const checkVoteStatus = async () => {
  const token = await SecureStore.getItemAsync('hikka_token');
  if (!token) return;

  try {
    const response = await axios.get(
      `https://api.hikka.io/vote/collection/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `auth=${token}`,
        },
      }
    );
    if (response.data && typeof response.data.score === 'number') {
      setScore(response.data.score);
    } else {
      setScore(0);
    }
  } catch (error) {
    // If 404, it means no vote exists yet
    if (error.response?.status === 404) {
      setScore(0);
    } else {
      console.error('Помилка отримання статусу голосу:', error);
      setScore(0);
    }
  }
};

  const sendVote = async (newScore) => {
    if (voteLoading) return;
    setVoteLoading(true);

    const token = await SecureStore.getItemAsync('hikka_token');
    try {
      await axios.put(
        `https://api.hikka.io/vote/collection/${reference}`,
        { score: newScore },
        {
          headers: { Authorization: `Bearer ${token}`, Cookie: `auth=${token}` },
        }
      );
      setVoteScore(prev => prev - score + newScore);
      setScore(newScore);

      if (newScore === 1) {
        Toast.show({
          type: 'success',
          text1: 'Ви поставили лайк',
        });
      } else if (newScore === -1) {
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
    } catch (error) {
      console.error('Помилка надсилання голосу:', error);
      Toast.show({
        type: 'info',
        text1: 'Помилка при голосуванні',
      });
    } finally {
      setVoteLoading(false);
    }
  };

  const renderCard = useCallback((item, index) => {
    const { content_type, content } = item;
    const isLastInRow = (index + 1) % numColumns === 0;

    return (
      <CardWrapper key={index} style={{ width: cardWidth, marginRight: isLastInRow ? 0 : cardSpacing }}>
        {content_type === 'anime' && (
          <AnimeColumnCard
            anime={content}
            onPress={() => navigation.navigate('AnimeDetails', { slug: content.slug })}
            cardWidth={cardWidth}
            imageWidth={cardWidth}
            imageHeight={cardWidth * 1.4}
          />
        )}
        {content_type === 'character' && (
          <CharacterColumnCard
            character={content}
            width={`${cardWidth}px`}
            height={`${cardWidth * 1.3}px`}
            borderRadius="24px"
            fontSize="14px"
            cardWidth={`${cardWidth}px`}
          />
        )}
        {content_type === 'person' && (
          <StaffColumnCard
            person={content}
            roles={content.roles}
            cardWidth={`${cardWidth}px`}
            imageWidth={`${cardWidth}px`}
            imageHeight={`${cardWidth * 1.3}px`}
            borderRadius="24px"
          />
        )}
      </CardWrapper>
    );
  }, [cardWidth, cardSpacing, numColumns, navigation]);

useFocusEffect(
  useCallback(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCollection(), 
        checkIsFavourite(),
        checkVoteStatus()
      ]);
    };
    loadData();
  }, [reference])
);

  if (loading) {
    return (
      <Center>
        <ActivityIndicator size="large" />
      </Center>
    );
  }

  if (!collection) {
    return (
      <Center>
        <InfoText>Не вдалося завантажити колекцію.</InfoText>
      </Center>
    );
  }

  const { title, collection: items, labels_order, tags } = collection;

  return (
    <>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Колекція: ${title}`} />
      </BlurOverlay>

      <StyledScrollView
        contentContainerStyle={{
          paddingTop: 110,
          paddingBottom: 20 + insets.bottom,
          paddingHorizontal: 12,
          backgroundColor: theme.background,
        }}
      >

        {collection.author && (
  <AuthorContainer 
    onPress={() => navigation.navigate('UserProfile', { 
      reference: collection.author.reference 
    })}
    activeOpacity={0.7}
  >
    <AuthorAvatar 
      source={collection.author.avatar 
        ? { uri: collection.author.avatar }
        : require('../assets/image/image404.png')
      }
    />
    <AuthorInfo>
      <AuthorName>{collection.author.username}</AuthorName>
      <AuthorCollection>Автор колекції</AuthorCollection>
    </AuthorInfo>
  </AuthorContainer>
)}

        <Title>{title}</Title>

<CreatedAtButton 
  onPress={() => {
    if (!hasSeenUpdated) {
      setShowUpdated(true);
      setHasSeenUpdated(true);
    }
  }}
  activeOpacity={1}
>
  <CreatedAt>
    <CreatedAtText>{formatDate(collection.created)}</CreatedAtText>
    {!showUpdated && !hasSeenUpdated && (
      <AntDesign name="right" size={14} color="#888" />
    )}
  </CreatedAt>
  {(showUpdated || hasSeenUpdated) && collection.updated > 0 && collection.updated !== collection.created && (
    <CreatedAt style={{ marginTop: 2 }}>
      <CreatedAtText>Ред: {formatDate(collection.updated)}</CreatedAtText>
    </CreatedAt>
  )}
</CreatedAtButton>

        {tags?.length > 0 && (
          <TagsContainer>
            {tags.map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </TagsContainer>
        )}

<ButtonsScrollView>
  <ButtonsContainer>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>  
      <VoteButton
        active={score === 1}
        onPress={() => sendVote(score === 1 ? 0 : 1)}
        theme={theme}
        disabled={voteLoading}
      >
        <Ionicons 
          name="chevron-up" 
          size={24} 
          color={score === 1 
            ? theme.colors.success 
            : theme.colors.gray}
        />
      </VoteButton>

      <VoteScoreText>{voteScore}</VoteScoreText>

      <VoteButton
        active={score === -1}
        onPress={() => sendVote(score === -1 ? 0 : -1)}
        theme={theme}
        disabled={voteLoading}
      >
        <Ionicons 
          name="chevron-down"
          size={24} 
          color={score === -1
            ? theme.colors.error
            : theme.colors.gray}
        />
      </VoteButton>
    </View>

    <FavouriteButton
      onPress={toggleFavourite}
      disabled={favouriteLoading}
      isFavourite={isFavourite}
    >
      <AntDesign 
        name={isFavourite ? "heart" : "hearto"} 
        size={16} 
        color={theme.colors.error}
        style={{
          marginRight: 8,
          borderRightWidth: 1,
          borderColor: '#ccc',
          paddingRight: 8
        }}
      />
      <FavouriteText isFavourite={isFavourite}>
        {isFavourite ? 'Видалити з улюблених' : 'Додати в улюблене'}
      </FavouriteText>
    </FavouriteButton>

    <CommentsCountButton>
      <Ionicons name="chatbox-outline" size={16} color={theme.colors.gray}/>
      <CommentsCountText 
        style={{ marginLeft: 8 }}>
        {collection.comments_count}
      </CommentsCountText>
    </CommentsCountButton>
  </ButtonsContainer>
</ButtonsScrollView>

{collection.description && (
  <DescriptionContainer>
    {(() => {
      const descriptionText = isDescriptionExpanded 
        ? collection.description 
        : truncateTextWithSpoilers(collection.description, MAX_DESCRIPTION_LENGTH);
      
      const processedParts = processSpoilers(descriptionText);
      
      return (
        <>
          {processedParts.map((part, index) => (
            <View key={index}>
              {part.type === 'text' ? (
                <Markdown style={markdownStyles}>
                  {part.content}
                </Markdown>
              ) : (
                <SpoilerText text={part.content} />
              )}
            </View>
          ))}
        </>
      );
    })()}
    {collection.description.length > MAX_DESCRIPTION_LENGTH && (
      <ShowMoreButton onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
        <ShowMoreText>
          {isDescriptionExpanded ? 'Показати менше' : 'Показати більше'}
        </ShowMoreText>
      </ShowMoreButton>
    )}
  </DescriptionContainer>
)}

        {items?.length > 0 ? (
          labels_order?.length > 0 ? (
            labels_order.map(label => {
              const itemsByLabel = items.filter(item => item.label === label);
              if (itemsByLabel.length === 0) return null;

              return (
                <LabelBlock key={label}>
                  <LabelTitle>{label}</LabelTitle>
                  <CardRow>
                    {itemsByLabel.map((item, index) => renderCard(item, index))}
                  </CardRow>
                </LabelBlock>
              );
            })
          ) : (
            <CardRow>
              {items.map((item, index) => renderCard(item, index))}
            </CardRow>
          )
        ) : (
          <InfoText>Немає елементів у колекції.</InfoText>
        )}
      </StyledScrollView>
    </>
  );
};

export default CollectionDetailScreen;

// Styled components
const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
`;

const StyledScrollView = styled.ScrollView`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
`;

const LabelBlock = styled.View`
  margin-bottom: 16px;
`;

const LabelTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const CardRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const CardWrapper = styled.View`
  margin-right: 8px;
  margin-bottom: 20px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const Tag = styled.Text`
  background-color:${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 12px;
  border-radius: 16px;
  margin-right: 8px;
  font-size: 14px;
`;

const CreatedAtButton = styled.TouchableOpacity`
  margin-top: 12px;
`;

const CreatedAt = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const VoteScoreText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const CommentsCountButton = styled.View`
  flex-direction: row;
  align-items: center;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
  height: 45px;
  padding: 0px 16px;
`;

const CommentsCountText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const FavouriteButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  height: 45px;
  padding: 0px 16px;
  align-self: flex-start;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${({ theme, isFavourite }) => 
    isFavourite ? theme.colors.error : theme.colors.borderInput};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

const FavouriteText = styled.Text`
  color: ${({ theme, isFavourite }) => 
    isFavourite ? theme.colors.error : theme.colors.gray};
  font-weight: 600;
  font-size: 14px;
`;

const VoteButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  height: 45px;
  padding: 0px;
`;

const CreatedAtText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const DescriptionContainer = styled.View`
  margin-top: 12px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
`;

const ShowMoreButton = styled.TouchableOpacity`
  margin-top: 8px;
  align-self: center;
`;

const ShowMoreText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: bold;
`;

// Add these styled components at the bottom of the file
const AuthorContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.card};
`;

const AuthorAvatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  margin-right: 10px;
`;

const AuthorInfo = styled.View`
  flex: 1;
`;

const AuthorName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const AuthorCollection = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
`;

const ButtonsScrollView = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
`;