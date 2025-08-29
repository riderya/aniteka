import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, Dimensions, View, ActivityIndicator } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import ArticleCard from '../Cards/ArticleCard';
import { useNavigation } from '@react-navigation/native';

const Container = styled.View`
  margin-top: 0px;
`;

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

const ArticlesSlider = React.memo(({ slug, title, onRefresh }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation();

  const fetchArticles = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await axios.post('https://api.hikka.io/articles?page=1&size=5', {
        sort: ['created:desc'],
        show_trusted: true,
        draft: false,
      });
      setArticles(response.data.list);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Реєструємо функцію оновлення
  useEffect(() => {
    if (onRefresh) {
      const unregister = onRefresh(() => fetchArticles(true));
      return unregister;
    }
  }, [onRefresh, fetchArticles]);

  const renderItem = useCallback(({ item }) => {
    return <ArticleCard item={item} theme={theme} cardWidth={CARD_WIDTH} />;
  }, [theme]);

  const keyExtractor = useCallback((item) => item.slug || Math.random().toString(), []);

  const ItemSeparator = useCallback(() => <View style={{ width: 12 }} />, []);

  const getItemLayout = useCallback((data, index) => ({
    length: CARD_WIDTH + 12, // ширина картки + відступ
    offset: (CARD_WIDTH + 12) * index,
    index,
  }), []);

  if (loading) {
    return (
      <Container>
        <RowLineHeader
          title="Статті"
          onPress={() => navigation.navigate('AnimeAllArticlesScreen', { slug, title })}
        />
        <LoadingContainer>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </LoadingContainer>
      </Container>
    );
  }

  if (articles.length === 0) return null;

  return (
    <Container>
      <RowLineHeader
        title="Статті"
        onPress={() => navigation.navigate('AnimeAllArticlesScreen', { slug, title })}
      />
      <FlatList
        data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        decelerationRate="normal"
        ItemSeparatorComponent={ItemSeparator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        getItemLayout={getItemLayout}
        refreshing={refreshing}
      />
    </Container>
  );
});

ArticlesSlider.displayName = 'ArticlesSlider';

export default ArticlesSlider;
