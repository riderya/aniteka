import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const ToggleButton = styled.TouchableOpacity`
  padding: 16px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ToggleButtonText = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 16px;
  margin-left: 8px;
`;

const ThemeIcon = styled.View`
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <ToggleButton onPress={toggleTheme} activeOpacity={0.8}>
      <ThemeIcon>
        <Ionicons 
          name={isDark ? 'sunny' : 'moon'} 
          size={20} 
          color="white" 
        />
      </ThemeIcon>
      <ToggleButtonText>
        {isDark ? 'Світла тема' : 'Темна тема'}
      </ToggleButtonText>
    </ToggleButton>
  );
};
