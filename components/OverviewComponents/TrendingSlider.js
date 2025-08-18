import React, { useState, useEffect, memo } from 'react';
import { FlatList, ActivityIndicator, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';
import { PlatformBlurView } from '../Custom/PlatformBlurView';
import { useNavigation } from '@react-navigation/native';
import AnilistBanner from '../../components/BackgroundImg/AnilistBanner';
import KitsuBanner   from '../../components/BackgroundImg/KitsuBanner';

const { width }   = Dimensions.get('window');
const CARD_WIDTH  = width * 0.85;
const CARD_HEIGHT = 200;

const TrendingSlider = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const { isDark } = useTheme();

  const fetchAnime = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://api.hikka.io/anime', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          years: [2025,2025],
          season: ['summer'],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          `HTTP ${response.status}: ${data.message ?? 'Помилка запиту'}`
        );
      }

      const { list = [] } = await response.json();

      const enriched = await Promise.all(
        list.map(async anime => {
          try {
            const r = await fetch(`https://api.hikka.io/anime/${anime.slug}`);
            if (!r.ok) throw new Error();

            const d = await r.json();
            return { ...anime, mal_id: d.mal_id };
          } catch {
            return { ...anime, mal_id: null };
          }
        })
      );

      setAnimeList(enriched);
    } catch (e) {
      setError(e.message ?? 'Помилка при завантаженні аніме');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" color="#007AFF" />
      </Centered>
    );
  }


  const CardItem = memo(({ item }) => {
    const navigation = useNavigation();
    const [bannerStage, setBannerStage] = useState('anilist');

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
      >
        <Card>
          {bannerStage === 'anilist' && (
            <AnilistBanner
              mal_id={item.mal_id}
              type="ANIME"
              onLoaded={url => {
                if (!url) setBannerStage('kitsu');
              }}
            />
          )}

          {bannerStage === 'kitsu' && (
            <KitsuBanner
              slug={item.slug}
              onLoaded={url => {
                if (!url) setBannerStage('image');
              }}
            />
          )}

          {bannerStage === 'image' && (
            <FallbackImage
              source={{ uri: item.image }}
              resizeMode="cover"
            />
          )}

          <Info intensity={100} tint={isDark ? 'dark' : 'light'}>
            <Title numberOfLines={1}>{item.title_ua || item.title_en || item.title_ja}</Title>
            <RowContainer>
              <SubText>
                {item.episodes_released} / {item.episodes_total}
              </SubText>
              <SubText>{item.status}</SubText>
            </RowContainer>
          </Info>
        </Card>
      </TouchableOpacity>
    );
  });

  return (
    <Container>
      <FlatList
        data={animeList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.slug}
        renderItem={({ item }) => <CardItem item={item} />}
        snapToAlignment="start"
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 12 }}
      />
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
`;

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorText = styled.Text`
  color: red;
  font-size: 16px;
`;

const Card = styled.View`
  width: ${CARD_WIDTH}px;
  margin-right: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  overflow: hidden;
  height: ${CARD_HEIGHT}px;
  flex-direction: row;
  align-items: center;
`;

const Info = styled(PlatformBlurView)`
  position: absolute;
  bottom: 0;
  padding: 8px 12px;
  width: 100%;
`;

const RowContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Title = styled.Text`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const SubText = styled.Text`
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.placeholder};
`;

const FallbackImage = styled.Image`
  width: 100%;
  height: ${CARD_HEIGHT}px;
`;

export default TrendingSlider;
