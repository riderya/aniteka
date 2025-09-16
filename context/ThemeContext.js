import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import styled, { ThemeProvider } from 'styled-components/native';
import { Appearance } from 'react-native';
import { lightThemeColors, darkThemeColors } from './themeColors';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext();

export const AppThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme?.() || 'light');
  const [primaryColorIndex, setPrimaryColorIndex] = useState(0); // зберігаємо індекс кольору

  // Завантажуємо збережені налаштування при ініціалізації
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedMode = await SecureStore.getItemAsync('theme_mode');
        const savedIsDark = await SecureStore.getItemAsync('theme_is_dark');
        const savedColorIndex = await SecureStore.getItemAsync('theme_color_index');
        
        if (savedMode) {
          setThemeMode(savedMode);
        } else if (savedIsDark !== null) {
          // fallback зі старого ключа
          setThemeMode(savedIsDark === 'true' ? 'dark' : 'light');
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

  // Слухаємо зміну системної теми
  useEffect(() => {
    const subscription = Appearance.addChangeListener?.(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => {
      if (subscription && subscription.remove) subscription.remove();
    };
  }, []);

  const isDark = (themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark');

  // Палітри мають однакову довжину, щоб індекси збігались між темами
  const lightColors = [
    '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5',
    '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342', '#C0CA33',
    '#FDD835', '#FFB300', '#FB8C00', '#F4511E', '#6D4C41', '#9B5571',
    '#000000'
  ];
  const darkColors = [
    '#FF6F6F', '#FF66A3', '#C084E4', '#9F8CFF', '#7C8CFF', '#66B2FF',
    '#33CCFF', '#26DAD1', '#4DD0AE', '#81C784', '#AED581', '#DCE775',
    '#FFE066', '#FFCA66', '#FF9E66', '#FF7A66', '#BCAAA4', '#FF6FA5',
    '#FFFFFF'
  ];

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
      mode: themeMode,
    };
  }, [isDark, primaryColorIndex, themeMode]);

  const setMode = async (mode) => {
    setThemeMode(mode);
    try {
      await SecureStore.setItemAsync('theme_mode', mode);
    } catch (error) {
      console.log('Помилка збереження режиму теми:', error);
    }
  };

  // Цикл: light -> dark -> system -> light
  const toggleTheme = async () => {
    const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    await setMode(nextMode);
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
    themeMode,
    setThemeMode: setMode,
    changePrimaryColor,
    primaryColorIndex
  }), [theme, isDark, primaryColorIndex, themeMode]);

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
