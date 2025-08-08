import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate
} from 'react-native-reanimated';

const LatestCommentsSkeleton = ({ showIndex = false }) => {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const renderSkeletonCard = (index) => (
    <SkeletonCardContainer key={index}>
      {showIndex && (
        <SkeletonCommentIndex>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonCommentIndex>
      )}
      <SkeletonCard>
        <SkeletonRow>
          <SkeletonAvatar>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonAvatar>
          <View>
            <SkeletonUsername>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonUsername>
            <SkeletonTimestamp>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonTimestamp>
          </View>
        </SkeletonRow>

        <SkeletonCommentText>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonCommentText>
        <SkeletonCommentText style={{ width: '80%' }}>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonCommentText>

        <SkeletonTagsRow>
          <SkeletonTypeTag>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonTypeTag>
          <SkeletonLinkTag>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonLinkTag>
        </SkeletonTagsRow>
      </SkeletonCard>
    </SkeletonCardContainer>
  );

  return (
    <Container>
      <Column>
        {[0, 1, 2, 3, 4].map(renderSkeletonCard)}
      </Column>
    </Container>
  );
};

export default LatestCommentsSkeleton;

// --- Styled Components ---

const Container = styled.View`
  margin-top: 25px;
  flex-direction: column;
  padding: 0 12px;
`;

const Column = styled.View`
  flex-direction: column;
  gap: 20px;
`;

const SkeletonCardContainer = styled.View`
  position: relative;
  margin-bottom: 20px;
`;

const SkeletonCommentIndex = styled.View`
  position: absolute;
  width: 40px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  z-index: 999;
  top: -30px;
  left: -10px;
  overflow: hidden;
`;

const SkeletonCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const SkeletonRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SkeletonAvatar = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 10px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  overflow: hidden;
`;

const SkeletonUsername = styled.View`
  width: 120px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonTimestamp = styled.View`
  width: 80px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-top: 4px;
  overflow: hidden;
`;

const SkeletonCommentText = styled.View`
  width: 100%;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-top: 10px;
  overflow: hidden;
`;

const SkeletonTagsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
`;

const SkeletonTypeTag = styled.View`
  width: 80px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  overflow: hidden;
`;

const SkeletonLinkTag = styled.View`
  width: 150px;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const ShimmerGradient = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;
