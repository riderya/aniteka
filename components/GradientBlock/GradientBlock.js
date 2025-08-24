import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const StyledGradient = styled(LinearGradient)`
  height: 100%;
  width: 100%;
  position: absolute;
  bottom: 0;
  z-index: 1;
`;

const GradientBlock = () => {
  const { isDark, theme } = useTheme();

  const colors = isDark
    ? [theme.colors.background, `${theme.colors.background}`, `${theme.colors.background}E6`, `${theme.colors.background}CC`, `${theme.colors.background}66`, 'transparent'] // Темна тема
    : [theme.colors.background, `${theme.colors.background}`, `${theme.colors.background}E6`, `${theme.colors.background}CC`, `${theme.colors.background}66`, 'transparent']; // Світла тема

  return (
    <StyledGradient
      colors={colors}
      locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
    />
  );
};

export default GradientBlock;
