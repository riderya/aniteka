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
import BackButton from '../../components/DetailsAnime/BackButton';
import HIKKA_SCOPES from './hikkaScopes';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = '55d85f78-487b-4915-8614-b8f6df4a6245';
const CLIENT_SECRET = 'EPM2WO2I-o816nQNRnEwQbqlElnd46bb-BqUnuwbEe6fnkfLoC3O159gt4g-Vcei1Jr3s4rzw_NAD_YcvlNJpDRz5dtR2nUDbvZF2JZDxmqKlsb9U_jhKYhItN5BcJIq';
const REDIRECT_URI = 'exp+yummyanimelist://expo-development-client/';
const TOKEN_KEY = 'hikka_token';
const USER_REFERENCE_KEY = 'hikka_user_reference';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const savedRef = await SecureStore.getItemAsync(USER_REFERENCE_KEY);
      console.log('Loaded token:', savedToken);
      console.log('Loaded user reference:', savedRef);

      if (savedToken) {
        setToken(savedToken);
        fetchUserData(savedToken);
      }
    })();
  }, []);

  async function saveToken(newToken) {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    console.log('Saved new token:', newToken);
    setToken(newToken);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_REFERENCE_KEY);
    setToken(null);
    setUserData(null);
    Alert.alert('🚪 Вихід', 'Ви успішно вийшли з облікового запису.');
  }

  async function fetchUserData(accessToken) {
    try {
      setLoading(true);
      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: accessToken },
      });

      const text = await response.text();
      if (!response.ok) throw new Error(`Помилка ${response.status}: ${text}`);

      const data = JSON.parse(text);
      console.log('User data fetched:', data);
      setUserData(data);

      if (data.reference) {
        await SecureStore.setItemAsync(USER_REFERENCE_KEY, data.reference);
        console.log('Saved user reference:', data.reference);
      }
    } catch (error) {
      Alert.alert('⚠️ Помилка', error.message || 'Не вдалося отримати дані користувача.');
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async () => {
    const scope = HIKKA_SCOPES.join(',');
    const authUrl = `https://hikka.io/oauth?reference=${CLIENT_ID}&scope=${encodeURIComponent(scope)}`;

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
          await saveToken(data.secret);
          await fetchUserData(data.secret);
          navigation.navigate('Tabs');
        } else {
          Alert.alert('🚫 Помилка авторизації', data.message || 'Не вдалося отримати токен.');
        }
      } else if (result.type === 'cancel') {
        Alert.alert('❎ Скасовано', 'Ви скасували вхід у систему.');
      } else {
        Alert.alert('⚠️ Невідомий результат', 'Щось пішло не так...');
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
          <Button onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.colors.background} /> : <ButtonText>Увійти</ButtonText>}
          </Button>
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
