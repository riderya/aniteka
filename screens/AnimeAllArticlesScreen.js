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
  Switch,
  Platform,
} from 'react-native';
import axios from 'axios';
import styled from 'styled-components/native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import ArticleCard from '../components/Cards/ArticleCard';
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

const FilterButton = styled.TouchableOpacity`
  padding: 8px 16px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
  flex-direction: row;
  gap: 8px;
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

const renderItem = ({ item }) => <ArticleCard item={item} theme={theme} />;

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
    paddingTop: insets.top + 56 + 20,
    paddingBottom: 20 + insets.bottom,
    paddingHorizontal: 12,
  }}
  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
  ListHeaderComponent={() => (
    <View style={{ flexDirection: 'column', gap: 8, marginBottom: 12 }}>
      <FilterButton onPress={() => setShowFilter(true)}>
        <FontAwesome6 name="filter" size={18} color={theme.colors.gray} />
        <FilterButtonText>Фільтр</FilterButtonText>
      </FilterButton>
    </View>
  )}
  ListFooterComponent={loading && <ActivityIndicator />}
  refreshControl={
    <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    colors={[theme.colors.text]}
    tintColor={theme.colors.text}
    progressViewOffset={insets.top + 56}
    progressBackgroundColor={isDark ? theme.colors.card : undefined}
  />
  }
/>


      {/* Модалка ФІЛЬТРІВ */}
      <Modal visible={showFilter} animationType="slide">
        <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 12 }}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={false}
        keyboardShouldPersistTaps="handled">
          <Text style={{ color: theme.colors.text, fontSize: 24, marginBottom: 10, fontWeight: 'bold' }}>Фільтри</Text>

{/* Категорії */}
<Text style={{ color: theme.colors.text, marginBottom: 8, fontSize: 16, fontWeight: '600' }}>
  Категорії
</Text>

<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {Object.keys(CATEGORY_TRANSLATIONS).map((cat) => {
    const isActive = filters.categories.includes(cat);
    return (
      <Pressable
        key={cat}
        style={{
          backgroundColor: isActive ? theme.colors.primary : theme.colors.inputBackground,
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
        <Text
          style={{
            color: isActive ? '#fff' : theme.colors.text,
          }}
        >
          {CATEGORY_TRANSLATIONS[cat]}
        </Text>
      </Pressable>
    );
  })}
</View>




{/* Сортування */}
<Text
  style={{
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 600,
  }}
>
  Сортування:
</Text>

<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  {/* За датою */}
  <Pressable
    style={{
      flex: 1,
      backgroundColor: filters.sort[0].includes('created')
        ? theme.colors.primary
        : theme.colors.inputBackground,
      padding: 10,
      borderRadius: 8,
    }}
    onPress={() => {
      const dir = filters.sort[0].split(':')[1];
      setFilters((prev) => ({ ...prev, sort: [`created:${dir}`] }));
    }}
  >
    <Text
      style={{
        color: filters.sort[0].includes('created') ? '#fff' : theme.colors.text,
        textAlign: 'center',
      }}
    >
      За датою
    </Text>
  </Pressable>

  {/* За рейтингом */}
  <Pressable
    style={{
      flex: 1,
      backgroundColor: filters.sort[0].includes('vote_score')
        ? theme.colors.primary
        : theme.colors.inputBackground,
      padding: 10,
      borderRadius: 8,
    }}
    onPress={() => {
      const dir = filters.sort[0].split(':')[1];
      setFilters((prev) => ({ ...prev, sort: [`vote_score:${dir}`] }));
    }}
  >
    <Text
      style={{
        color: filters.sort[0].includes('vote_score') ? '#fff' : theme.colors.text,
        textAlign: 'center',
      }}
    >
      За рейтингом
    </Text>
  </Pressable>

  {/* Сортування напрямку */}
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
      color={theme.colors.gray}
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
<Text style={{ color: theme.colors.text, marginTop: 16, fontSize: 16, marginBottom: 8, fontWeight: 600 }}>
  Теги
</Text>

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
    style={{
      backgroundColor: theme.colors.inputBackground,
      padding: 10,
      borderRadius: 8,
    }}
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
    <FontAwesome6 name="plus" size={18} color={theme.colors.gray} />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff' }}>{tag} </Text>
      <Ionicons name="close" size={20} color={theme.colors.background} />
    </Pressable>
  ))}
</View>



{/* Відображення чернеток */}
<Text
  style={{
    color: theme.colors.text,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  }}
>
  Відображення
</Text>

<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,

  }}
>
  <Text style={{ color: theme.colors.text, fontSize: 16 }}>
    Чернетки: {filters.draft ? 'Увімкнено' : 'Вимкнено'}
  </Text>
  <Switch
    value={filters.draft}
    onValueChange={(value) =>
      setFilters((prev) => ({ ...prev, draft: value }))
    }
    trackColor={{ false: '#767577', true: theme.colors.primary }}
    thumbColor={filters.draft ? '#fff' : '#f4f3f4'}
  />
</View>


{/* Тип контенту */}
<Text
  style={{
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  }}
>
  Тип контенту
</Text>

<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {Object.keys(TYPE_TRANSLATIONS).map((type) => {
    const isActive = filters.content_type === type;
    return (
      <Pressable
        key={type}
        style={{
          backgroundColor: isActive
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
        <Text style={{ color: isActive ? '#fff' : theme.colors.text }}>
          {TYPE_TRANSLATIONS[type]}
        </Text>
      </Pressable>
    );
  })}
</View>


        </ScrollView>

                {/* Кнопки */}
<View style={{ position: 'absolute', width: '100%', padding: 12, bottom: 0, marginTop: 32, gap: 12, backgroundColor: theme.colors.background, borderTopWidth: 1, borderColor: theme.colors.border }}>
  {/* Ряд з кнопками Очистити та Застосувати */}
  <View
   style={{ flexDirection: 'row', gap: 12, paddingBottom: insets.bottom, }}>
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
      style={{ flex: 1, backgroundColor: theme.colors.primary }}
      onPress={() => {
        setShowFilter(false);
        fetchArticles(1, true);
      }}
    >
      <FilterButtonText style={{ color: theme.colors.background }}>Застосувати</FilterButtonText>
    </FilterButton>
  </View>

  {/* Кнопка Скасувати окремо знизу */}
  {/* <FilterButton onPress={() => setShowFilter(false)}>
    <FilterButtonText>Скасувати</FilterButtonText>
  </FilterButton> */}
</View>

      </Modal>
    </View>
    </>
  );
};

export default AnimeAllArticlesScreen;
