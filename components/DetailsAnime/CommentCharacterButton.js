import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const CommentButtonWrapper = styled(TouchableOpacity)`
  position: absolute;
  top: ${({ top, safeAreaTop }) => (top || 0) + safeAreaTop}px;
  left: ${({ left }) => left || 'auto'};
  right: ${({ right }) => right || 12}px;
  bottom: ${({ bottom }) => bottom || 'auto'};
  z-index: 10;
  width: 45px;
  height: 45px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 24px;
`;

const CommentCount = styled(Text)`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background-color: ${({ theme }) => theme.colors.border};
  color: white;
  font-size: 11px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  text-align: center;
  line-height: 16px;
  padding-left: 3px;
  padding-right: 3px;
  overflow: hidden;
`;

const CommentCharacterButton = ({ onPress, top, left, right, bottom, commentsCount = 0 }) => {
  const { top: safeAreaTop } = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <CommentButtonWrapper
      onPress={onPress}
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      safeAreaTop={safeAreaTop}
      theme={theme}
    >
      <StyledIcon 
        name="chatbubble-ellipses-outline" 
        theme={theme}
      />
      {commentsCount > 0 && (
        <CommentCount theme={theme}>
          {commentsCount > 999 ? '999+' : commentsCount}
        </CommentCount>
      )}
    </CommentButtonWrapper>
  );
};

export default CommentCharacterButton;