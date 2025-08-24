import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';
import Markdown from '../Custom/MarkdownText';

const SpoilerText = ({ text, maxLines = 3 }) => {
  const { theme } = useTheme();
  const [revealed, setRevealed] = useState(false);

  const toggleSpoiler = () => {
    setRevealed(prev => !prev);
  };

  return (
    <Wrapper activeOpacity={0.8} onPress={toggleSpoiler}>
      {revealed ? (
        <RevealedContainer>
          <Markdown 
            style={{
              body: {
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
              },
              link: {
                color: theme.colors.primary,
              },
            }}
          >
            {text}
          </Markdown>
        </RevealedContainer>
      ) : (
        <SpoilerContainer>
          <HiddenText numberOfLines={maxLines}>{text}</HiddenText>
          <SpoilerOverlay>
            <SpoilerMessage>
              <SpoilerMessageLine>Цей текст може містити спойлер.</SpoilerMessageLine>
              <SpoilerMessageLineBold>Натисніть, щоб прочитати</SpoilerMessageLineBold>
            </SpoilerMessage>
          </SpoilerOverlay>
        </SpoilerContainer>
      )}
    </Wrapper>
  );
};

export default SpoilerText;

const Wrapper = styled(TouchableOpacity)`
  width: 100%;
  margin-top: 10px;
`;

const SpoilerContainer = styled.View`
  position: relative;
  padding: 8px;
  border-radius: 6px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const HiddenText = styled(Text)`
  font-size: 14px;
  line-height: 20px;
  color: transparent;
`;

const SpoilerOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  justify-content: center;
  align-items: center;
  border-radius: 6px;
`;

const SpoilerMessage = styled.View`
  align-items: center;
  padding: 8px;
`;

const SpoilerMessageLine = styled(Text)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  font-style: italic;
`;

const SpoilerMessageLineBold = styled(Text)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  font-weight: bold;
`;

const RevealedContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 8px;
  border-radius: 16px;
`;
