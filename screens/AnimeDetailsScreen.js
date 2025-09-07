import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import axios from 'axios';
import TopDetail from '../components/DetailsAnime/TopDetail';
import AnimeDetailsScreenSkeleton from '../components/Skeletons/AnimeDetailsScreenSkeleton';
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
import NSFWAgeVerificationModal from '../components/NSFWAgeVerificationModal';
import { useWatchStatus } from '../context/WatchStatusContext';

const AnimeDetailsScreen = ({ route, navigation }) => {
  const { slug } = route.params;
  const [anime, setAnime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFranchiseDivider, setShowFranchiseDivider] = useState(false);
  const [showRecommendationsDivider, setShowRecommendationsDivider] = useState(false);
  const [showCharactersDivider, setShowCharactersDivider] = useState(false);
  const [showVideoDivider, setShowVideoDivider] = useState(false);
  const [showMusicDivider, setShowMusicDivider] = useState(false);
  const [showStaffDivider, setShowStaffDivider] = useState(false);
  const [showNSFWModal, setShowNSFWModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, isDark } = useTheme();
  const { authToken, isAuthChecked, fetchAnimeStatus, fetchAnimeFavourite } = useWatchStatus();
  const insets = useSafeAreaInsets();
  
  // Ref для debounce
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://api.hikka.io/anime/${slug}`);
        setAnime(response.data);
        
        // Перевіряємо чи є NSFW контент
        if (response.data && isNSFWContent(response.data)) {
          setShowNSFWModal(true);
        }
        
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimeDetails();
  }, [slug, authToken, isAuthChecked]); // Видаляємо функції з залежностей

  // Функція для перевірки NSFW контенту
  const isNSFWContent = (animeData) => {
    // Спочатку перевіряємо явне поле nsfw
    if (animeData.nsfw === true) {
      return true;
    }
    
    // Перевіряємо рейтинг - тільки R+ і RX вважаються NSFW
    const rating = animeData.rating || '';
    const ratingLower = rating.toLowerCase();
    
    // R+, R PLUS і RX - це дорослий контент
    if (ratingLower === 'r+' || ratingLower === 'r plus' || ratingLower === 'r_plus' || ratingLower === 'rx') {
      return true;
    }
    
    return false;
  };

  // Обробники для модального вікна
  const handleNSFWConfirm = () => {
    setShowNSFWModal(false);
  };

  const handleNSFWCancel = () => {
    setShowNSFWModal(false);
    navigation.goBack();
  };

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

  // Обробник скролу для показу/приховування кнопки з debounce
  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const threshold = 450; // Збільшуємо поріг для більш плавної роботи
    
    // Очищуємо попередній таймаут
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Додаємо невелику затримку для уникнення занадто частих оновлень
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollY > threshold && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollY <= threshold && isScrolled) {
        setIsScrolled(false);
      }
    }, 50); // 50ms затримка
  }, [isScrolled]);

    // Якщо завантаження та немає даних, показуємо повний скелетон екрану
  if (isLoading && !anime) {
    return (
      <ScreenWrapper>
        <BackButton top={12} />
        <AnimeDetailsScreenSkeleton />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
        <BackButton top={12} />
        <LikeAnimeButtonAbsolute slug={slug} top={12} isVisible={isScrolled} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        showsVerticalScrollIndicator={false}
      >
        <TopDetail anime={anime} isLoading={isLoading} />
        {anime && !isLoading && (
          <>
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
      
      <NSFWAgeVerificationModal
        visible={showNSFWModal}
        onConfirm={handleNSFWConfirm}
        onCancel={handleNSFWCancel}
      />
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
