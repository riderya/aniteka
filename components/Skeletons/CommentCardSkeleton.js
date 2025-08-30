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

const CommentCardSkeleton = ({ showIndex = false, showOriginalComment = false }) => {
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

  const renderSkeletonCard = (index) => {
    // Генеруємо випадкові значення для варіативності
    const textLines = React.useMemo(() => {
      const lines = [100, 90, 75, 60, 45, 30];
      return lines.slice(0, Math.floor(Math.random() * 4) + 2); // 2-5 рядків
    }, []);

    const showReplyIndicator = React.useMemo(() => Math.random() > 0.7, []);
    const showOptimistic = React.useMemo(() => Math.random() > 0.8, []);

    return (
      <SkeletonCardContainer key={index}>
        <SkeletonCard>
          <SkeletonRowInfo>
            <SkeletonAvatar>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonAvatar>
            <SkeletonCommentBody>
              <SkeletonRowInfoTitle>
                <SkeletonUsername>
                  <ShimmerGradient style={shimmerStyle} />
                </SkeletonUsername>
                <SkeletonDateText>
                  <ShimmerGradient style={shimmerStyle} />
                </SkeletonDateText>
                {showOptimistic && (
                  <SkeletonOptimisticIndicator>
                    <ShimmerGradient style={shimmerStyle} />
                  </SkeletonOptimisticIndicator>
                )}
              </SkeletonRowInfoTitle>

              {/* Текст коментаря - варіативна кількість рядків */}
              {textLines.map((width, lineIndex) => (
                <SkeletonCommentText key={lineIndex} style={{ width: `${width}%` }}>
                  <ShimmerGradient style={shimmerStyle} />
                </SkeletonCommentText>
              ))}

              {/* Індикатор відповіді */}
              {showReplyIndicator && (
                <SkeletonReplyIndicatorContainer>
                  <SkeletonReplyLine />
                  <SkeletonReplyIndicatorText>
                    <ShimmerGradient style={shimmerStyle} />
                  </SkeletonReplyIndicatorText>
                </SkeletonReplyIndicatorContainer>
              )}

              {/* Рядок з лайками та діями */}
              <SkeletonRowSpaceBetween>
                <SkeletonRowLike>
                  <SkeletonLikeButton>
                    <ShimmerGradient style={shimmerStyle} />
                  </SkeletonLikeButton>
                  <SkeletonLikeCount>
                    <ShimmerGradient style={shimmerStyle} />
                  </SkeletonLikeCount>
                  <SkeletonDislikeButton>
                    <ShimmerGradient style={shimmerStyle} />
                  </SkeletonDislikeButton>
                </SkeletonRowLike>
                <SkeletonActionsRow>
                  <SkeletonReplyButton>
                    <ShimmerGradient style={shimmerStyle} />
                  </SkeletonReplyButton>
                  <SkeletonMoreButton>
                    <ShimmerGradient style={shimmerStyle} />
                  </SkeletonMoreButton>
                </SkeletonActionsRow>
              </SkeletonRowSpaceBetween>
            </SkeletonCommentBody>
          </SkeletonRowInfo>
        </SkeletonCard>
      </SkeletonCardContainer>
    );
  };

  const renderOriginalCommentSkeleton = () => (
    <>
      <SkeletonOriginalCommentContainer>
        <SkeletonOriginalCommentLabel>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonOriginalCommentLabel>
        <SkeletonOriginalCommentHeader>
          <SkeletonOriginalCommentAvatar>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonOriginalCommentAvatar>
          <SkeletonOriginalCommentInfo>
            <SkeletonOriginalCommentUsername>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonOriginalCommentUsername>
            <SkeletonOriginalCommentDate>
              <ShimmerGradient style={shimmerStyle} />
            </SkeletonOriginalCommentDate>
          </SkeletonOriginalCommentInfo>
        </SkeletonOriginalCommentHeader>
        <SkeletonOriginalCommentTextContainer>
          <SkeletonOriginalCommentText style={{ width: '100%' }}>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonOriginalCommentText>
          <SkeletonOriginalCommentText style={{ width: '90%' }}>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonOriginalCommentText>
          <SkeletonOriginalCommentText style={{ width: '70%' }}>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonOriginalCommentText>
        </SkeletonOriginalCommentTextContainer>
      </SkeletonOriginalCommentContainer>
      
      {/* Заголовок з кількістю */}
      <SkeletonCommentsHeader>
        <SkeletonCommentCount>
          <ShimmerGradient style={shimmerStyle} />
        </SkeletonCommentCount>
        <SkeletonSortButton>
          <SkeletonSortButtonText>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonSortButtonText>
          <SkeletonSortIcon>
            <ShimmerGradient style={shimmerStyle} />
          </SkeletonSortIcon>
        </SkeletonSortButton>
      </SkeletonCommentsHeader>
    </>
  );

  return (
    <Container>
      {showOriginalComment && renderOriginalCommentSkeleton()}
      {[0, 1, 2, 3, 4, 5].map(renderSkeletonCard)}
    </Container>
  );
};

export default CommentCardSkeleton;

// --- Styled Components ---

const Container = styled.View`
  flex-direction: column;
  padding: 0 12px;
`;

const SkeletonCardContainer = styled.View`
  margin-bottom: 12px;
`;

const SkeletonCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const SkeletonRowInfo = styled.View`
  flex-direction: row;
`;

const SkeletonAvatar = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  overflow: hidden;
`;

const SkeletonCommentBody = styled.View`
  flex: 1;
`;

const SkeletonRowInfoTitle = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
`;

const SkeletonUsername = styled.View`
  width: 120px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonDateText = styled.View`
  width: 80px;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonOptimisticIndicator = styled.View`
  width: 60px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 10px;
  overflow: hidden;
`;

const SkeletonCommentText = styled.View`
  width: 100%;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-top: 6px;
  overflow: hidden;
`;

const SkeletonReplyIndicatorContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  margin-left: 62px;
`;

const SkeletonReplyLine = styled.View`
  width: 2px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  margin-right: 8px;
  border-radius: 1px;
`;

const SkeletonReplyIndicatorText = styled.View`
  width: 100px;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonRowSpaceBetween = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const SkeletonRowLike = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const SkeletonLikeButton = styled.View`
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  overflow: hidden;
`;

const SkeletonLikeCount = styled.View`
  width: 30px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonDislikeButton = styled.View`
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  overflow: hidden;
`;

const SkeletonActionsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const SkeletonReplyButton = styled.View`
  width: 60px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  overflow: hidden;
`;

const SkeletonMoreButton = styled.View`
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
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

// Стилі для скелетону оригінального коментаря
const SkeletonOriginalCommentContainer = styled.View`
  margin: 12px;
  margin-bottom: 12px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.primary};
  opacity: 0.9;
  overflow: hidden;
`;

const SkeletonOriginalCommentLabel = styled.View`
  width: 120px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
`;

const SkeletonOriginalCommentHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const SkeletonOriginalCommentAvatar = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  margin-right: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  overflow: hidden;
`;

const SkeletonOriginalCommentInfo = styled.View`
  flex: 1;
`;

const SkeletonOriginalCommentUsername = styled.View`
  width: 100px;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-bottom: 4px;
  overflow: hidden;
`;

const SkeletonOriginalCommentDate = styled.View`
  width: 60px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonOriginalCommentTextContainer = styled.View`
  margin-top: 4px;
`;

const SkeletonOriginalCommentText = styled.View`
  width: 100%;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-bottom: 6px;
  overflow: hidden;
`;

// Стилі для заголовка
const SkeletonCommentsHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 12px;
  margin-bottom: 12px;
`;

const SkeletonCommentCount = styled.View`
  width: 80px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const SkeletonSortButton = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const SkeletonSortButtonText = styled.View`
  width: 100px;
  height: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 4px;
  margin-right: 4px;
  overflow: hidden;
`;

const SkeletonSortIcon = styled.View`
  width: 16px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 8px;
  overflow: hidden;
`;
