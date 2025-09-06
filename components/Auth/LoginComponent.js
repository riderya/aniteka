import React, { useState, useEffect } from 'react';
import {
  Text, Alert, ActivityIndicator, Image, View
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import HIKKA_SCOPES from '../../screens/auth/hikkaScopes';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = 'e31c506b-5841-4ac4-b2ba-ed900a558617';
const CLIENT_SECRET = 'qRDNu2OQw9FrQW_d3ZsSk50INm5ZmPFPB-09mbyVOpuMcUAyDIRchgz9XK69GBFLQIKXbcNSsRACcTTPQYvTJeOZX5BNps5Qn6LmFATtN5Wj8VLOxR2Bx_y5O-T00kdm';
const REDIRECT_URI = 'aniteka://';

export default function LoginComponent({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login, logout, token, userData, isAuthenticated } = useAuth();

  // Якщо користувач вже авторизований, не показуємо компонент
  if (isAuthenticated && userData) {
    return null;
  }

  // Видаляємо Linking.addEventListener, оскільки WebBrowser.openAuthSessionAsync сам обробляє redirect
  // useEffect(() => {
  //   const subscription = Linking.addEventListener('url', (event) => {
  //     console.log('Linking URL received:', event.url);
  //     const { queryParams } = Linking.parse(event.url);
  //     console.log('Parsed query params:', queryParams);
      
  //     if (queryParams?.reference && !loading) {
  //       console.log('Processing token exchange with reference:', queryParams.reference);
  //       handleTokenExchange(queryParams.reference);
  //     }
  //   });

  //   return () => {
  //     subscription?.remove();
  //   };
  // }, [loading]);

  // Автоматично приховуємо компонент, коли користувач вже авторизований
  useEffect(() => {
    if (isAuthenticated && userData && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, userData, onLoginSuccess, token]);

  // Логуємо зміни в стані аутентифікації
  useEffect(() => {
    console.log('LoginComponent: Auth state changed:', { 
      isAuthenticated, 
      hasUserData: !!userData, 
      hasToken: !!token,
      username: userData?.username 
    });
  }, [isAuthenticated, userData, token]);

  const handleLogin = async () => {
    if (loading) return; // Prevent multiple login attempts
    
    const scope = HIKKA_SCOPES.join(',');
    const authUrl = `https://hikka.io/oauth?reference=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    console.log('Starting login process with URL:', authUrl);
    setLoading(true);

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
      console.log('WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        console.log('Success URL:', result.url);
        const { queryParams } = Linking.parse(result.url);
        console.log('Parsed query params from success URL:', queryParams);
        const requestReference = queryParams?.reference;

        if (!requestReference) {
          console.log('No request reference found in URL');
          setLoading(false);
          return;
        }

        // Використовуємо handleTokenExchange для обробки токена
        console.log('Calling handleTokenExchange with reference:', requestReference);
        await handleTokenExchange(requestReference);
      } else if (result.type === 'cancel') {
        console.log('User cancelled authorization');
      } else if (result.type === 'dismiss') {
        console.log('User dismissed the browser');
      } else {
        console.log('Unexpected result type:', result.type, 'Result:', result);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenExchange = async (requestReference) => {
    try {
      console.log('handleTokenExchange called with reference:', requestReference);
      
      if (!requestReference) {
        console.error('No request reference provided to handleTokenExchange');
        return;
      }

      const response = await fetch('https://api.hikka.io/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_reference: requestReference,
          client_secret: CLIENT_SECRET,
        }),
      });

      console.log('Token exchange response status:', response.status);
      
      if (!response.ok) {
        console.error('Token exchange failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return;
      }

      const data = await response.json();
      console.log('Token exchange response data:', data);

      if (data.secret) {
        console.log('Token exchange successful, calling login function');
        await login(data.secret);
        if (onLoginSuccess) {
          console.log('Calling onLoginSuccess callback');
          onLoginSuccess();
        }
      } else {
        console.log('No secret in token exchange response:', data);
      }
    } catch (error) {
      console.error('Token exchange error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Після виходу компонент автоматично перерендериться і покаже форму логіну
    } catch (error) {
    }
  };

  return (
    <Container>
      <GradientContainer
        insets={insets}
        colors={[theme.colors.primary, theme.colors.primary, theme.colors.background]}
        locations={[0, 0, 0.5]}
        start={[0, 0]}
        end={[0, 1]}
      >
        <ContentContainer>
          <Image
            source={require('../../assets/image/welcome-login.webp')}
            style={{ width: 180, height: 180, resizeMode: 'contain' }}
          />
          <Title>Ласкаво просимо до YummyAnimeList!</Title>
          <Description>🎌 Авторизуйтесь, щоб отримати повний доступ до функцій додатка.</Description>
          {isAuthenticated && userData && (
            <StatusText>✅ Ви вже авторизовані як {userData.username}! Натисніть кнопку для повторної авторизації.</StatusText>
          )}
          <Button onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.colors.background} /> : <ButtonText>Увійти</ButtonText>}
          </Button>
          {isAuthenticated && (
            <LogoutButton onPress={handleLogout} disabled={loading}>
              <LogoutButtonText>Вийти з системи</LogoutButtonText>
            </LogoutButton>
          )}

        <BottomContainer insets={insets}>
          <PartnerRow>
            <LogoImage source={require('../../assets/image/logo.png')} />
            <Handshake>🤝</Handshake>
            <LogoImage source={require('../../assets/image/hikka-logo.jpg')} />
          </PartnerRow>
        </BottomContainer>
        </ContentContainer> 
      </GradientContainer>
    </Container>
  );
}

const Container = styled.View`flex: 1;`;
const GradientContainer = styled(LinearGradient)`
  flex: 1;
  padding-top: ${({ insets }) => insets.top}px;
  padding-bottom: ${({ insets }) => insets.bottom}px;
`;
const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;
const BottomContainer = styled.View`
  margin-top: 50px;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-top: 16px;
`;
const Description = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  text-align: center;
  margin: 12px 0 24px;
`;
const StatusText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  text-align: center;
  margin: 8px 0 16px;
  font-weight: 500;
`;
const Button = styled.TouchableOpacity`
  width: 100%;
  height: 55px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;
const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: 18px;
  font-weight: 600;
`;
const LogoutButton = styled.TouchableOpacity`
  width: 100%;
  height: 45px;
  border-radius: 999px;
  background-color: transparent;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-top: 12px;
`;
const LogoutButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  font-weight: 600;
`;
const PartnerRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
const LogoImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 8px;
`;
const Handshake = styled.Text`
  font-size: 24px;
`;
