import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Dimensions, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import Toast from 'react-native-toast-message';
import styled from 'styled-components/native';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import AnimeColumnCard from '../components/Cards/AnimeColumnCard';
import CharacterColumnCard from '../components/Cards/CharacterColumnCard';
import StaffColumnCard from '../components/Cards/StaffColumnCard';

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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showUpdated, setShowUpdated] = useState(false);
  const [hasSeenUpdated, setHasSeenUpdated] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [voteScore, setVoteScore] = useState(0);
  const [voteLoading, setVoteLoading] = useState(false);

  // Card layout calculations
  const screenWidth = Dimensions.get('window').width;
  const cardSpacing = 12;
  const numColumns = 3;
  const totalSpacing = cardSpacing * (numColumns - 1);
  const cardWidth = (screenWidth - totalSpacing - 24) / numColumns;

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
      setScore(response.data.my_vote || 0);
    } catch (error) {
      console.error('Помилка завантаження колекції:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIsFavourite = async () => {
    const token = await SecureStore.getItemAsync('hikka_token');
    if (!collection?.slug || !token) return;

    try {
      const response = await axios.get(
        `https://api.hikka.io/favourite/collection/${collection.slug}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Cookie: `auth=${token}`,
          },
        }
      );
      setIsFavourite(response.status === 200);
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
        type: 'info',
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
      type: 'error',
      text1: 'Помилка при оновленні улюбленого',
    });
  } finally {
    setFavouriteLoading(false);
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
        type: 'info',
        text1: 'Ви поставили дизлайк',
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Ваш голос скасовано',
      });
    }
  } catch (error) {
    console.error('Помилка надсилання голосу:', error);
    Toast.show({
      type: 'error',
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
            height={`${cardWidth * 1.4}px`}
            borderRadius="16px"
            fontSize="16px"
            cardWidth={`${cardWidth}px`}
          />
        )}
        {content_type === 'person' && (
          <StaffColumnCard
            person={content}
            roles={content.roles}
            cardWidth={`${cardWidth}px`}
            imageWidth={`${cardWidth}px`}
            imageHeight={`${cardWidth * 1.4}px`}
            borderRadius="16px"
          />
        )}
      </CardWrapper>
    );
  }, [cardWidth, cardSpacing, numColumns, navigation]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCollection(), checkIsFavourite()]);
    };
    loadData();
  }, []);

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

  const { title, description, nsfw, author, collection: items, labels_order, tags } = collection;

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
        <Title>{title}</Title>

        {collection.created > 0 && (
  <CreatedAtButton 
    onPress={() => {
      if (!hasSeenUpdated) {
        setShowUpdated(true);
        setHasSeenUpdated(true);
      }
    }}
    activeOpacity={1}
  >
    <CreatedAt>Створено: {formatDate(collection.created)}</CreatedAt>
    {(showUpdated || hasSeenUpdated) && collection.updated > 0 && collection.updated !== collection.created && (
      <CreatedAt style={{ marginTop: 2 }}>
        Оновлено: {formatDate(collection.updated)}
      </CreatedAt>
    )}
  </CreatedAtButton>
)}

        {tags?.length > 0 && (
          <TagsContainer>
            {tags.map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </TagsContainer>
        )}

<View style={{ 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'flex-start',
  marginTop: 12,
  marginBottom: 12,
}}>
  
<FavouriteButton
  onPress={toggleFavourite}
  disabled={favouriteLoading}
  isFavourite={isFavourite}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <AntDesign 
      name={isFavourite ? "heart" : "hearto"} 
      size={16} 
      color="#e53935"
      style={{
        marginRight: 8,
        borderRightWidth: 1,
        borderColor: '#ccc',
        paddingRight: 8
      }}
    />
    <FavouriteText>
      {isFavourite ? 'Видалити з улюблених' : 'Додати в улюблене'}
    </FavouriteText>
  </View>
</FavouriteButton>

<View style={{ flexDirection: 'row', alignItems: 'center' }}>  
<VoteButton
  active={score === 1}
  onPress={() => sendVote(score === 1 ? 0 : 1)}
  theme={theme}
  disabled={voteLoading}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <AntDesign 
      name="like1" 
      size={16} 
      color={score === 1 ? '#43a047' : theme.isDark ? 'white' : 'black'} // Зелений коли активний
    />
  </View>
</VoteButton>

  <VoteScoreText>{voteScore}</VoteScoreText>

<VoteButton
  active={score === -1}
  onPress={() => sendVote(score === -1 ? 0 : -1)}
  theme={theme}
  disabled={voteLoading}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <AntDesign 
      name="dislike1" 
      size={16} 
      color={score === -1 ? '#e53935' : theme.isDark ? 'white' : 'black'} // Червоний коли активний
    />
  </View>
</VoteButton>
</View>

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Ionicons name="chatbubble-outline" size={16} color="#888" />
    <CommentsCountText style={{ marginLeft: 4 }}>{collection.comments_count}</CommentsCountText>
  </View>
</View>

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
`;

const InfoText = styled.Text`
  color: #444;
  font-size: 16px;
`;

const StyledScrollView = styled.ScrollView`
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const LabelBlock = styled.View`
  margin-bottom: 16px;
`;

const LabelTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #222;
`;

const CardRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const CardWrapper = styled.View`
  margin-right: 8px;
  margin-bottom: 12px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const Tag = styled.Text`
  background-color: #e0e0e0;
  color: #333;
  padding: 6px 12px;
  border-radius: 16px;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 14px;
`;

const CreatedAtButton = styled.TouchableOpacity`
  margin-top: 4px;
`;

const CreatedAt = styled.Text`
  color: #888;
  font-size: 14px;
  margin-top: 4px;
`;

const VoteScoreText = styled.Text`
  color: #888;
  font-size: 14px;
  margin-top: 4px;
`;

const CommentsCountText = styled.Text`
  color: #888;
  font-size: 14px;
  margin-top: 4px;
`;


const FavouriteButton = styled.TouchableOpacity`
  margin-top: 8px;
  padding: 10px 12px;
  align-self: flex-start;
  background-color: #f8f8f8;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ isFavourite }) => (isFavourite ? '#e53935' : '#ссс')};
`;

const FavouriteText = styled.Text`
  color: #666;
  font-weight: 600;
  font-size: 14px;
`;

const VoteButton = styled.TouchableOpacity`
  padding: 8px 16px;
  margin-right: 12px;
  border-radius: 8px;
`;

const VoteButtonText = styled.Text`
  font-weight: bold;
  font-size: 16px;
`;