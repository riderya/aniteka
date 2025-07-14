import React, { useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import Entypo from '@expo/vector-icons/Entypo';

dayjs.extend(relativeTime);
dayjs.locale('uk');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const AVATAR_SIZE = 40;

const CATEGORY_TRANSLATIONS = {
  original: 'Оригінали',
  reviews: 'Огляди',
  system: 'Системні',
  news: 'Новини',
};

const extractFirstParagraph = (document) => {
  if (!Array.isArray(document)) return '';
  const para = document.find((b) => b?.type === 'paragraph');
  return para?.children?.[0]?.text ?? '';
};

const Container = styled.View`
  margin-top: 25px;
`;

const Card = styled.View`
  width: ${CARD_WIDTH}px;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  padding: 15px;
  margin-right: 20px;
  overflow: hidden;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  border-radius: ${AVATAR_SIZE / 2}px;
  margin-right: 10px;
  background: ${({ theme }) => theme.colors.inputBackground};
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 700;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  margin-top: 2px;
`;

const FollowBtn = styled(TouchableOpacity)`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.08);
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 700;
  margin: 12px 0px;
`;

const ImageStyled = styled.Image`
  height: 120px;
  border-radius: 24px;
  background:  ${({ theme }) => theme.colors.inputBackground};
`;

const BottomRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const TagsWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Tag = styled.Text`
  background-color:  ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  padding: 6px 16px;
  border-radius: 999px;
  font-weight: 600;
`;

const ExtraTag = styled(Tag)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ReactionRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const Reaction = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const ReactionText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
`;

const ArticlesSlider = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios
      .post('https://api.hikka.io/articles?page=1&size=5', {
        sort: ['created:desc'],
        show_trusted: true,
        draft: false,
      })
      .then((res) => setArticles(res.data.list))
      .catch((err) => console.error('Failed to fetch articles:', err));
  }, []);

  const renderItem = ({ item }) => {
    const createdAgo = item.created
      ? dayjs.unix(item.created).fromNow()
      : 'щойно';

    const translatedCategory =
      CATEGORY_TRANSLATIONS[item.category] ?? item.category ?? 'Категорія';

    const primaryTag = item.tags?.[0]?.name ?? 'тег';
    const extraCount =
      item.tags?.length > 1 ? `+${item.tags.length - 1}` : null;

    const articleTitle =
      item.content?.title_ua ||
      item.content?.title_en ||
      item.title ||
      'Без заголовку';

    const previewText = extractFirstParagraph(item.document) || item.content?.title_en;

    const avatarUrl =
      item.author?.avatar && item.author?.avatar !== 'string'
        ? item.author.avatar
        : 'https://cdn.hikka.io/default-avatar.jpg';

    const contentImage =
      item.content?.image && item.content?.image !== 'string'
        ? { uri: item.content.image }
        : null;

    return (
      <Card>
        <HeaderRow>
          <AuthorRow>
            <Avatar source={{ uri: avatarUrl }} />
            <View>
              <Username>{item.author?.username || 'Анонім'}</Username>
              <Meta>
                {translatedCategory} • {createdAgo}
              </Meta>
            </View>
          </AuthorRow>

          <FollowBtn activeOpacity={0.7}>
            <Feather name="user-plus" size={18} color="#fff" />
          </FollowBtn>
        </HeaderRow>

        <Title numberOfLines={1}>{articleTitle}</Title>
        {/* {previewText ? (
          <Preview numberOfLines={1}>{previewText || '?'}</Preview>
        ) : null} */}
        <ImageStyled source={contentImage} resizeMode="cover" />

        {/* Tags and Reactions */}
        <BottomRow>
          <TagsWrapper>
            <Tag>{primaryTag}</Tag>
            {extraCount && <ExtraTag>{extraCount}</ExtraTag>}
          </TagsWrapper>

          <ReactionRow>
            <Reaction>
              <Feather name="eye" size={16} color="#b3b3b3" />
              <ReactionText>{item.views}</ReactionText>
            </Reaction>
            <Reaction>
              <Feather name="message-circle" size={16} color="#b3b3b3" />
              <ReactionText>{item.comments_count}</ReactionText>
            </Reaction>
            <Reaction>
              <Entypo style={{ marginRight: -2 }} name="arrow-bold-up" size={16} color="#b3b3b3" />
              <ReactionText>{item.vote_score}</ReactionText>
            </Reaction>
          </ReactionRow>
        </BottomRow>
      </Card>
    );
  };

  return (
    <Container>
      <RowLineHeader
        title="Статті"
        onPress={() => navigation.navigate('AnimeCharactersScreen', { slug, title })}
      />
      <FlatList
        data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.slug || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      />
    </Container>
  );
};

export default ArticlesSlider;
