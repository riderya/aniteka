import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';

const AnimeScheduleCardSkeleton = () => {
  return (
    <Card>
      <SkeletonImage />
      <InfoWrapper>
        <SkeletonTitle />
        <SkeletonTimeLeft />
        <SkeletonEpisode />
      </InfoWrapper>
    </Card>
  );
};

export default AnimeScheduleCardSkeleton;

// --- Styled Components ---

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  margin-right: 12px;
  width: 300px;
`;

const SkeletonImage = styled.View`
  width: 65px;
  height: 90px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const InfoWrapper = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const SkeletonTitle = styled.View`
  width: 100%;
  height: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonTimeLeft = styled.View`
  width: 80px;
  height: 14px;
  border-radius: 7px;
  margin-top: 6px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonEpisode = styled.View`
  width: 60px;
  height: 14px;
  border-radius: 7px;
  margin-top: 6px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;
