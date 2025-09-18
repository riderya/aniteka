import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  ActivityIndicator, 
  View,
  TouchableOpacity,
  Text,
  Dimensions,
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
import LoginComponent from '../components/Auth/LoginComponent';

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

const TabListContainer = styled.View`
  flex: 1;
  padding: 0px 12px;
`;

const TabListTitle = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const TabListSubtitle = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 40px;
  text-align: center;
`;

const TabListGrid = styled.View`
  flex-direction: column;
`;

const TabCard = styled.TouchableOpacity`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px 16px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const TabCardIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const TabCardText = styled.View`
  flex: 1;
`;

const TabCardTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  margin-bottom: 4px;
`;

const TabCardDescription = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: left;
`;

const ContentScroll = styled.ScrollView.attrs(({ insets }) => ({
  contentContainerStyle: {
    paddingTop: 120,
    paddingBottom: insets.bottom + 20,
  },
}))`
  flex: 1;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 15px;
`;

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const insets = useSafeAreaInsets();
  

  // Визначаємо доступні вкладки для налаштувань додатку
  const availableTabs = [
    { 
      id: 'profile', 
      title: 'Профіль', 
      icon: 'person-outline',
      description: 'Редагування профілю та зображень'
    },
    { 
      id: 'security', 
      title: 'Безпека', 
      icon: 'shield-checkmark-outline',
      description: 'Пароль, email та безпека акаунту'
    },
    { 
      id: 'list', 
      title: 'Список', 
      icon: 'list-outline',
      description: 'Управління списком аніме'
    },
    { 
      id: 'notifications', 
      title: 'Сповіщення', 
      icon: 'notifications-outline',
      description: 'Налаштування сповіщень'
    },
    { 
      id: 'customization', 
      title: 'Кастомізація', 
      icon: 'color-palette-outline',
      description: 'Тема та кольори додатку'
    },
    { 
      id: 'copyright', 
      title: 'Правовласникам', 
      icon: 'document-text-outline',
      description: 'Інформація для правовласників контенту'
    },
    { 
      id: 'community-rules', 
      title: 'Правила спільноти', 
      icon: 'people-outline',
      description: 'Правила поведінки та використання додатку'
    },
    { 
      id: 'help', 
      title: 'Допомога', 
      icon: 'help-circle-outline',
      description: 'Питання та відповіді'
    },
    { 
      id: 'check-updates', 
      title: 'Перевірити оновлення', 
      icon: 'download-outline',
      description: 'Перевірка наявності нових версій'
    },
  ];

  const handleTabPress = (tabId) => {
    switch (tabId) {
      case 'profile':
        navigation.navigate('ProfileEdit');
        break;
      case 'security':
        navigation.navigate('SecuritySettings');
        break;
      case 'list':
        navigation.navigate('ListImport');
        break;
      case 'notifications':
        navigation.navigate('NotificationsSettings');
        break;
      case 'customization':
        navigation.navigate('Customization');
        break;
      case 'copyright':
        navigation.navigate('CopyrightHolders');
        break;
      case 'community-rules':
        navigation.navigate('CommunityRules');
        break;
      case 'help':
        navigation.navigate('Help');
        break;
      case 'check-updates':
        navigation.navigate('CheckUpdates');
        break;
      default:
        break;
    }
  };



  const renderTabList = () => (
    <TabListContainer>
      <TabListGrid>
        {availableTabs.map((tab) => (
          <TabCard
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
          >
            <TabCardIcon>
              <Ionicons 
                name={tab.icon} 
                size={24} 
                color={theme.colors.primary} 
              />
            </TabCardIcon>
            <TabCardText>
              <TabCardTitle>{tab.title}</TabCardTitle>
              <TabCardDescription>{tab.description}</TabCardDescription>
            </TabCardText>
          </TabCard>
        ))}
      </TabListGrid>
    </TabListContainer>
  );

  const renderOtherTabs = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="construct" size={64} color={theme.colors.textSecondary} />
      <SectionTitle style={{ textAlign: 'center', marginTop: 20 }}>
        Розробляється
      </SectionTitle>
    </View>
  );



  // Перевіряємо чи користувач авторизований
  if (!isAuthenticated) {
    return (
      <Container>
        {Platform.OS === 'ios' ? (
          <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
            <HeaderTitleBar 
              title="Налаштування"
              showBack={true}
            />
          </BlurOverlay>
        ) : (
          <HeaderOverlay>
            <HeaderTitleBar 
              title="Налаштування"
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
            <LoginComponent />
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
            title="Налаштування"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Налаштування"
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
          {renderTabList()}
        </ContentScroll>
      </ContentContainer>
      <Toast config={toastConfig} position="bottom" />
    </Container>
  );
};

export default SettingsScreen;
