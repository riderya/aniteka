import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import styled from 'styled-components/native';
import axios from 'axios';
import TopDetail from '../components/DetailsAnime/TopDetail';
import BackButton from '../components/DetailsAnime/BackButton';
import AnimeMainCharacters from '../components/DetailsAnime/AnimeMainCharacters';
import VideoSlider from '../components/DetailsAnime/VideoSlider';
import MusicSlider from '../components/DetailsAnime/MusicSlider';
import AnimeRatingStats from '../components/DetailsAnime/AnimeRatingStats';
import AnimeStatusStats from '../components/DetailsAnime/AnimeStatusStats';
import AnimeFranchiseList from '../components/DetailsAnime/AnimeFranchiseList';
import AnimeStaffSlider from '../components/DetailsAnime/AnimeStaffSlider';
import AnimeRecommendationsSlider from '../components/DetailsAnime/AnimeRecommendationsSlider';
import AnimeSendButton from '../components/DetailsAnime/AnimeSendButton';

const AnimeDetailsScreen = ({ route }) => {
  const { slug } = route.params;
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/anime/${slug}`);
        setAnime(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeDetails();
  }, [slug]);

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Centered>
    );
  }

  return (
    <ScreenWrapper>
        <BackButton top={12} />
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
        <TopDetail anime={anime} />
        <Divider />
        <AnimeMainCharacters anime={anime}/>
        <Divider />
        <AnimeRatingStats stats={anime.stats} score={anime.score} slug={anime.slug} />
        <Divider />
        <AnimeStatusStats anime={anime} />
        <Divider />
        <AnimeFranchiseList slug={anime.slug} />
        <Divider />
        <VideoSlider anime={anime} />
        <Divider />
        <MusicSlider anime={anime} />
        <Divider />
        <AnimeStaffSlider slug={anime.slug} title={anime.title_ua || anime.title_en || anime.title_ja || '?'} />
        <Divider />
        <AnimeRecommendationsSlider slug={anime.slug} />
        <Divider />
        <AnimeSendButton slug={anime.slug} title={anime.title_ua || anime.title_en || anime.title_ja || '?'} commentsCount={anime.comments_count} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AnimeDetailsScreen;

const ScreenWrapper = styled.View`
  flex: 1;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.card};
  margin: 25px 12px;
`;