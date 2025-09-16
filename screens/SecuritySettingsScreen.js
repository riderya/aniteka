import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  View,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import toastConfig from '../components/CustomToast';

import { useTheme } from '../context/ThemeContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import { useAuth } from '../context/AuthContext';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(PlatformBlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background}80;
`;

const HeaderOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentScroll = styled.ScrollView.attrs(({ insets }) => ({
  contentContainerStyle: {
    padding: 12,
    paddingTop: 120,
    paddingBottom: insets.bottom + 20,
  },
}))`
  flex: 1;
`;

const Section = styled.View`
  margin-bottom: 30px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 15px;
`;

const SettingsItem = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SettingsItemLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const SettingsIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const SettingsText = styled.View`
  flex: 1;
`;

const SettingsTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const SettingsDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ArrowIcon = styled.View`
  margin-left: 8px;
`;

// Стилі для модальних вікон
const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 32px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
  text-align: center;
`;

const ModalInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

const ModalButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const ModalButton = styled.TouchableOpacity`
  flex: 1;
  padding: 14px;
  border-radius: 999px;
  align-items: center;
  margin: 0 4px;
`;

const ModalButtonCancel = styled(ModalButton)`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ModalButtonSave = styled(ModalButton)`
  background-color: ${({ theme }) => `${theme.colors.primary}20`};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const ModalButtonText = styled.Text`
  font-weight: 600;
  font-size: 16px;
`;

const ModalButtonTextCancel = styled(ModalButtonText)`
  color: ${({ theme }) => theme.colors.text};
`;

const ModalButtonTextSave = styled(ModalButtonText)`
  color: ${({ theme }) => theme.colors.primary};
`;

const SecurityInfo = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  flex-direction: row;
  align-items: center;
`;

const SecurityInfoIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const SecurityInfoText = styled.View`
  flex: 1;
`;

const SecurityInfoTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const SecurityInfoDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const SecuritySettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Стан для модальних вікон
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Стан для форм
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('hikka_token');
    } catch (err) {
      return null;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Вийти з облікового запису',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Готово',
                text2: 'Ви вийшли з облікового запису'
              });
              navigation.goBack();
            } catch (e) {
              Toast.show({
                type: 'error',
                text1: 'Помилка',
                text2: 'Не вдалося вийти'
              });
            }
          },
        },
      ]
    );
  };

  const fetchUserProfile = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleChangePassword = () => {
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const handleChangeEmail = () => {
    setEmailInput(userData?.email || '');
    setShowEmailModal(true);
  };

  const handleTwoFactorAuth = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Двофакторна автентифікація буде доступна найближчим часом'
    });
  };

  const handleLoginHistory = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Історія входів буде доступна найближчим часом'
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Видалення облікового запису',
      'Ви впевнені, що хочете видалити свій обліковий запис? Ця дія незворотна.',
      [
        {
          text: 'Скасувати',
          style: 'cancel',
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Розробляється',
              text2: 'Функція видалення облікового запису буде доступна найближчим часом'
            });
          },
        },
      ]
    );
  };

  const saveEmail = async () => {
    if (!emailInput.trim() || emailInput.trim() === userData?.email) {
      setShowEmailModal(false);
      return;
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const response = await fetch('https://api.hikka.io/settings/email', {
        method: 'PUT',
        headers: {
          auth: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput.trim()
        }),
      });

      if (response.ok) {
        setUserData(prev => ({ ...prev, email: emailInput.trim() }));
        setShowEmailModal(false);
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Email оновлено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення email');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося зберегти email'
      });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!passwordInput.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Пароль не може бути порожнім'
      });
      return;
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const response = await fetch('https://api.hikka.io/settings/password', {
        method: 'PUT',
        headers: {
          auth: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordInput
        }),
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordInput('');
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Пароль оновлено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення пароля');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося зберегти пароль'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title="Безпека"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Безпека"
            showBack={true}
          />
        </HeaderOverlay>
      )}
      <ContentContainer>
        <ContentScroll 
          insets={insets}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SecurityInfo>
            <SecurityInfoIcon>
              <Ionicons 
                name="shield-checkmark" 
                size={20} 
                color={theme.colors.primary} 
              />
            </SecurityInfoIcon>
            <SecurityInfoText>
              <SecurityInfoTitle>Безпека вашого облікового запису</SecurityInfoTitle>
              <SecurityInfoDescription>
                Керуйте паролем, email та налаштуваннями безпеки для захисту свого профілю
              </SecurityInfoDescription>
            </SecurityInfoText>
          </SecurityInfo>

          <Section>
            <SectionTitle>Основні налаштування</SectionTitle>
            
            <SettingsItem onPress={handleChangePassword}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="key-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Змінити пароль</SettingsTitle>
                  <SettingsDescription>Оновіть свій пароль для підвищення безпеки</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <ArrowIcon>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </ArrowIcon>
            </SettingsItem>

            <SettingsItem onPress={handleChangeEmail}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Змінити email</SettingsTitle>
                  <SettingsDescription>{userData?.email || 'Не встановлено'}</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <ArrowIcon>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </ArrowIcon>
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Додаткова безпека</SectionTitle>
            
            <SettingsItem onPress={handleTwoFactorAuth}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="shield-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Двофакторна автентифікація</SettingsTitle>
                  <SettingsDescription>Додатковий захист вашого облікового запису</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <ArrowIcon>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </ArrowIcon>
            </SettingsItem>

            <SettingsItem onPress={handleLoginHistory}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="time-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Історія входів</SettingsTitle>
                  <SettingsDescription>Переглянути останні входи в обліковий запис</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <ArrowIcon>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </ArrowIcon>
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Обліковий запис</SectionTitle>
            
            <SettingsItem onPress={handleLogout}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="log-out-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Вийти з облікового запису</SettingsTitle>
                  <SettingsDescription>Завершити поточну сесію</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <ArrowIcon>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </ArrowIcon>
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Небезпечні дії</SectionTitle>
            
            <SettingsItem onPress={handleDeleteAccount}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="trash-outline" 
                    size={20} 
                    color="#ff4444" 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle style={{ color: '#ff4444' }}>Видалити обліковий запис</SettingsTitle>
                  <SettingsDescription>Назавжди видалити свій обліковий запис та всі дані</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <ArrowIcon>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </ArrowIcon>
            </SettingsItem>
          </Section>
        </ContentScroll>
      </ContentContainer>
      
      {/* Модальне вікно для зміни email */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <ModalOverlay>
          <ModalContainer>
            <ModalTitle>Змінити email</ModalTitle>
            <ModalInput
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="Введіть новий email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ModalButtonRow>
              <ModalButtonCancel onPress={() => setShowEmailModal(false)}>
                <ModalButtonTextCancel>Скасувати</ModalButtonTextCancel>
              </ModalButtonCancel>
              <ModalButtonSave onPress={saveEmail} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <ModalButtonTextSave>Зберегти</ModalButtonTextSave>
                )}
              </ModalButtonSave>
            </ModalButtonRow>
          </ModalContainer>
        </ModalOverlay>
      </Modal>

      {/* Модальне вікно для зміни пароля */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ModalOverlay>
          <ModalContainer>
            <ModalTitle>Змінити пароль</ModalTitle>
            <ModalInput
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="Введіть новий пароль"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ModalButtonRow>
              <ModalButtonCancel onPress={() => setShowPasswordModal(false)}>
                <ModalButtonTextCancel>Скасувати</ModalButtonTextCancel>
              </ModalButtonCancel>
              <ModalButtonSave onPress={savePassword} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <ModalButtonTextSave>Зберегти</ModalButtonTextSave>
                )}
              </ModalButtonSave>
            </ModalButtonRow>
          </ModalContainer>
        </ModalOverlay>
      </Modal>

      <Toast config={toastConfig} position="bottom" />
    </Container>
  );
};

export default SecuritySettingsScreen;
