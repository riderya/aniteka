import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import styled from 'styled-components/native';
import TopDetailSkeleton from './TopDetailSkeleton';

const AnimeDetailsScreenSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();
  }, [fadeAnim]);

  return (
    <Container>
      {/* TopDetail скелетон */}
      <TopDetailSkeleton />
      
      {/* Розділювач */}
      <Divider />
      
      {/* Персонажі скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <CharactersRowSkeleton>
            <CharacterCardSkeleton />
            <CharacterCardSkeleton />
            <CharacterCardSkeleton />
          </CharactersRowSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Статистика рейтингу скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <RatingStatsSkeleton>
            <RatingBarSkeleton />
            <RatingBarSkeleton />
            <RatingBarSkeleton />
            <RatingBarSkeleton />
            <RatingBarSkeleton />
          </RatingStatsSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Статистика статусу скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <StatusStatsSkeleton>
            <StatusItemSkeleton />
            <StatusItemSkeleton />
            <StatusItemSkeleton />
            <StatusItemSkeleton />
            <StatusItemSkeleton />
          </StatusStatsSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Франшиза скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <FranchiseSkeleton>
            <FranchiseItemSkeleton />
            <FranchiseItemSkeleton />
            <FranchiseItemSkeleton />
          </FranchiseSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Відео скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <VideoSliderSkeleton>
            <VideoItemSkeleton />
            <VideoItemSkeleton />
            <VideoItemSkeleton />
          </VideoSliderSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Музика скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <MusicSliderSkeleton>
            <MusicItemSkeleton />
            <MusicItemSkeleton />
            <MusicItemSkeleton />
          </MusicSliderSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Персонал скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <StaffSliderSkeleton>
            <StaffItemSkeleton />
            <StaffItemSkeleton />
            <StaffItemSkeleton />
          </StaffSliderSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Рекомендації скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionSkeleton>
          <SectionTitleSkeleton />
          <RecommendationsSkeleton>
            <RecommendationItemSkeleton />
            <RecommendationItemSkeleton />
            <RecommendationItemSkeleton />
          </RecommendationsSkeleton>
        </SectionSkeleton>
      </Animated.View>
      
      <Divider />
      
      {/* Кнопка коментарів скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <CommentButtonSkeleton />
      </Animated.View>
    </Container>
  );
};

export default AnimeDetailsScreenSkeleton;

// --- Styled Components ---

const Container = styled.View`
  flex: 1;

`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.card};
  margin: 25px 12px;
`;

const SectionSkeleton = styled.View`
  margin-bottom: 20px;
`;

const SectionTitleSkeleton = styled.View`
  width: 150px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 6px;
  margin-bottom: 16px;
`;

const CharactersRowSkeleton = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const CharacterCardSkeleton = styled.View`
  width: 120px;
  height: 160px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 16px;
`;

const RatingStatsSkeleton = styled.View`
  gap: 12px;
`;

const RatingBarSkeleton = styled.View`
  height: 20px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 10px;
`;

const StatusStatsSkeleton = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const StatusItemSkeleton = styled.View`
  width: 80px;
  height: 60px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 12px;
`;

const FranchiseSkeleton = styled.View`
  gap: 12px;
`;

const FranchiseItemSkeleton = styled.View`
  height: 80px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 12px;
`;

const VideoSliderSkeleton = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const VideoItemSkeleton = styled.View`
  width: 200px;
  height: 120px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 12px;
`;

const MusicSliderSkeleton = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const MusicItemSkeleton = styled.View`
  width: 150px;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 12px;
`;

const StaffSliderSkeleton = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const StaffItemSkeleton = styled.View`
  width: 120px;
  height: 160px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 16px;
`;

const RecommendationsSkeleton = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const RecommendationItemSkeleton = styled.View`
  width: 120px;
  height: 180px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 16px;
`;

const CommentButtonSkeleton = styled.View`
  width: 100%;
  height: 60px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 16px;
  margin-bottom: 20px;
`;
