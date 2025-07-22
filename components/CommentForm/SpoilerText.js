import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';

const SpoilerText = ({ text, maxLines = 3 }) => {
  const { isDark } = useTheme();
  const [revealed, setRevealed] = useState(false);

  const toggleSpoiler = () => {
    setRevealed(prev => !prev);
  };

  return (
    <Wrapper activeOpacity={0.8} onPress={toggleSpoiler}>
      {revealed ? (
        <RevealedText numberOfLines={maxLines}>{text}</RevealedText>
      ) : (
        <BlurContainer>
          <TextStyled numberOfLines={maxLines}>{text}</TextStyled>
          <BlurViewStyled intensity={15} tint={isDark ? 'dark' : 'light'} />
        </BlurContainer>
      )}
    </Wrapper>
  );
};

export default SpoilerText;

const Wrapper = styled(TouchableOpacity)`
  align-self: flex-start;
  margin-top: 10px;
`;

const BlurContainer = styled.View`
  position: relative;
  padding: 8px;
  border-radius: 6px;
  overflow: hidden;
`;

const TextStyled = styled(Text)`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.text || '#000'};
`;

const BlurViewStyled = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border-radius: 6px;
`;

const RevealedText = styled(Text)`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text || '#000'};
  font-size: 14px;
  line-height: 20px;
  padding: 8px;
  border-radius: 16px;
`;
