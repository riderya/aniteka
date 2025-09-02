import React, { useEffect, useMemo } from 'react';
import { Animated, View } from 'react-native';
import styled from 'styled-components/native';

const AnimeRowCardSkeleton = ({
  imageWidth = 90,
  imageHeight = 120,
  titleFontSize = 16,
  episodesFontSize = 15,
  scoreFontSize = 15,
  descriptionFontSize = 13,
  statusFontSize = 11,
  marginBottom = 20,
  imageBorderRadius = 24,
  titleNumberOfLines = 2,
  starIconSize = 12,
  skeletonColor = null,
  theme = null,
  animationDuration = 1000,
  enableAnimation = true
}) => {
  // Анімація для скелетона
  const animatedValue = useMemo(() => new Animated.Value(0), []);
  
  useEffect(() => {
    if (!enableAnimation) return;
    
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    
    return () => animation.stop();
  }, [animatedValue, enableAnimation, animationDuration]);

  const opacity = enableAnimation ? animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  }) : 0.5;

  // Визначаємо колір скелетона
  const getSkeletonColor = () => {
    if (skeletonColor) return skeletonColor;
    if (theme?.colors?.skeletonBackground) return theme.colors.skeletonBackground;
    return '#e1e1e1';
  };

  const skeletonBgColor = getSkeletonColor();

  return (
    <Container marginBottom={marginBottom}>
      <Animated.View 
        style={[
          { 
            backgroundColor: skeletonBgColor,
            marginRight: 12,
            width: imageWidth, 
            height: imageHeight, 
            borderRadius: imageBorderRadius 
          }, 
          { opacity }
        ]} 
      />
      <InfoContainer>
        <Animated.View 
          style={[
            { 
              backgroundColor: skeletonBgColor,
              borderRadius: 6,
              marginBottom: 8,
              height: titleFontSize * 1.2 
            }, 
            { opacity }
          ]} 
        />
        <RowContainer>
          <Animated.View 
            style={[
              { 
                backgroundColor: skeletonBgColor,
                borderRadius: 4,
                width: 60,
                height: episodesFontSize 
              }, 
              { opacity }
            ]} 
          />
          <View style={{ 
            width: 4, 
            height: 4, 
            borderRadius: 2, 
            backgroundColor: skeletonBgColor 
          }} />
          <Animated.View 
            style={[
              { 
                backgroundColor: skeletonBgColor,
                borderRadius: 4,
                width: 40,
                height: scoreFontSize 
              }, 
              { opacity }
            ]} 
          />
        </RowContainer>
        <Animated.View 
          style={[
            { 
              backgroundColor: skeletonBgColor,
              borderRadius: 4,
              width: '100%',
              height: descriptionFontSize * 2,
              marginBottom: 8 
            }, 
            { opacity }
          ]} 
        />
        <TagsContainer>
          <Animated.View 
            style={[
              { 
                backgroundColor: skeletonBgColor,
                borderRadius: 12,
                width: 80,
                height: statusFontSize + 8 
              }, 
              { opacity }
            ]} 
          />
          <Animated.View 
            style={[
              { 
                backgroundColor: skeletonBgColor,
                borderRadius: 12,
                width: 80,
                height: statusFontSize + 8 
              }, 
              { opacity }
            ]} 
          />
        </TagsContainer>
      </InfoContainer>
    </Container>
  );
};

export default AnimeRowCardSkeleton;

// Стилізовані компоненти
const Container = styled.View`
  flex-direction: row;
  margin-bottom: ${({ marginBottom }) => marginBottom}px;
`;

const InfoContainer = styled.View`
  flex: 1;
  justify-content: space-between;
`;

const RowContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;
