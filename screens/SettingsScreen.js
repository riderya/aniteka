import React from 'react';
import styled from 'styled-components/native';
import { ThemeToggleButton } from '../components/Switchers/ThemeToggleButton';
import ColorSelector from '../components/Switchers/ColorsSwitcher';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'hikka_token';

const Container = styled.ScrollView`
  flex: 1;
  padding: 120px 24px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Button = styled.TouchableOpacity`
  margin-top: 24px;
  padding: 14px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  align-items: center;
`;

const LogoutButton = styled(Button)`
  background-color: #ff4b4b;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const SettingsScreen = () => {
  const navigation = useNavigation();

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      Alert.alert('Вихід', 'Ви успішно вийшли з облікового запису');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося вийти');
    }
  };

  return (
    <Container>
      <ThemeToggleButton />
      <ColorSelector />

      <Button onPress={goToLogin}>
        <ButtonText>Перейти до логіну</ButtonText>
      </Button>

      <LogoutButton onPress={logout}>
        <ButtonText>Вийти</ButtonText>
      </LogoutButton>
    </Container>
  );
};

export default SettingsScreen;
