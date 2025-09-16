import React, { useState } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  View,
  TouchableOpacity,
  Text,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import toastConfig from '../components/CustomToast';

import { useTheme } from '../context/ThemeContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import { useAuth } from '../context/AuthContext';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { ThemeToggleButton } from '../components/Switchers/ThemeToggleButton';
import ColorSelector from '../components/Switchers/ColorsSwitcher';

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

const CustomizationInfo = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  flex-direction: row;
  align-items: center;
`;

const CustomizationInfoIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const CustomizationInfoText = styled.View`
  flex: 1;
`;

const CustomizationInfoTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const CustomizationInfoDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const SettingsItem = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
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

const ColorSelectorContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
`;

const CustomizationScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark, themeMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const handleFontSize = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Налаштування розміру шрифту будуть доступні найближчим часом'
    });
  };

  const handleAnimations = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Налаштування анімацій будуть доступні найближчим часом'
    });
  };

  const handleLanguage = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Налаштування мови будуть доступні найближчим часом'
    });
  };

  const handleNotifications = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Налаштування сповіщень будуть доступні найближчим часом'
    });
  };

  // Перевіряємо чи користувач авторизований
  if (!isAuthenticated) {
    return (
      <Container>
        {Platform.OS === 'ios' ? (
          <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
            <HeaderTitleBar 
              title="Кастомізація"
              showBack={true}
            />
          </BlurOverlay>
        ) : (
          <HeaderOverlay>
            <HeaderTitleBar 
              title="Кастомізація"
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Ionicons name="lock-closed" size={64} color={theme.colors.textSecondary} />
              <SectionTitle style={{ textAlign: 'center', marginTop: 20 }}>
                Потрібна авторизація
              </SectionTitle>
              <Text style={{ 
                color: theme.colors.textSecondary, 
                textAlign: 'center', 
                marginTop: 8,
                paddingHorizontal: 40
              }}>
                Увійдіть в акаунт, щоб налаштувати кастомізацію додатку
              </Text>
            </View>
          </ContentScroll>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title="Кастомізація"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Кастомізація"
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
          <CustomizationInfo>
            <CustomizationInfoIcon>
              <Ionicons 
                name="color-palette" 
                size={20} 
                color={theme.colors.primary} 
              />
            </CustomizationInfoIcon>
            <CustomizationInfoText>
              <CustomizationInfoTitle>Кастомізація додатку</CustomizationInfoTitle>
              <CustomizationInfoDescription>
                Налаштуйте тему, кольори та зовнішній вигляд додатку під себе
              </CustomizationInfoDescription>
            </CustomizationInfoText>
          </CustomizationInfo>

          <Section>
            <SectionTitle>Тема додатку</SectionTitle>
            
            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name={isDark ? 'moon-outline' : 'sunny-outline'} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Темна/Світла/Системна тема</SettingsTitle>
                  <SettingsDescription>
                    {themeMode === 'system' ? 'Поточна тема: Системна' : (isDark ? 'Поточна тема: Темна' : 'Поточна тема: Світла')}
                  </SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <ThemeToggleButton />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Кольори інтерфейсу</SectionTitle>
            
            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="color-palette-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Основний колір</SettingsTitle>
                  <SettingsDescription>Оберіть улюблений колір для інтерфейсу</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
            </SettingsItem>
            
            <ColorSelectorContainer>
              <ColorSelector />
            </ColorSelectorContainer>
          </Section>

          <Section>
            <SectionTitle>Додаткові налаштування</SectionTitle>
            
            <SettingsItem onPress={handleFontSize}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="text-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Розмір шрифту</SettingsTitle>
                  <SettingsDescription>Налаштуйте розмір тексту в додатку</SettingsDescription>
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

            <SettingsItem onPress={handleAnimations}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="flash-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Анімації</SettingsTitle>
                  <SettingsDescription>Керуйте анімаціями та переходами</SettingsDescription>
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

            <SettingsItem onPress={handleLanguage}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="language-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Мова інтерфейсу</SettingsTitle>
                  <SettingsDescription>Оберіть мову для інтерфейсу додатку</SettingsDescription>
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

            <SettingsItem onPress={handleNotifications}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="notifications-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Сповіщення</SettingsTitle>
                  <SettingsDescription>Налаштуйте сповіщення та їх відображення</SettingsDescription>
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
      <Toast config={toastConfig} position="bottom" />
    </Container>
  );
};

export default CustomizationScreen;
