import React from 'react';
import { View, Dimensions } from 'react-native';
import styled from 'styled-components/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const ArticleCardSkeleton = ({ cardWidth: customCardWidth }) => {
  const cardWidth = customCardWidth || SCREEN_WIDTH * 0.9;

  return (
    <Card style={{ width: cardWidth }}>
      <TopRow>
        <AuthorRow>
          <SkeletonAvatar />
          <SkeletonUsername />
        </AuthorRow>
        <SkeletonIcon />
      </TopRow>

      <SkeletonTitle />
      
      <SkeletonImage />
      
      <RowSpaceBetween>
        <TagsRow>
          <SkeletonTag />
          <SkeletonTag />
        </TagsRow>
        <StatsRow>
          <SkeletonStat />
          <SkeletonStat />
        </StatsRow>
      </RowSpaceBetween>
    </Card>
  );
};

export default ArticleCardSkeleton;

// --- Styled Components ---

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  border-radius: 24px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SkeletonAvatar = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 8px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonUsername = styled.View`
  width: 80px;
  height: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonIcon = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonTitle = styled.View`
  width: 100%;
  height: 22px;
  border-radius: 11px;
  margin-top: 10px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const SkeletonImage = styled.View`
  width: 100%;
  height: 180px;
  border-radius: 10px;
  margin-top: 12px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const RowSpaceBetween = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const TagsRow = styled.View`
  flex-direction: row;
  gap: 6px;
`;

const SkeletonTag = styled.View`
  width: 60px;
  height: 24px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const SkeletonStat = styled.View`
  width: 40px;
  height: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
`;
