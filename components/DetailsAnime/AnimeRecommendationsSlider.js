import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from './RowLineHeader';

const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.border};
  padding-top: 20px;
`;

const LineGray = styled.View`
  margin-top: 25px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const Card = styled(TouchableOpacity)`
  width: 120px;
`;

const Poster = styled.Image`
  width: 100%;
  height: 170px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
`;

const Spacer = styled.View`
  width: 12px;
`;

const AnimeRecommendationsSlider = ({ slug }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`https://api.hikka.io/anime/${slug}/recommendations`);
        const json = await res.json();
        setRecommendations(json.list || []);
      } catch (e) {
        console.error('Помилка завантаження рекомендацій:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [slug]);

  if (loading) {
    return (
      <Container>
        <RowLineHeader title="Рекомендації" />
        <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
      </Container>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <Container>
      <RowLineHeader title="Рекомендації" />
      <FlatList
        horizontal
        data={recommendations}
        keyExtractor={(item) => item.slug}
        ListHeaderComponent={<Spacer />}
        ListFooterComponent={<Spacer />}
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.push('AnimeDetails', { slug: item.slug })}>
            <Poster source={{ uri: item.image }} resizeMode="cover" />
            <Title numberOfLines={2}>
              {item.title_ua || item.title_en || item.title_ja}
            </Title>
          </Card>
        )}
      />
      <LineGray />
    </Container>
  );
};

export default AnimeRecommendationsSlider;
