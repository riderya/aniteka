import React, { useEffect, useState, useRef } from 'react';
import { Animated, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

const KitsuBanner = ({ slug, height = 350, onLoaded }) => {
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!slug) {
      onLoaded?.(false);
      return;
    }

    let isActive = true;
    const fetchBanner = async () => {
      const cleanedSlug = slug.replace(/-[a-z0-9]{6}$/, '');

      try {
        const res = await fetch(`https://kitsu.io/api/edge/anime?filter[slug]=${cleanedSlug}`);
        const json = await res.json();
        const anime = json?.data?.[0];
        const url = anime?.attributes?.coverImage?.original;

        if (!isActive) return;
        if (url) {
          setBannerUrl(url);
          setOffset(anime?.attributes?.coverImageTopOffset || 0);
          onLoaded?.(url); // Передаємо URL банеру
        } else {
          onLoaded?.(false);
        }
      } catch (err) {
        console.error('Error fetching Kitsu banner:', err);
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
  }, [slug]);

  if (!bannerUrl) return null;

  return (
    <Container style={{ height }}>
      <ImageContainer height={height}>
        <AnimatedImage
          source={{ uri: bannerUrl }}
          resizeMode="cover"
          style={{
            opacity: fadeAnim,
            top: offset ? -offset : 0,
          }}
        />
      </ImageContainer>
    </Container>
  );
};

export default KitsuBanner;

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
  left: 0;
`;

const Loader = styled(ActivityIndicator)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;