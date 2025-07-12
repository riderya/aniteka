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
  const { isDark } = useTheme();

  const colors = isDark
    ? ['#050505', 'transparent'] // Темна тема
    : ['#ffffff', 'transparent']; // Світла тема

  return (
    <StyledGradient
      colors={colors}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
    />
  );
};

export default GradientBlock;
