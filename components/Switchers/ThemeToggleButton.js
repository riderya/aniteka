import React from 'react';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';

const ToggleButton = styled.TouchableOpacity`
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const ToggleButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <ToggleButton onPress={toggleTheme} activeOpacity={0.8}>
      <ToggleButtonText>
        {isDark ? 'Світла тема' : 'Темна тема'}
      </ToggleButtonText>
    </ToggleButton>
  );
};
