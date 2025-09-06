import React, { useState, useEffect } from 'react';
import { Modal, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styled from 'styled-components/native';

const NSFWAgeVerificationModal = ({ visible, onConfirm, onCancel }) => {
  const { theme, isDark } = useTheme();
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    checkAgeConfirmation();
  }, []);

  const checkAgeConfirmation = async () => {
    try {
      const confirmed = await AsyncStorage.getItem('nsfw_age_confirmed');
      setIsConfirmed(confirmed === 'true');
    } catch (error) {
      console.log('Error checking age confirmation:', error);
    }
  };

  const handleConfirm = async () => {
    try {
      await AsyncStorage.setItem('nsfw_age_confirmed', 'true');
      setIsConfirmed(true);
      onConfirm();
    } catch (error) {
      console.log('Error saving age confirmation:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти підтвердження');
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  // Якщо вже підтверджено, не показуємо модальне вікно
  if (isConfirmed) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <Overlay>
        <ModalContainer theme={theme}>
          <CharacterImage 
            source={require('../assets/image/hikka-logo.jpg')}
            resizeMode="contain"
          />
          
          <TitleText theme={theme}>Вікове обмеження</TitleText>
          
          <DescriptionText theme={theme}>
            Для перегляду підтвердіть, що Вам вже виповнилося 18 років
          </DescriptionText>
          
          <ButtonContainer>
            <BackButton onPress={handleCancel} theme={theme}>
              <BackButtonText theme={theme}>Назад</BackButtonText>
            </BackButton>
            
            <ConfirmButton onPress={handleConfirm} theme={theme}>
              <ConfirmButtonText>Так, мені є 18</ConfirmButtonText>
            </ConfirmButton>
          </ButtonContainer>
          
          <DisclaimerText theme={theme}>
            При натисканні на кнопку «Підтвердити» дане повідомлення більше показуватися не буде.
          </DisclaimerText>
        </ModalContainer>
      </Overlay>
    </Modal>
  );
};

export default NSFWAgeVerificationModal;

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 20px;
  padding: 28px 24px;
  width: 100%;
  max-width: 360px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.3;
  shadow-radius: 12px;
  elevation: 12;
`;

const CharacterImage = styled.Image`
  width: 140px;
  height: 140px;
  margin-bottom: 24px;
  border-radius: 70px;
`;

const TitleText = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 16px;
`;

const DescriptionText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 32px;
  line-height: 24px;
  padding-horizontal: 8px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  width: 100%;
  gap: 16px;
  margin-bottom: 20px;
`;

const BackButton = styled.TouchableOpacity`
  flex: 1;
  padding: 16px 20px;
  border-radius: 12px;
  border-width: 1.5px;
  border-color: #ff4444;
  background-color: transparent;
`;

const BackButtonText = styled.Text`
  color: #ff4444;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const ConfirmButton = styled.TouchableOpacity`
  flex: 1;
  padding: 16px 20px;
  border-radius: 12px;
  background-color: #ff4444;
`;

const ConfirmButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const DisclaimerText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary || '#888'};
  text-align: center;
  line-height: 18px;
  padding-horizontal: 4px;
`;
