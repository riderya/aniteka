import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import styled from 'styled-components/native';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import AnimeColumnCard from '../components/Cards/AnimeColumnCard';
import CharacterColumnCard from '../components/Cards/CharacterColumnCard';
import StaffColumnCard from '../components/Cards/StaffColumnCard';

const markdownStyles = {
  body: {
    color: '#444',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
  },
  link: {
    color: '#007AFF',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
};

// --- Компонент Spoiler ---
const SpoilerContainer = styled.TouchableOpacity`
  background-color: ${({ theme }) => (theme.isDark ? '#333' : '#eee')};
  border-radius: 8px;
  padding: 8px 12px;
  margin-vertical: 8px;
`;

const SpoilerLabel = styled.Text`
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 6px;
`;

const SpoilerText = styled.Text`
  color: ${({ theme }) => (theme.isDark ? '#ddd' : '#444')};
  font-size: 16px;
  line-height: 22px;
`;

const Spoiler = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();

  return (
    <SpoilerContainer
      onPress={() => setVisible(!visible)}
      activeOpacity={0.8}
      theme={theme}
    >
      <SpoilerLabel>{visible ? 'Сховати спойлер' : 'Показати спойлер'}</SpoilerLabel>
      {visible && <SpoilerText theme={theme}>{children}</SpoilerText>}
    </SpoilerContainer>
  );
};

// --- Функція для рендеру Markdown з підтримкою спойлерів ---
const renderMarkdownWithSpoilers = (text) => {
  if (!text) return null;

  try {
    // Розділяємо по :::spoiler та :::
    const parts = text.split(/:::spoiler|:::/g);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Це спойлер
        return (
          <Spoiler key={index}>
            <Markdown style={markdownStyles}>{part.trim()}</Markdown>
          </Spoiler>
        );
      } else {
        // Звичайний текст
        return <Markdown key={index} style={markdownStyles}>{part.trim()}</Markdown>;
      }
    });
  } catch (e) {
    console.warn('Помилка рендеру Markdown з спойлерами:', e);
    return <Markdown style={markdownStyles}>{text}</Markdown>;
  }
};

const CollectionDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reference } = route.params;
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [showFullDescription, setShowFullDescription] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const cardSpacing = 12; // простір між картками
  const numColumns = 3;
  const totalSpacing = cardSpacing * (numColumns - 1);
  const cardWidth = (screenWidth - totalSpacing - 24) / numColumns; // 24 — paddingHorizontal (12 + 12)

  const getShortDescription = (text) => {
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
    if (sentences.length <= 12) return text;
    return sentences.slice(0, 12).join(' ');
  };

  const fetchCollection = async () => {
    const token = await SecureStore.getItemAsync('hikka_token');
    try {
      const response = await axios.get(`https://api.hikka.io/collections/${reference}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Cookie: `auth=${token}`,
        },
      });
      setCollection(response.data);
    } catch (error) {
      console.error('Помилка завантаження колекції:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
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

  const {
    title,
    description,
    nsfw,
    author,
    collection: items,
    labels_order,
    tags,
  } = collection;

  const renderCard = (item, index) => {
  const { content_type, content } = item;

  const isLastInRow = (index + 1) % numColumns === 0;

  return (
    <CardWrapper
      key={index.toString()}
      style={{
        width: cardWidth,
        marginRight: isLastInRow ? 0 : cardSpacing,
      }}
    >
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
          cardMarginRight="0px"
          marginTop="6px"
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
          marginRight="0px"
        />
      )}
    </CardWrapper>
  );
};


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

        {tags && tags.length > 0 && (
          <TagsContainer>
            {tags.map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </TagsContainer>
        )}

        {description ? (
          <>
            {showFullDescription ? (
              <React.Fragment key="full">
                {renderMarkdownWithSpoilers(description)}
              </React.Fragment>
            ) : (
              <React.Fragment key="short">
                {renderMarkdownWithSpoilers(getShortDescription(description))}
              </React.Fragment>
            )}
            {description.match(/[^.!?]+[.!?]*/g)?.length > 12 && (
              <ToggleButton onPress={() => setShowFullDescription(!showFullDescription)}>
                <ToggleButtonText>
                  {showFullDescription ? 'Показати менше' : 'Показати більше'}
                </ToggleButtonText>
              </ToggleButton>
            )}
          </>
        ) : null}

        {nsfw && <NSFW>🔞 NSFW</NSFW>}

        <AuthorBlock>
          <AuthorLabel>Автор:</AuthorLabel>
          <AuthorName>{author?.username || 'Невідомий'}</AuthorName>
        </AuthorBlock>

{items && items.length > 0 ? (
  labels_order && labels_order.length > 0 ? (
    labels_order.map((label) => {
      const itemsByLabel = items.filter((item) => item.label === label);
      if (itemsByLabel.length === 0) return null;

      return (
        <LabelBlock key={label}>
          <LabelTitle>{label}</LabelTitle>

          <CardRow>
            {itemsByLabel.map((item, index) => {
              return renderCard(item, index);
            })}
          </CardRow>
        </LabelBlock>
      );
    })
  ) : (
    // Якщо немає labels_order, показуємо просто всі елементи
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

const NSFW = styled.Text`
  color: red;
  font-weight: bold;
  margin-bottom: 12px;
`;

const AuthorBlock = styled.View`
  margin-bottom: 16px;
`;

const AuthorLabel = styled.Text`
  font-weight: bold;
`;

const AuthorName = styled.Text`
  color: #555;
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

const ToggleButton = styled.TouchableOpacity`
  margin-top: 4px;
  padding: 4px 8px;
`;

const ToggleButtonText = styled.Text`
  color: #007AFF;
  font-weight: 600;
  font-size: 14px;
`;
