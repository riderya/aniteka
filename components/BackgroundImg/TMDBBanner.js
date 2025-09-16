import React, { useEffect, useState, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { getTMDBBanner, getTMDBBannerByTitle, isTMDBConfigured, getTMDBBannerValidatedById, getTMDBBannerByMeta } from '../../utils/tmdbUtils';

const TMDBBanner = ({ tmdbId, title, titles = [], expectedYear = null, mediaType = 'tv', height = 350, onLoaded }) => {
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isTMDBConfigured()) {
      onLoaded?.(false);
      return;
    }

    const requestId = Math.random().toString(36).slice(2);
    let isActive = true;
    const fetchBanner = async () => {
      try {
        let bannerUrl = null;

        // Якщо є tmdbId, використовуємо його
        if (tmdbId) {
          // Валідований банер по ID з перевіркою назв/року
          bannerUrl = await getTMDBBannerValidatedById(tmdbId, Array.isArray(titles) && titles.length ? titles : [title].filter(Boolean), expectedYear, mediaType);
        }
        // Якщо немає tmdbId, але є title, шукаємо за назвою
        else if (title || (Array.isArray(titles) && titles.length)) {
          const candidates = Array.isArray(titles) && titles.length ? titles : [title];
          bannerUrl = await getTMDBBannerByMeta(candidates.filter(Boolean), expectedYear, mediaType);
        }

        if (!isActive) return;
        if (bannerUrl) {
          setBannerUrl(bannerUrl);
          onLoaded?.(bannerUrl);
        } else {
          onLoaded?.(false);
        }
      } catch (error) {
        console.error('Error fetching TMDB banner:', error);
        if (!isActive) return;
        onLoaded?.(false);
      } finally {
        if (!isActive) return;
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchBanner();
    return () => {
      isActive = false;
    };
  }, [tmdbId, title, titles, expectedYear, mediaType]);

  if (!bannerUrl) return null;

  return (
    <Container style={{ height }}>
      <ImageContainer height={height}>
        <AnimatedImage
          source={{ uri: bannerUrl }}
          resizeMode="cover"
          style={{ opacity: fadeAnim }}
        />
      </ImageContainer>
    </Container>
  );
};

export default TMDBBanner;

const Container = styled.View`
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const ImageContainer = styled.View`
  width: 100%;
  height: ${({ height }) => height}px;
  overflow: hidden;
`;

const AnimatedImage = styled(Animated.Image)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;
