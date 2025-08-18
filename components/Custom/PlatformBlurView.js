import React from 'react';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';

const AndroidCardView = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
`;

export const PlatformBlurView = ({ 
  children, 
  style, 
  intensity = 50, 
  tint = "light",
  experimentalBlurMethod = "dimezisBlurView",
  ...props 
}) => {
  const { theme } = useTheme();

  // For Android, use card background color instead of blur
  if (Platform.OS === 'android') {
    return (
      <AndroidCardView style={style} {...props}>
        {children}
      </AndroidCardView>
    );
  }

  // For iOS, use blur effects
  return (
    <BlurView 
      intensity={intensity} 
      tint={tint} 
      style={style}
      experimentalBlurMethod={experimentalBlurMethod}
      {...props}
    >
      {children}
    </BlurView>
  );
};
