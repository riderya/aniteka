import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// ==== Styled Components ====

const ArticleCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  margin: 10px 12px;
  padding: 16px;
  border-radius: 24px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 8px;
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;

const FollowButton = styled.TouchableOpacity`
  padding: 6px 12px;
  background-color: #2e2d36;
  border-radius: 8px;
`;

const FollowText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
`;

const Description = styled.Text`
  color: #ccc;
  margin-top: 8px;
`;

const StyledImage = styled.Image`
  width: 100%;
  height: 180px;
  border-radius: 10px;
  margin-top: 12px;
`;

const RowSpaceBeetween = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TagsRow = styled.View`
  flex-direction: row;
  margin-top: 12px;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 12px;
`;

const Stat = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  margin-left: 4px;
  font-size: 13px;
`;

const FilterButton = styled.TouchableOpacity`
  margin-top: 50px;
  padding: 8px 16px;
  height: 50px;
  background-color: #444;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
`;

const FilterButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const CATEGORY_TRANSLATIONS = {
  news: 'Новини',
  reviews: 'Огляди',
  original: 'Оригінали',
};

const TYPE_TRANSLATIONS = {
  anime: 'Аніме',
  manga: 'Манґа',
  novel: 'Ранобе',
};

const AnimeAllArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const { theme } = useTheme();

  const [filters, setFilters] = useState({
    categories: [],
    sort: ['created:desc'],
    tags: [],
    author: null,
    draft: false,
    content_type: null,
  });

  const [tagInput, setTagInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');

  const fetchArticles = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await axios.post(
          `https://api.hikka.io/articles?page=${pageNumber}&size=15`,
          {
            show_trusted: true,
            ...filters,
          }
        );
        const newArticles = res.data.list || [];
        if (isRefresh) {
          setArticles(newArticles);
        } else {
          setArticles((prev) => [...prev, ...newArticles]);
        }
        setHasMore(newArticles.length > 0);
        setPage(pageNumber);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [loading, filters]
  );

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) fetchArticles(page + 1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles(1, true);
  };

  const renderItem = ({ item }) => (
  <ArticleCard>
      <TopRow>
        <AuthorRow>
          <Avatar
            source={{
              uri: item.author?.avatar || 'https://via.placeholder.com/36',
            }}
          />
          <View>
            <Username>{item.author?.username || 'Невідомо'}</Username>
            <Text style={{ color: '#888', fontSize: 12 }}>
              {item.category || 'Категорія'} ·{' '}
              {new Date(item.created * 1000).toLocaleDateString('uk-UA')}
            </Text>
          </View>
        </AuthorRow>
        <FollowButton>
          <FollowText>Відстежувати</FollowText>
        </FollowButton>
      </TopRow>

      <Title>{item.title}</Title>

      {item.content?.image && (
        <StyledImage source={{ uri: item.content.image }} resizeMode="cover" />
      )}

      <RowSpaceBeetween>
        <TagsRow>
          {item.tags?.length > 0 && (
            <>
              <Tag>{item.tags[0].name}</Tag>
              {item.tags.length > 1 && <Tag>+{item.tags.length - 1}</Tag>}
            </>
          )}
        </TagsRow>

        <StatsRow>
          <Stat>
            <Ionicons name="eye-outline" size={16} color="#aaa" />
            <StatText>{item.views || 0}</StatText>
          </Stat>
          <Stat>
            <Ionicons name="chatbubble-outline" size={16} color="#aaa" />
            <StatText>{item.comments_count || 0}</StatText>
          </Stat>
          <Stat>
            <Ionicons name="heart-outline" size={16} color="#aaa" />
            <StatText>{item.vote_score || 0}</StatText>
          </Stat>
        </StatsRow>
      </RowSpaceBeetween>
    </ArticleCard>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
<FlatList
  data={articles}
  keyExtractor={(item, index) => item.slug + index}
  renderItem={renderItem}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
  ListHeaderComponent={() => (
    <FilterButton onPress={() => setShowFilter(true)}>
      <FilterButtonText>Фільтр</FilterButtonText>
    </FilterButton>
  )}
  ListFooterComponent={
    loading && <ActivityIndicator />
  }
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>


      {/* Модалка ФІЛЬТРІВ */}
      <Modal visible={showFilter} animationType="slide">
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: theme.colors.background }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, marginBottom: 10 }}>Фільтри</Text>

          {/* Категорії */}
          <Text style={{ color: theme.colors.text, marginBottom: 6 }}>Категорії</Text>
{Object.keys(CATEGORY_TRANSLATIONS).map((cat) => (
  <Pressable
    key={cat}
    style={{
      backgroundColor: filters.categories.includes(cat) ? '#666' : '#333',
      padding: 8,
      borderRadius: 8,
      marginVertical: 4,
    }}
    onPress={() =>
      setFilters((prev) => {
        const exists = prev.categories.includes(cat);
        return {
          ...prev,
          categories: exists
            ? prev.categories.filter((c) => c !== cat)
            : [...prev.categories, cat],
        };
      })
    }
  >
    <Text style={{ color: '#fff' }}>{CATEGORY_TRANSLATIONS[cat]}</Text>
  </Pressable>
))}


          {/* Сортування */}
          <Text style={{ color: theme.colors.text, marginTop: 16, marginBottom: 8 }}>
            Сортування:
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: filters.sort[0].includes('created') ? '#666' : '#333',
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                const dir = filters.sort[0].split(':')[1];
                setFilters((prev) => ({ ...prev, sort: [`created:${dir}`] }));
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>За датою</Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: filters.sort[0].includes('vote_score') ? '#666' : '#333',
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                const dir = filters.sort[0].split(':')[1];
                setFilters((prev) => ({ ...prev, sort: [`vote_score:${dir}`] }));
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>За рейтингом</Text>
            </Pressable>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: '#444',
                borderRadius: 8,
              }}
              onPress={() => {
                const [type, dir] = filters.sort[0].split(':');
                setFilters((prev) => ({
                  ...prev,
                  sort: [`${type}:${dir === 'asc' ? 'desc' : 'asc'}`],
                }));
              }}
            >
              <Ionicons
                name={filters.sort[0].includes('asc') ? 'arrow-up' : 'arrow-down'}
                size={20}
                color="#fff"
              />
            </Pressable>
          </View>

          {/* Автор */}
          <Text style={{ color: theme.colors.text, marginTop: 16 }}>Автор</Text>
          <TextInput
            placeholder="Введіть ім’я автора"
            value={authorInput}
            onChangeText={(text) => {
              setAuthorInput(text);
              setFilters((prev) => ({ ...prev, author: text || null }));
            }}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              padding: 10,
              borderRadius: 8,
              marginTop: 6,
            }}
            placeholderTextColor="#aaa"
          />

          {/* Теги */}
          <Text style={{ color: theme.colors.text, marginTop: 16 }}>Теги</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              placeholder="Додати тег"
              value={tagInput}
              onChangeText={setTagInput}
              style={{
                backgroundColor: '#333',
                color: '#fff',
                flex: 1,
                padding: 10,
                borderRadius: 8,
              }}
              placeholderTextColor="#aaa"
            />
            <Pressable
              style={{ backgroundColor: '#444', padding: 10, borderRadius: 8 }}
              onPress={() => {
                if (tagInput && filters.tags.length < 3) {
                  setFilters((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tagInput],
                  }));
                  setTagInput('');
                }
              }}
            >
              <Text style={{ color: '#fff' }}>+</Text>
            </Pressable>
          </View>
          {/* Показані теги */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 }}>
            {filters.tags.map((tag, index) => (
              <Pressable
                key={index}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    tags: prev.tags.filter((t) => t !== tag),
                  }))
                }
                style={{
                  backgroundColor: '#555',
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: '#fff' }}>{tag} ✕</Text>
              </Pressable>
            ))}
          </View>

          {/* Відображення чернеток */}
          <Text style={{ color: theme.colors.text, marginTop: 16 }}>Відображення</Text>
          <Pressable
            onPress={() =>
              setFilters((prev) => ({ ...prev, draft: !prev.draft }))
            }
            style={{
              marginTop: 8,
              padding: 10,
              backgroundColor: filters.draft ? '#666' : '#333',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff' }}>
              Чернетки: {filters.draft ? 'Увімкнено' : 'Вимкнено'}
            </Text>
          </Pressable>

          {/* Тип контенту */}
          <Text style={{ color: theme.colors.text, marginTop: 16 }}>Тип контенту</Text>
{Object.keys(TYPE_TRANSLATIONS).map((type) => (
  <Pressable
    key={type}
    style={{
      backgroundColor: filters.content_type === type ? '#666' : '#333',
      padding: 8,
      borderRadius: 8,
      marginTop: 6,
    }}
    onPress={() =>
      setFilters((prev) => ({
        ...prev,
        content_type: prev.content_type === type ? null : type,
      }))
    }
  >
    <Text style={{ color: '#fff' }}>{TYPE_TRANSLATIONS[type]}</Text>
  </Pressable>
))}


          {/* Кнопки */}
          <View style={{ marginTop: 24, gap: 12 }}>
            <FilterButton
              onPress={() => {
                setShowFilter(false);
                fetchArticles(1, true);
              }}
            >
              <FilterButtonText>Застосувати</FilterButtonText>
            </FilterButton>

            <FilterButton
              onPress={() => {
                setFilters({
                  categories: [],
                  sort: ['created:desc'],
                  tags: [],
                  author: null,
                  draft: false,
                  content_type: null,
                });
                setTagInput('');
                setAuthorInput('');
              }}
            >
              <FilterButtonText>Очистити</FilterButtonText>
            </FilterButton>

            <FilterButton onPress={() => setShowFilter(false)}>
              <FilterButtonText>Скасувати</FilterButtonText>
            </FilterButton>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default AnimeAllArticlesScreen;
