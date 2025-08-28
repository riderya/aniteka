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

const CommentCardSkeleton = () => {
  const shimmerValue = useSharedValue(0);
  
  // Генеруємо випадкові значення для варіативності
  const textLines = React.useMemo(() => {
    const lines = [100, 95, 85, 70, 60, 45];
    return lines.slice(0, Math.floor(Math.random() * 4) + 3); // 3-6 рядків
  }, []);



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
      [-400, 400]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <CommentCardWrapper>
      <RowInfo>
        <SkeletonAvatar>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonAvatar>
        <CommentBody>
          <RowInfoTitle>
            <SkeletonUsername>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonUsername>
            <SkeletonDateText>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonDateText>
          </RowInfoTitle>

          {/* Текст коментаря - варіативна кількість рядків */}
          {textLines.map((width, index) => (
            <SkeletonCommentText key={index} style={{ width: `${width}%` }}>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonCommentText>
          ))}

          <RowSpaceBeetwin>
            <SkeletonReplyText>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonReplyText>
            <RowLike>
              <SkeletonVoteButton>
                <ShimmerGradient style={shimmerStyle} />
              </SkeletonVoteButton>
              <SkeletonVoteScore>
                <ShimmerGradient style={shimmerStyle} />
              </SkeletonVoteScore>
              <SkeletonVoteButton>
                <ShimmerGradient style={shimmerStyle} />
              </SkeletonVoteButton>
            </RowLike>
          </RowSpaceBeetwin>
        </CommentBody>
      </RowInfo>
      

    </CommentCardWrapper>
  );
};

export default CommentCardSkeleton;

// --- Styled Components ---

const CommentCardWrapper = styled.View`
  margin: 12px;
`;

const RowInfo = styled.View`
  flex-direction: row;
`;

const SkeletonAvatar = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 999px;
  margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  overflow: hidden;
`;

const CommentBody = styled.View`
  flex: 1;
`;

const RowInfoTitle = styled.View`
  flex-direction: row;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
`;

const SkeletonUsername = styled.View`
  width: 120px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonDateText = styled.View`
  width: 90px;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonCommentText = styled.View`
  width: 100%;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-top: 6px;
  overflow: hidden;
`;

const RowSpaceBeetwin = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const SkeletonReplyText = styled.View`
  width: 70px;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const RowLike = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const SkeletonVoteButton = styled.View`
  width: 22px;
  height: 22px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonVoteScore = styled.View`
  width: 24px;
  height: 16px;
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
  background-color: ${({ theme }) => theme.colors.border}60;
  opacity: 0.6;
`;
