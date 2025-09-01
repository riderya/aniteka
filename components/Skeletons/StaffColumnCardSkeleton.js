import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';

const StaffColumnCardSkeleton = ({
  cardWidth = '100px',
  imageWidth = '100px',
  imageHeight = '130px',
  borderRadius = 24,
  marginRight = '12px',
}) => {
  return (
    <Card cardWidth={cardWidth} marginRight={marginRight}>
      <SkeletonImage 
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        borderRadius={borderRadius}
      />
      <SkeletonRole />
      <SkeletonName />
    </Card>
  );
};

export default StaffColumnCardSkeleton;

// --- Styled Components ---

const Card = styled.View`
  margin-right: ${({ marginRight }) => marginRight};
  width: ${({ cardWidth }) => typeof cardWidth === 'string' ? cardWidth : `${cardWidth}px`};
`;

const SkeletonImage = styled.View`
  width: ${({ imageWidth }) => typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px`};
  height: ${({ imageHeight }) => typeof imageHeight === 'string' ? imageHeight : `${imageHeight}px`};
  border-radius: ${({ borderRadius }) => borderRadius}px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonRole = styled.View`
  width: 60px;
  height: 12px;
  border-radius: 6px;
  margin-top: 8px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonName = styled.View`
  width: 100%;
  height: 14px;
  border-radius: 7px;
  margin-top: 4px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;
