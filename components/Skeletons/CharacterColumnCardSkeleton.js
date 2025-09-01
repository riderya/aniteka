import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';

const CharacterColumnCardSkeleton = ({
  width = '100px',
  height = '130px',
  borderRadius = 24,
  cardWidth = '100px',
  cardMarginRight = '12px',
  marginTop = '10px',
}) => {
  return (
    <Card cardWidth={cardWidth} cardMarginRight={cardMarginRight}>
      <SkeletonImage 
        width={width} 
        height={height} 
        borderRadius={borderRadius}
      />
      <SkeletonName marginTop={marginTop} />
    </Card>
  );
};

export default CharacterColumnCardSkeleton;

// --- Styled Components ---

const Card = styled.View`
  margin-right: ${({ cardMarginRight }) => cardMarginRight};
  width: ${({ cardWidth }) => cardWidth};
`;

const SkeletonImage = styled.View`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  border-radius: ${({ borderRadius }) => borderRadius}px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonName = styled.View`
  width: 100%;
  height: 16px;
  border-radius: 8px;
  margin-top: ${({ marginTop }) => marginTop};
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;
