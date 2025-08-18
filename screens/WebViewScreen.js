import React, { useState } from 'react';
import { View, StatusBar, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import styled from 'styled-components/native';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WebViewScreen = ({ route }) => {
  const { url, title } = route.params;
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ScreenContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={title || 'Веб-сторінка'} />
      </BlurOverlay>
      
      <WebViewContainer>
        {isLoading && (
          <LoadingContainer>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </LoadingContainer>
        )}
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </WebViewContainer>
    </ScreenContainer>
  );
};

export default WebViewScreen;

// ====================== STYLES ======================

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const WebViewContainer = styled.View`
  flex: 1;
  margin-top: 60px;
  position: relative;
`;

const LoadingContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 1;
`; 