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
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ArticleCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.border};
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
  padding: 8px 16px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;
`;

const FilterButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
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
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

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
      </TopRow>

      <Title numberOfLines={2}>{item.title}</Title>

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
            <Ionicons name="eye-outline" size={16} color={theme.colors.placeholder} />
            <StatText>{item.views || 0}</StatText>
          </Stat>
          <Stat>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.placeholder} />
            <StatText>{item.comments_count || 0}</StatText>
          </Stat>
          <Stat>
            <Ionicons name="heart-outline" size={16} color={theme.colors.placeholder} />
            <StatText>{item.vote_score || 0}</StatText>
          </Stat>
        </StatsRow>
      </RowSpaceBeetween>
    </ArticleCard>
  );

  return (
    <>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title="Статті" />
      </BlurOverlay>

    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
<FlatList
  data={articles}
  keyExtractor={(item, index) => item.slug + index}
  renderItem={renderItem}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
  contentContainerStyle={{
    paddingTop: 110,
    paddingBottom: 20 + insets.bottom,
  }}
  ListHeaderComponent={() => (
    <FilterButton style={{ marginHorizontal: 12 }} onPress={() => setShowFilter(true)}>
      <FontAwesome6 name="filter" size={18} color={theme.colors.gray} />
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
        <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 12 }}
        contentContainerStyle={{
          paddingTop: 12 + insets.top,
          paddingBottom: 20 + insets.bottom,
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 24, marginBottom: 10, fontWeight: 'bold' }}>Фільтри</Text>

{/* Категорії */}
<Text style={{ color: theme.colors.text, marginBottom: 8, fontSize: 16, fontWeight: '600' }}>Категорії</Text>
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
  {Object.keys(CATEGORY_TRANSLATIONS).map((cat) => (
    <Pressable
      key={cat}
      style={{
        backgroundColor: filters.categories.includes(cat) ? theme.colors.primary : theme.colors.inputBackground,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 999,
        marginRight: 4,
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
      <Text style={{ color: theme.colors.text }}>{CATEGORY_TRANSLATIONS[cat]}</Text>
    </Pressable>
  ))}
</View>



          {/* Сортування */}
          <Text style={{ color: theme.colors.text, marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: 600}}>
            Сортування:
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: filters.sort[0].includes('created') ? theme.colors.primary : theme.colors.inputBackground,
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                const dir = filters.sort[0].split(':')[1];
                setFilters((prev) => ({ ...prev, sort: [`created:${dir}`] }));
              }}
            >
              <Text style={{ color: theme.colors.text, textAlign: 'center' }}>За датою</Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: filters.sort[0].includes('vote_score') ? theme.colors.primary : theme.colors.inputBackground,
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                const dir = filters.sort[0].split(':')[1];
                setFilters((prev) => ({ ...prev, sort: [`vote_score:${dir}`] }));
              }}
            >
              <Text style={{ color: theme.colors.text, textAlign: 'center' }}>За рейтингом</Text>
            </Pressable>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: theme.colors.inputBackground,
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
              <FontAwesome5
                name={filters.sort[0].includes('asc') ? 'sort-amount-up' : 'sort-amount-down'}
                size={20}
                color="#fff"
              />
            </Pressable>
          </View>

          {/* Автор */}
          <Text style={{ color: theme.colors.text, marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Автор</Text>
          <TextInput
            placeholder="Введіть ім’я автора"
            value={authorInput}
            onChangeText={(text) => {
              setAuthorInput(text);
              setFilters((prev) => ({ ...prev, author: text || null }));
            }}
            style={{
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              padding: 10,
              borderRadius: 8,
            }}
            placeholderTextColor={theme.colors.placeholder}
          />

          {/* Теги */}
          <Text style={{ color: theme.colors.text, marginTop: 16, fontSize: 16, marginBottom: 8, fontWeight: 600 }}>Теги</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              placeholder="Додати тег"
              value={tagInput}
              onChangeText={setTagInput}
              style={{
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                flex: 1,
                padding: 10,
                borderRadius: 8,
              }}
              placeholderTextColor={theme.colors.placeholder}
            />
            <Pressable
              style={{ backgroundColor: theme.colors.inputBackground, padding: 10, borderRadius: 8 }}
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
              <FontAwesome6 name="plus" size={18} color={theme.colors.text} />
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
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: theme.colors.text }}>{tag} ✕</Text>
              </Pressable>
            ))}
          </View>

          {/* Відображення чернеток */}
          <Text style={{ color: theme.colors.text, marginTop: 16, fontSize: 16, fontWeight: 600 }}>Відображення</Text>
          <Pressable
            onPress={() =>
              setFilters((prev) => ({ ...prev, draft: !prev.draft }))
            }
            style={{
              marginTop: 8,
              padding: 10,
              backgroundColor: filters.draft ? theme.colors.primary : theme.colors.inputBackground,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: theme.colors.text }}>
              Чернетки: {filters.draft ? 'Увімкнено' : 'Вимкнено'}
            </Text>
          </Pressable>

{/* Тип контенту */}
<Text style={{ color: theme.colors.text, marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: '600' }}>Тип контенту</Text>
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
  {Object.keys(TYPE_TRANSLATIONS).map((type) => (
    <Pressable
      key={type}
      style={{
        backgroundColor:
          filters.content_type === type
            ? theme.colors.primary
            : theme.colors.inputBackground,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 999,
        marginRight: 4,
      }}
      onPress={() =>
        setFilters((prev) => ({
          ...prev,
          content_type: prev.content_type === type ? null : type,
        }))
      }
    >
      <Text style={{ color: theme.colors.text }}>{TYPE_TRANSLATIONS[type]}</Text>
    </Pressable>
  ))}
</View>


        {/* Кнопки */}
<View style={{ marginTop: 32, gap: 12 }}>
  {/* Ряд з кнопками Очистити та Застосувати */}
  <View style={{ flexDirection: 'row', gap: 12 }}>
    <FilterButton
      style={{ flex: 1 }}
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

    <FilterButton
      style={{ flex: 1 }}
      onPress={() => {
        setShowFilter(false);
        fetchArticles(1, true);
      }}
    >
      <FilterButtonText>Застосувати</FilterButtonText>
    </FilterButton>
  </View>

  {/* Кнопка Скасувати окремо знизу */}
  <FilterButton onPress={() => setShowFilter(false)}>
    <FilterButtonText>Скасувати</FilterButtonText>
  </FilterButton>
</View>

        </ScrollView>
      </Modal>
    </View>
    </>
  );
};

export default AnimeAllArticlesScreen;
