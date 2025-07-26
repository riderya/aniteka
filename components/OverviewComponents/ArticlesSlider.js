import React, { useEffect, useState } from 'react';
import { FlatList, Dimensions, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import axios from 'axios';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import ArticleCard from '../Cards/ArticleCard';
import { useNavigation } from '@react-navigation/native';

const Container = styled.View`
  margin-top: 25px;
`;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

const ArticlesSlider = ({ slug, title }) => {
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
      .catch((err) => console.error('Failed to fetch articles:', err));
  }, []);

  const renderItem = ({ item }) => {
    return <ArticleCard item={item} theme={theme} cardWidth={CARD_WIDTH} />;
  };

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
  keyExtractor={(item) => item.slug || Math.random().toString()}
  renderItem={renderItem}
  contentContainerStyle={{ paddingHorizontal: 12 }}
  snapToInterval={CARD_WIDTH + 12}
  decelerationRate="fast"
  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
/>

    </Container>
  );
};

export default ArticlesSlider;
