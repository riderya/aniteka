import React from 'react';
import { View, Dimensions } from 'react-native';
import styled from 'styled-components/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CollectionCardSkeleton = ({ compact = false, cardWidth: customCardWidth }) => {
  const cardWidth = customCardWidth || (compact ? SCREEN_WIDTH * 0.6 : SCREEN_WIDTH - 24);
  const imageHeight = cardWidth * 0.6;

  return (
    <Card style={{ width: cardWidth }} compact={compact}>
      {!compact && (
        <CardInner>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <RowInner style={{ minWidth: 70 }}>
              <SkeletonText />
            </RowInner>
            <RowInner>
              <SkeletonIcon />
              <SkeletonText />
            </RowInner>
            <RowInner>
              <SkeletonIcon />
              <SkeletonText />
            </RowInner>
          </View>
        </CardInner>
      )}

      <CardWrapper style={{ paddingTop: imageHeight }}>
        <AnimeStack>
          <SkeletonImage style={{ height: imageHeight }} />
          <SkeletonImageSecond style={{ height: imageHeight }} />
        </AnimeStack>

        <FolderBackground style={{ height: imageHeight + 30 }} />

        <GradientOverlay style={{ height: 160 }}>
          <SkeletonTitle />
        </GradientOverlay>
      </CardWrapper>
    </Card>
  );
};

export default CollectionCardSkeleton;

// --- Styled Components ---

const Card = styled.View`
  border-radius: 24px;
  overflow: hidden;
  border: 2px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const CardWrapper = styled.View`
  position: relative;
`;

const FolderBackground = styled.View`
  position: absolute;
  top: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  z-index: 0;
  border-radius: 24px;
`;

const AnimeStack = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const SkeletonImage = styled.View`
  width: 100%;
  border-radius: 24px;
  position: absolute;
  top: 20px;
  z-index: 2;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  overflow: hidden;
`;

const SkeletonImageSecond = styled.View`
  width: 100%;
  border-radius: 24px;
  position: absolute;
  top: 10px;
  z-index: 1;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  opacity: 0.2;
  overflow: hidden;
`;

const SkeletonTitle = styled.View`
  height: 20px;
  width: 80%;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
`;

const SkeletonText = styled.View`
  height: 14px;
  width: 30px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonIcon = styled.View`
  height: 14px;
  width: 14px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 2px;
  overflow: hidden;
`;

const CardInner = styled.View`
  position: absolute;
  top: 32px;   
  left: 12px;
  right: 12px; 
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  z-index: 3;
`;

const RowInner = styled.View`
  background-color: ${({ theme }) => theme.colors.transparentBackground70};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
  padding: 6px 12px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const GradientOverlay = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding-horizontal: 12px;
  padding-top: 12px;
  padding-bottom: 8px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  z-index: 4;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.card};
`;


