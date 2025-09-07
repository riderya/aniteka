import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  View,
  TouchableOpacity,
  Text,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../context/ThemeContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export default function NotificationsSettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    animeUpdates: true,
    comments: true,
    social: true,
    sound: true,
    vibration: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти налаштування');
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    Alert.alert(
      'Скинути налаштування',
      'Ви впевнені, що хочете скинути всі налаштування сповіщень до значень за замовчуванням?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Скинути',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              pushNotifications: true,
              animeUpdates: true,
              comments: true,
              social: true,
              sound: true,
              vibration: true,
            };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
  };

  return (
    <Container>
      <HeaderOverlay>
        <HeaderTitleBar title="Налаштування сповіщень" />
      </HeaderOverlay>
      
      <ContentContainer>
        <ContentScroll insets={insets}>
          <Section>
            <SectionTitle>Загальні налаштування</SectionTitle>
          
            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="notifications" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Push-сповіщення</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення навіть коли додаток неактивний</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={settings.pushNotifications}
                onValueChange={() => toggleSetting('pushNotifications')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={settings.pushNotifications ? theme.colors.primary : theme.colors.textSecondary}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="volume-high" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Звук</SettingsTitle>
                  <SettingsDescription>Відтворювати звук при отриманні сповіщень</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={settings.sound}
                onValueChange={() => toggleSetting('sound')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={settings.sound ? theme.colors.primary : theme.colors.textSecondary}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="phone-portrait" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Вібрація</SettingsTitle>
                  <SettingsDescription>Вібрувати при отриманні сповіщень</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={settings.vibration}
                onValueChange={() => toggleSetting('vibration')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={settings.vibration ? theme.colors.primary : theme.colors.textSecondary}
              />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Типи сповіщень</SectionTitle>
            
            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="tv" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Оновлення аніме</SettingsTitle>
                  <SettingsDescription>Сповіщення про нові епізоди та оновлення розкладу</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={settings.animeUpdates}
                onValueChange={() => toggleSetting('animeUpdates')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={settings.animeUpdates ? theme.colors.primary : theme.colors.textSecondary}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="chatbubbles" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Коментарі</SettingsTitle>
                  <SettingsDescription>Сповіщення про нові коментарі та відповіді</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={settings.comments}
                onValueChange={() => toggleSetting('comments')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={settings.comments ? theme.colors.primary : theme.colors.textSecondary}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="people" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Соціальні</SettingsTitle>
                  <SettingsDescription>Сповіщення про підписки, лайки та інші соціальні дії</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={settings.social}
                onValueChange={() => toggleSetting('social')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={settings.social ? theme.colors.primary : theme.colors.textSecondary}
              />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Дії</SectionTitle>
            
            <SettingsItem onPress={resetSettings}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Скинути налаштування</SettingsTitle>
                  <SettingsDescription>Повернути всі налаштування до значень за замовчуванням</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </SettingsItem>

            <SettingsItem onPress={() => navigation.navigate('Notifications')}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Переглянути сповіщення</SettingsTitle>
                  <SettingsDescription>Відкрити список всіх сповіщень</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </SettingsItem>
          </Section>

          <InfoContainer>
            <InfoText>
              💡 Налаштування сповіщень зберігаються локально на вашому пристрої. 
              Для повноцінних push-сповіщень потрібен development build.
            </InfoText>
          </InfoContainer>
        </ContentScroll>
      </ContentContainer>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
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
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const SettingsDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 18px;
`;

const InfoContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  line-height: 20px;
`;
