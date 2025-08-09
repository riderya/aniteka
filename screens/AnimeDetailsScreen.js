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
      <FixedBackButtonWrapper>
        <BackButton />
      </FixedBackButtonWrapper>

      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
        <TopDetail anime={anime} />
        <AnimeMainCharacters anime={anime}/>
        <AnimeRatingStats stats={anime.stats} score={anime.score} slug={anime.slug} />
        <AnimeStatusStats anime={anime} />
        <AnimeFranchiseList slug={anime.slug} />
        <VideoSlider anime={anime} />
        <MusicSlider anime={anime} />
        <AnimeStaffSlider slug={anime.slug} title={anime.title_ua || anime.title_en || anime.title_ja || '?'} />
        <AnimeRecommendationsSlider slug={anime.slug} />
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

const FixedBackButtonWrapper = styled.View`
  position: absolute;
  top: 50px;
  left: 12px;
  z-index: 10;
`;

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;