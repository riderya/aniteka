import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TopDetailSkeleton = () => {
  const { top: safeAreaTop } = useSafeAreaInsets();
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
    <>
      <Content style={{ paddingTop: safeAreaTop + 12 }}>
        {/* Постер скелетон */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <PosterSkeleton />
        </Animated.View>
      
      {/* Заголовок та підзаголовок скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TitleRowSkeleton>
          <IconInfoSkeleton />
          <TitleColumnSkeleton>
            <TitleSkeleton style={{ width: '90%' }} />
            <SubtitleSkeleton style={{ width: '75%' }} />
          </TitleColumnSkeleton>
        </TitleRowSkeleton>
      </Animated.View>
      
      {/* Кнопки статусу та лайку скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ButtonsRowSkeleton>
          <StatusButtonSkeleton />
          <LikeButtonSkeleton />
          <CommentButtonSkeleton />
        </ButtonsRowSkeleton>
      </Animated.View>
      
      {/* Кнопки дивитися та більше скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ButtonsRowSkeleton>
          <WatchButtonSkeleton />
          <MoreButtonSkeleton />
        </ButtonsRowSkeleton>
      </Animated.View>
      
      {/* Лічильник епізодів скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <EpisodesCounterSkeleton />
      </Animated.View>
      
      {/* Інформаційний блок скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <InfoContentSkeleton>
          <InfoTitleSkeleton />
          <ScoreSkeleton />
          
          {/* Рядки інформації */}
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <InfoTextSkeleton style={{ width: '80px' }} />
          </InfoRowSkeleton>
          
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <InfoTextSkeleton style={{ width: '90px' }} />
          </InfoRowSkeleton>
          
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <InfoTextSkeleton style={{ width: '70px' }} />
          </InfoRowSkeleton>
          
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <InfoTextSkeleton style={{ width: '85px' }} />
          </InfoRowSkeleton>
          
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <InfoTextSkeleton style={{ width: '75px' }} />
          </InfoRowSkeleton>
          
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <InfoTextSkeleton style={{ width: '80px' }} />
          </InfoRowSkeleton>
          
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <InfoTextSkeleton style={{ width: '90px' }} />
          </InfoRowSkeleton>
          
          {/* Студія скелетон */}
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
            <StudioLogoSkeleton />
          </InfoRowSkeleton>
          
          {/* Жанри скелетон */}
          <InfoRowSkeleton>
            <InfoBoldSkeleton />
                      <GenresSkeleton>
            <GenreSkeleton style={{ width: '70px' }} />
            <GenreSkeleton style={{ width: '85px' }} />
            <GenreSkeleton style={{ width: '65px' }} />
          </GenresSkeleton>
          </InfoRowSkeleton>
        </InfoContentSkeleton>
      </Animated.View>
      
      {/* Опис скелетон */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <DescriptionContainerSkeleton>
          <DescriptionTitleSkeleton />
                  <DescriptionTextSkeleton>
          <DescriptionLineSkeleton style={{ width: '95%' }} />
          <DescriptionLineSkeleton style={{ width: '100%' }} />
          <DescriptionLineSkeleton style={{ width: '90%' }} />
          <DescriptionLineSkeleton style={{ width: '85%' }} />
          <DescriptionLineSkeleton style={{ width: '70%' }} />
        </DescriptionTextSkeleton>
          <ToggleButtonSkeleton />
        </DescriptionContainerSkeleton>
      </Animated.View>
      </Content>
    </>
  );
};

export default TopDetailSkeleton;

// --- Styled Components ---

const Content = styled.View`
  position: relative;
  padding: 0px 12px;
`;



const PosterSkeleton = styled.View`
  width: 230px;
  height: 320px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  align-self: center;
  margin-bottom: 15px;
`;

const TitleRowSkeleton = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const IconInfoSkeleton = styled.View`
  width: 20px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 4px;
  margin-top: 6px;
`;

const TitleColumnSkeleton = styled.View`
  flex-direction: column;
  gap: 8px;
  width: 94%;
`;

const TitleSkeleton = styled.View`
  width: 100%;
  height: 26px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 6px;
`;

const SubtitleSkeleton = styled.View`
  width: 100%;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 6px;
  margin-top: -4px;
`;

const ButtonsRowSkeleton = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const StatusButtonSkeleton = styled.View`
  min-width: 80px;
  height: 45px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 999px;
`;

const LikeButtonSkeleton = styled.View`
  width: 45px;
  height: 45px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 999px;
`;

const CommentButtonSkeleton = styled.View`
  min-width: 60px;
  height: 45px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 999px;
`;

const WatchButtonSkeleton = styled.View`
  flex: 1;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 999px;
  padding: 10px;
`;

const MoreButtonSkeleton = styled.View`
  width: 45px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 999px;
`;

const EpisodesCounterSkeleton = styled.View`
  width: 100%;
  height: 60px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 16px;
  margin-bottom: 15px;
`;

const InfoContentSkeleton = styled.View`
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  margin-top: 15px;
  margin-bottom: 15px;
  position: relative;
`;

const InfoTitleSkeleton = styled.View`
  width: 120px;
  height: 22px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 6px;
`;

const ScoreSkeleton = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 80px;
  height: 28px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 6px;
`;

const InfoRowSkeleton = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const InfoBoldSkeleton = styled.View`
  min-width: 60px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 4px;
`;

const InfoTextSkeleton = styled.View`
  min-width: 80px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 4px;
`;

const StudioLogoSkeleton = styled.View`
  width: 45px;
  height: 45px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 10px;
  margin-right: 8px;
`;

const GenresSkeleton = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const GenreSkeleton = styled.View`
  min-width: 60px;
  height: 28px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 8px;
  padding: 6px 12px;
`;

const DescriptionContainerSkeleton = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 12px;
  margin-top: 15px;
`;

const DescriptionTitleSkeleton = styled.View`
  width: 80px;
  height: 22px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 6px;
  margin-bottom: 12px;
`;

const DescriptionTextSkeleton = styled.View`
  gap: 8px;
`;

const DescriptionLineSkeleton = styled.View`
  width: 100%;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 4px;
`;

const ToggleButtonSkeleton = styled.View`
  align-items: center;
  margin-top: 12px;
  background-color: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: 999px;
  padding: 12px;
  height: 40px;
  width: 120px;
  align-self: center;
`;
