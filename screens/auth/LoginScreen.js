import React, { useState, useEffect } from 'react';
import {
  Text, Alert, ActivityIndicator, Image, View
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/DetailsAnime/BackButton';
import HIKKA_SCOPES from './hikkaScopes';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = 'e31c506b-5841-4ac4-b2ba-ed900a558617';
const CLIENT_SECRET = 'qRDNu2OQw9FrQW_d3ZsSk50INm5ZmPFPB-09mbyVOpuMcUAyDIRchgz9XK69GBFLQIKXbcNSsRACcTTPQYvTJeOZX5BNps5Qn6LmFATtN5Wj8VLOxR2Bx_y5O-T00kdm';
const REDIRECT_URI = 'yummyanimelist://';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login, logout, token, userData, isAuthenticated } = useAuth();

  useEffect(() => {
    // Налаштовуємо обробку deep linking
    const subscription = Linking.addEventListener('url', (event) => {
      const { queryParams } = Linking.parse(event.url);
      
      if (queryParams?.reference) {
        handleTokenExchange(queryParams.reference);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);



  const handleLogin = async () => {
    const scope = HIKKA_SCOPES.join(',');
    const authUrl = `https://hikka.io/oauth?reference=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    setLoading(true);

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const requestReference = queryParams?.reference;

        if (!requestReference) {
          Alert.alert('❌ Помилка', 'Не вдалося отримати код підтвердження. Спробуйте знову.');
          setLoading(false);
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

        const data = await response.json();

        if (response.ok && data.secret) {
          await login(data.secret);
          navigation.navigate('Tabs');
        } else {
          Alert.alert('🚫 Помилка авторизації', data.message || 'Не вдалося отримати токен.');
        }
      } else if (result.type === 'cancel') {
        // Користувач скасував авторизацію
      }
    } catch (error) {
      Alert.alert('❗ Помилка', error.message || 'Щось пішло не так. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenExchange = async (requestReference) => {
    setLoading(true);

    try {
      const response = await fetch('https://api.hikka.io/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_reference: requestReference,
          client_secret: CLIENT_SECRET,
        }),
      });

      const data = await response.json();

      if (response.ok && data.secret) {
        await login(data.secret);
        navigation.navigate('Tabs');
      } else {
        Alert.alert('🚫 Помилка авторизації', data.message || 'Не вдалося отримати токен.');
      }
    } catch (error) {
      Alert.alert('❗ Помилка', error.message || 'Щось пішло не так. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackButtonWrapper>
        <BackButton />
      </BackButtonWrapper>
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
            style={{ width: 220, height: 220, resizeMode: 'contain' }}
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
            <LogoutButton onPress={logout} disabled={loading}>
              <LogoutButtonText>Вийти з системи</LogoutButtonText>
            </LogoutButton>
          )}
        </ContentContainer>

        <BottomContainer insets={insets}>
          <PartnerRow>
            <LogoImage source={require('../../assets/image/yummyanimelist-logo.jpg')} />
            <Handshake>🤝</Handshake>
            <LogoImage source={require('../../assets/image/hikka-logo.jpg')} />
          </PartnerRow>
        </BottomContainer>
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
  padding-bottom: ${({ insets }) => insets.bottom}px;
`;
const BackButtonWrapper = styled.View`
  position: absolute;
  top: 50px;
  left: 12px;
  z-index: 1;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 26px;
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
  width: 45px;
  height: 45px;
  border-radius: 8px;
`;
const Handshake = styled.Text`
  font-size: 28px;
`;
