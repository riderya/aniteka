import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';

const AnimeColumnCardSkeleton = ({
  cardWidth = 100,
  imageWidth = 100,
  imageHeight = 130,
  titleFontSize = 14,
  footerFontSize = 11,
  badgeFontSize = 11,
  badgePadding = 4,
  badgeBottom = 10,
  badgeLeft = 10,
  badgeRight = 10,
  marginTop = 0,
  marginBottom = 0,
  imageBorderRadius = 24,
  titleNumberOfLines = 2,
  starIconSize = 11
}) => {
  return (
    <Card 
      cardWidth={cardWidth} 
      marginTop={marginTop} 
      marginBottom={marginBottom}
    >
      <PosterWrapper>
        <SkeletonPoster 
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          imageBorderRadius={imageBorderRadius}
        />
        <SkeletonBadge 
          badgeBottom={badgeBottom}
          badgeLeft={badgeLeft}
          badgeRight={badgeRight}
          badgePadding={badgePadding}
          badgeFontSize={badgeFontSize}
        />
      </PosterWrapper>
      
      <SkeletonTitle 
        cardWidth={cardWidth}
        titleFontSize={titleFontSize}
      />
      
      <SkeletonFooter>
        <SkeletonEpisodes footerFontSize={footerFontSize} />
        <SkeletonDot />
        <SkeletonScore>
          <SkeletonScoreText footerFontSize={footerFontSize} />
          <SkeletonStar starIconSize={starIconSize} />
        </SkeletonScore>
      </SkeletonFooter>
    </Card>
  );
};

export default AnimeColumnCardSkeleton;

// --- Styled Components ---

const Card = styled.View`
  width: ${({ cardWidth }) => cardWidth}px;
  margin-top: ${({ marginTop }) => marginTop}px;
  margin-bottom: ${({ marginBottom }) => marginBottom}px;
`;

const PosterWrapper = styled.View`
  position: relative;
`;

const SkeletonPoster = styled.View`
  width: ${({ imageWidth }) => imageWidth}px;
  height: ${({ imageHeight }) => imageHeight}px;
  border-radius: ${({ imageBorderRadius }) => imageBorderRadius}px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonBadge = styled.View`
  position: absolute;
  bottom: ${({ badgeBottom }) => badgeBottom}px;
  left: ${({ badgeLeft }) => badgeLeft}px;
  right: ${({ badgeRight }) => badgeRight}px;
  padding: ${({ badgePadding }) => badgePadding}px;
  border-radius: 999px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  height: ${({ badgeFontSize }) => badgeFontSize + 8}px;
`;

const SkeletonTitle = styled.View`
  margin-top: 10px;
  font-size: ${({ titleFontSize }) => titleFontSize}px;
  width: ${({ cardWidth }) => cardWidth}px;
  height: ${({ titleFontSize }) => titleFontSize * 1.2}px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonFooter = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

const SkeletonEpisodes = styled.View`
  width: 40px;
  height: ${({ footerFontSize }) => footerFontSize}px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonDot = styled.View`
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonScore = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

const SkeletonScoreText = styled.View`
  width: 20px;
  height: ${({ footerFontSize }) => footerFontSize}px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonStar = styled.View`
  width: ${({ starIconSize }) => starIconSize}px;
  height: ${({ starIconSize }) => starIconSize}px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;
