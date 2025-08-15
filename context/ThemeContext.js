import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import styled, { ThemeProvider } from 'styled-components/native';
import { lightThemeColors, darkThemeColors } from './themeColors';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext();

export const AppThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [primaryColorIndex, setPrimaryColorIndex] = useState(0); // зберігаємо індекс кольору

  // Завантажуємо збережені налаштування при ініціалізації
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedIsDark = await SecureStore.getItemAsync('theme_is_dark');
        const savedColorIndex = await SecureStore.getItemAsync('theme_color_index');
        
        if (savedIsDark !== null) {
          setIsDark(savedIsDark === 'true');
        }
        if (savedColorIndex !== null) {
          setPrimaryColorIndex(parseInt(savedColorIndex));
        }
      } catch (error) {
        console.log('Помилка завантаження налаштувань теми:', error);
      }
    };

    loadThemeSettings();
  }, []);

  const lightColors = ['#9A60AC', '#ff6666', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
  const darkColors = ['#C084E4', '#00E5FF', '#81C784', '#FFD54F', '#BA68C8', '#F06292'];

  // Memoize theme object to prevent unnecessary re-renders
  const theme = useMemo(() => {
    // Визначаємо actual primary колір відповідно до теми та індексу
    const primaryColor = isDark ? darkColors[primaryColorIndex] : lightColors[primaryColorIndex];
    const baseTheme = isDark ? darkThemeColors : lightThemeColors;

    return {
      colors: {
        ...baseTheme,
        primary: primaryColor,
      },
      isDark,
    };
  }, [isDark, primaryColorIndex]);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    try {
      await SecureStore.setItemAsync('theme_is_dark', newIsDark.toString());
    } catch (error) {
      console.log('Помилка збереження налаштування теми:', error);
    }
  };

  const changePrimaryColor = async (index) => {
    setPrimaryColorIndex(index);
    
    try {
      await SecureStore.setItemAsync('theme_color_index', index.toString());
    } catch (error) {
      console.log('Помилка збереження налаштування кольору:', error);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    isDark,
    changePrimaryColor,
    primaryColorIndex
  }), [theme, isDark, primaryColorIndex]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within AppThemeProvider');
  return context;
};
