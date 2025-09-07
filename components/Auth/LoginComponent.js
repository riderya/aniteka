import React, { useState, useEffect } from 'react';
import {
  Text, ActivityIndicator, Image, View, Platform
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { openURL } from 'expo-linking';
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
  const [lastError, setLastError] = useState(null);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login, logout, token, userData, isAuthenticated } = useAuth();

  // Якщо користувач вже авторизований, не показуємо компонент
  if (isAuthenticated && userData) {
    return null;
  }


  // Автоматично приховуємо компонент, коли користувач вже авторизований
  useEffect(() => {
    if (isAuthenticated && userData && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, userData, onLoginSuccess, token]);

  // Обробка deep links для зовнішнього браузера
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      const { queryParams } = Linking.parse(event.url);
      
      if (queryParams?.reference && !loading) {
        handleTokenExchange(queryParams.reference);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [loading]);



  const handleExternalBrowserLogin = async () => {
    if (loading) return;
    
    const scope = HIKKA_SCOPES.join(',');
    const authUrl = `https://hikka.io/oauth?reference=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    
    
    try {
      await openURL(authUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (loading) return; // Prevent multiple login attempts
    setLastError(null); // Очищуємо попередні помилки
    
    const scope = HIKKA_SCOPES.join(',');
    const authUrl = `https://hikka.io/oauth?reference=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    setLoading(true);

    // Використовуємо різні методи для різних платформ
    if (Platform.OS === 'android') {
      // На Android використовуємо зовнішній браузер
      await handleExternalBrowserLogin();
      return;
    }

    // На iOS використовуємо внутрішній браузер
    try {
      const browserOptions = {
        showTitle: false,
        enableBarCollapsing: false,
        showInRecents: false,
        // Налаштування для iOS
        preferredBarTintColor: '#000000',
        preferredControlTintColor: '#ffffff',
      };

      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI, browserOptions);

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const requestReference = queryParams?.reference;

        if (!requestReference) {
          setLoading(false);
          return;
        }

        // Використовуємо handleTokenExchange для обробки токена
        await handleTokenExchange(requestReference);
      } else if (result.type === 'cancel') {
        console.log('Авторизацію скасовано');
      } else if (result.type === 'dismiss') {
        console.log('Авторизацію скасовано');
      } else {
        console.log('Помилка авторизації');
      }
    } catch (error) {
      console.log('Помилка авторизації:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenExchange = async (requestReference) => {
    try {
      if (!requestReference) {
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

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.secret) {
        await login(data.secret);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
      }
    } catch (error) {
      console.log('Помилка обробки токена:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
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
          <Title>Ласкаво просимо до Aniteka!</Title>
          <Description>🎌 Авторизуйтесь, щоб отримати повний доступ до функцій додатка.</Description>
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
`;
const Description = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  text-align: center;
  margin: 12px 0 24px;
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
