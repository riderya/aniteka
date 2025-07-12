import React, { createContext, useState, useContext, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components/native';
import { lightThemeColors, darkThemeColors } from './themeColors';

const ThemeContext = createContext();

export const AppThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [primaryColorIndex, setPrimaryColorIndex] = useState(0); // зберігаємо індекс кольору

  const lightColors = ['#9A60AC', '#ff6666', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
  const darkColors = ['#C084E4', '#00E5FF', '#81C784', '#FFD54F', '#BA68C8', '#F06292'];

  // Визначаємо actual primary колір відповідно до теми та індексу
  const primaryColor = isDark ? darkColors[primaryColorIndex] : lightColors[primaryColorIndex];

  const baseTheme = isDark ? darkThemeColors : lightThemeColors;

  const theme = {
    colors: {
      ...baseTheme,
      primary: primaryColor,
    },
    isDark,
  };

  const toggleTheme = () => setIsDark((prev) => !prev);
  const changePrimaryColor = (index) => setPrimaryColorIndex(index);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, changePrimaryColor, primaryColorIndex }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within AppThemeProvider');
  return context;
};
