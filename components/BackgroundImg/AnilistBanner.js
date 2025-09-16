import React, { useEffect, useState, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';

const AnilistBanner = ({ mal_id, type, height = 350, onLoaded }) => {
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!mal_id) {
      onLoaded?.(false);
      return;
    }

    let isActive = true;
    const fetchBanner = async () => {
      const query = `
        query ($mal_id: Int, $type: MediaType) {
          Media(idMal: $mal_id, type: $type) {
            bannerImage
          }
        }
      `;

      try {
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: {
              mal_id,
              type: type === 'NOVEL' ? 'MANGA' : type,
            },
          }),
        });

        const json = await res.json();
        const url = json?.data?.Media?.bannerImage;

        if (!isActive) return;
        if (url) {
          setBannerUrl(url);
          onLoaded?.(url); // Передаємо URL банеру
        } else {
          onLoaded?.(false);
        }
      } catch (error) {
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
  }, [mal_id, type]);

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

export default AnilistBanner;

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