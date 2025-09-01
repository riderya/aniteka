import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import axios from 'axios';
import TopDetail from '../components/DetailsAnime/TopDetail';
import BackButton from '../components/DetailsAnime/BackButton';
import LikeAnimeButtonAbsolute from '../components/DetailsAnime/LikeAnimeButtonAbsolute';
import AnimeMainCharacters from '../components/DetailsAnime/AnimeMainCharacters';
import VideoSlider from '../components/DetailsAnime/VideoSlider';
import MusicSlider from '../components/DetailsAnime/MusicSlider';
import AnimeRatingStats from '../components/DetailsAnime/AnimeRatingStats';
import AnimeStatusStats from '../components/DetailsAnime/AnimeStatusStats';
import AnimeFranchiseList from '../components/DetailsAnime/AnimeFranchiseList';
import AnimeStaffSlider from '../components/DetailsAnime/AnimeStaffSlider';
import AnimeRecommendationsSlider from '../components/DetailsAnime/AnimeRecommendationsSlider';
import AnimeSendButton from '../components/DetailsAnime/AnimeSendButton';
import { useWatchStatus } from '../context/WatchStatusContext';

const AnimeDetailsScreen = ({ route }) => {
  const { slug } = route.params;
  const [anime, setAnime] = useState(null);
  const [showFranchiseDivider, setShowFranchiseDivider] = useState(false);
  const [showRecommendationsDivider, setShowRecommendationsDivider] = useState(false);
  const [showCharactersDivider, setShowCharactersDivider] = useState(false);
  const [showVideoDivider, setShowVideoDivider] = useState(false);
  const [showMusicDivider, setShowMusicDivider] = useState(false);
  const [showStaffDivider, setShowStaffDivider] = useState(false);
  const { theme, isDark } = useTheme();
  const { authToken, isAuthChecked, fetchAnimeStatus, fetchAnimeFavourite } = useWatchStatus();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/anime/${slug}`);
        setAnime(response.data);
        
        // Попереднє завантаження даних користувача після отримання аніме
        if (isAuthChecked && authToken) {
          // Завантажуємо паралельно для швидшого відображення
          Promise.allSettled([
            fetchAnimeStatus(slug),
            fetchAnimeFavourite(slug)
          ]).catch(error => {
            console.log('Error preloading user data:', error);
          });
        }
      } catch (error) {
        console.log('Error fetching anime details:', error);
      }
    };
    fetchAnimeDetails();
  }, [slug, authToken, isAuthChecked, fetchAnimeStatus, fetchAnimeFavourite]);

  // Функції для відстеження видимості компонентів
  const handleFranchiseVisibility = (isVisible) => {
    setShowFranchiseDivider(isVisible);
  };

  const handleRecommendationsVisibility = (isVisible) => {
    setShowRecommendationsDivider(isVisible);
  };

  const handleCharactersVisibility = (isVisible) => {
    setShowCharactersDivider(isVisible);
  };

  const handleVideoVisibility = (isVisible) => {
    setShowVideoDivider(isVisible);
  };

  const handleMusicVisibility = (isVisible) => {
    setShowMusicDivider(isVisible);
  };

  const handleStaffVisibility = (isVisible) => {
    setShowStaffDivider(isVisible);
  };

  return (
    <ScreenWrapper>
        <BackButton top={12} />
        <LikeAnimeButtonAbsolute slug={slug} top={12} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
        {anime && (
          <>
            <TopDetail anime={anime} />
            <Divider />
            <AnimeMainCharacters 
              anime={anime}
              onVisibilityChange={handleCharactersVisibility}
            />
            {showCharactersDivider && <Divider />}
            <AnimeRatingStats 
              stats={anime.stats} 
              score={anime.score} 
              slug={anime.slug}
            />
            <Divider />
            <AnimeStatusStats 
              anime={anime}
            />
            <Divider />
            <AnimeFranchiseList 
              slug={anime.slug} 
              title={anime.title_ua || anime.title_en || anime.title_ja || '?'} 
              onVisibilityChange={handleFranchiseVisibility}
            />
            {showFranchiseDivider && <Divider />}
            <VideoSlider 
              slug={anime.slug} 
              onVisibilityChange={handleVideoVisibility}
            />
            {showVideoDivider && <Divider />}
            <MusicSlider 
              slug={anime.slug} 
              onVisibilityChange={handleMusicVisibility}
            />
            {showMusicDivider && <Divider />}
            <AnimeStaffSlider 
              slug={anime.slug} 
              title={anime.title_ua || anime.title_en || anime.title_ja || '?'}
              onVisibilityChange={handleStaffVisibility}
            />
            {showStaffDivider && <Divider />}
            <AnimeRecommendationsSlider 
              slug={anime.slug} 
              onVisibilityChange={handleRecommendationsVisibility}
            />
            {showRecommendationsDivider && <Divider />}
            <AnimeSendButton 
              slug={anime.slug} 
              title={anime.title_ua || anime.title_en || anime.title_ja || '?'}
              commentsCount={anime.comments_count}
            />
          </>
        )}
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

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.card};
  margin: 25px 12px;
`;
