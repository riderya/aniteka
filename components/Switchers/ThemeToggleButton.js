import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const ToggleButton = styled.TouchableOpacity`
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  border: 1px solid ${({ theme }) => theme.colors.primary}40;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  min-width: 100px;
`;

const ToggleButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
  margin-left: 6px;
`;

const ThemeIcon = styled.View`
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
`;

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme, theme, themeMode } = useTheme();

  return (
    <ToggleButton onPress={toggleTheme} activeOpacity={0.8}>
      <ThemeIcon>
        <Ionicons 
          name={themeMode === 'system' ? 'contrast' : (isDark ? 'moon' : 'sunny')} 
          size={14} 
          color={theme.colors.primary} 
        />
      </ThemeIcon>
      <ToggleButtonText>
        {themeMode === 'system' ? 'Системна' : (isDark ? 'Темна' : 'Світла')}
      </ToggleButtonText>
    </ToggleButton>
  );
};
