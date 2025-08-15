import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, Dimensions, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import ArticleCard from '../Cards/ArticleCard';
import { useNavigation } from '@react-navigation/native';

const Container = styled.View`
  margin-top: 0px;
`;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

const ArticlesSlider = React.memo(({ slug, title }) => {
  const [articles, setArticles] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    axios
      .post('https://api.hikka.io/articles?page=1&size=5', {
        sort: ['created:desc'],
        show_trusted: true,
        draft: false,
      })
      .then((res) => setArticles(res.data.list))
              .catch((err) => {});
  }, []);

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
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        ItemSeparatorComponent={ItemSeparator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        getItemLayout={getItemLayout}
      />
    </Container>
  );
});

ArticlesSlider.displayName = 'ArticlesSlider';

export default ArticlesSlider;
