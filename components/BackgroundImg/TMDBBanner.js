import React, { useEffect, useState, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { getTMDBBanner, getTMDBBannerByTitle, isTMDBConfigured } from '../../utils/tmdbUtils';

const TMDBBanner = ({ tmdbId, title, mediaType = 'tv', height = 350, onLoaded }) => {
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isTMDBConfigured()) {
      onLoaded?.(false);
      return;
    }

    const fetchBanner = async () => {
      try {
        let bannerUrl = null;

        // Якщо є tmdbId, використовуємо його
        if (tmdbId) {
          bannerUrl = await getTMDBBanner(tmdbId, mediaType);
        }
        // Якщо немає tmdbId, але є title, шукаємо за назвою
        else if (title) {
          bannerUrl = await getTMDBBannerByTitle(title, mediaType);
        }

        if (bannerUrl) {
          setBannerUrl(bannerUrl);
          onLoaded?.(bannerUrl);
        } else {
          onLoaded?.(false);
        }
      } catch (error) {
        console.error('Error fetching TMDB banner:', error);
        onLoaded?.(false);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchBanner();
  }, [tmdbId, title, mediaType]);

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
