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
import { useNotifications } from '../context/NotificationsContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import NotificationService from '../services/NotificationService';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export default function NotificationsSettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { expoPushToken, initializeNotifications } = useNotifications();
  
  const [settings, setSettings] = useState({
    // Загальні
    pushNotifications: true,
    sound: true,
    vibration: true,

    // Аніме
    animeUpdates: true,

    // Коментарі
    commentReply: true,
    commentMention: true,
    commentInCollection: true,
    commentInArticle: true,
    commentInWork: true,

    // Оцінки
    ratingComment: true,
    ratingCollection: true,
    ratingArticle: true,

    // Правки
    editAccepted: true,
    editRejected: true,

    // Користувачі
    userSubscribe: true,
    userLike: true,

    // Інше
    systemUpdates: true,
  });
  const [permissionStatus, setPermissionStatus] = useState(null);
  const isPermissionGranted = permissionStatus === true;

  useEffect(() => {
    loadSettings();
    // Перевіряємо дозвіл при завантаженні
    checkPermissionStatus();
    
    // Періодично перевіряємо статус дозволу
    const interval = setInterval(checkPermissionStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const hasPermission = await NotificationService.checkPermissions();
      setPermissionStatus(hasPermission);
      if (!hasPermission && settings.pushNotifications) {
      }
    } catch (error) {
      console.error('Помилка перевірки дозволу:', error);
      setPermissionStatus(false);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await NotificationService.getNotificationSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const success = await NotificationService.saveNotificationSettings(newSettings);
      if (success) {
        setSettings(newSettings);
      } else {
        Alert.alert('Помилка', 'Не вдалося зберегти налаштування');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти налаштування');
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      setPermissionStatus(hasPermission);
      if (hasPermission) {
        Alert.alert(
          'Дозвіл надано!',
          'Тепер ви будете отримувати пуш-повідомлення.',
          [{ text: 'OK' }]
        );
        // Перезапускаємо ініціалізацію для отримання токену
        await initializeNotifications();
      } else {
        Alert.alert(
          'Дозвіл відхилено',
          'Для отримання пуш-повідомлень потрібен дозвіл. Ви можете увімкнути його в налаштуваннях пристрою.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Помилка запиту дозволу:', error);
      setPermissionStatus(false);
      Alert.alert('Помилка', 'Не вдалося запитати дозвіл на сповіщення.');
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    
    // Якщо увімкнюємо пуш-повідомлення і дозволу немає, запитуємо його
    if (key === 'pushNotifications' && newSettings.pushNotifications && !expoPushToken) {
      const hasPermission = await NotificationService.requestPermissions();
      setPermissionStatus(hasPermission);
      if (!hasPermission) {
        // Якщо дозвіл не надано, не змінюємо налаштування
        Alert.alert(
          'Дозвіл потрібен',
          'Для увімкнення пуш-повідомлень потрібен дозвіл. Ви можете надати його пізніше.',
          [{ text: 'OK' }]
        );
        return;
      } else {
        // Якщо дозвіл надано, перезапускаємо ініціалізацію
        await initializeNotifications();
      }
    }
    
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
              sound: true,
              vibration: true,
              animeUpdates: true,
              commentReply: true,
              commentMention: true,
              commentInCollection: true,
              commentInArticle: true,
              commentInWork: true,
              ratingComment: true,
              ratingCollection: true,
              ratingArticle: true,
              editAccepted: true,
              editRejected: true,
              userSubscribe: true,
              userLike: true,
              systemUpdates: true,
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
                value={isPermissionGranted ? settings.pushNotifications : false}
                onValueChange={() => toggleSetting('pushNotifications')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.pushNotifications : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
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
                value={isPermissionGranted ? settings.sound : false}
                onValueChange={() => toggleSetting('sound')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.sound : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
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
                value={isPermissionGranted ? settings.vibration : false}
                onValueChange={() => toggleSetting('vibration')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.vibration : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

          </Section>

          <Section>
            <SectionTitle>Коментарі</SectionTitle>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="arrow-undo" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Відповідь на коментар</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли на ваш коментар відповіли</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.commentReply : false}
                onValueChange={() => toggleSetting('commentReply')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.commentReply : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="at" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Згадка в коментарі</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли вас згадали у коментарі</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.commentMention : false}
                onValueChange={() => toggleSetting('commentMention')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.commentMention : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="albums" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Коментар у колекції</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли у вашій колекції залишили коментар</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.commentInCollection : false}
                onValueChange={() => toggleSetting('commentInCollection')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.commentInCollection : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Коментар у статті</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли у вашій статті залишили коментар</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.commentInArticle : false}
                onValueChange={() => toggleSetting('commentInArticle')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.commentInArticle : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Коментар у праці</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли у вашій праці залишили коментар</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.commentInWork : false}
                onValueChange={() => toggleSetting('commentInWork')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.commentInWork : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Оцінки</SectionTitle>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="star" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Оцінка коментаря</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли ваш коментар оцінили</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.ratingComment : false}
                onValueChange={() => toggleSetting('ratingComment')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.ratingComment : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="folder" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Оцінка колекції</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли вашу колекцію оцінили</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.ratingCollection : false}
                onValueChange={() => toggleSetting('ratingCollection')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.ratingCollection : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="newspaper" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Оцінка статті</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли вашу статтю оцінили</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.ratingArticle : false}
                onValueChange={() => toggleSetting('ratingArticle')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.ratingArticle : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Правки</SectionTitle>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="checkmark-done" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Прийнята правка</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли вашу правку прийнято</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.editAccepted : false}
                onValueChange={() => toggleSetting('editAccepted')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.editAccepted : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="close-circle" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Відхилена правка</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли вашу правку відхилено</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.editRejected : false}
                onValueChange={() => toggleSetting('editRejected')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.editRejected : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Аніме</SectionTitle>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="tv" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Оновлення аніме</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення про вихід нових епізодів</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.animeUpdates : false}
                onValueChange={() => toggleSetting('animeUpdates')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.animeUpdates : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Користувачі</SectionTitle>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="person-add" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Підписка на користувача</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення, коли хтось підписався на вас</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.userSubscribe : false}
                onValueChange={() => toggleSetting('userSubscribe')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.userSubscribe : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="heart" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Вподобання</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення про нові вподобання</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.userLike : false}
                onValueChange={() => toggleSetting('userLike')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.userLike : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
              />
            </SettingsItem>
          </Section>

          <Section>
            <SectionTitle>Інше</SectionTitle>

            <SettingsItem>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="notifications" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Системні сповіщення</SettingsTitle>
                  <SettingsDescription>Отримувати сповіщення про системні зміни</SettingsDescription>
                </SettingsText>
              </SettingsItemLeft>
              <Switch
                value={isPermissionGranted ? settings.systemUpdates : false}
                onValueChange={() => toggleSetting('systemUpdates')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={(isPermissionGranted ? settings.systemUpdates : false) ? theme.colors.primary : theme.colors.textSecondary}
                disabled={!isPermissionGranted}
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

            <SettingsItem onPress={requestNotificationPermission}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Запитати дозвіл на сповіщення</SettingsTitle>
                  <StatusRow>
                    <Ionicons
                      name={
                        permissionStatus === true
                          ? 'checkmark-circle'
                          : permissionStatus === false
                          ? 'close-circle'
                          : 'time-outline'
                      }
                      size={16}
                      color={
                        permissionStatus === true
                          ? theme.colors.primary
                          : permissionStatus === false
                          ? theme.colors.textSecondary
                          : theme.colors.textSecondary
                      }
                    />
                    <StatusText>
                      {permissionStatus === true
                        ? 'Дозвіл надано'
                        : permissionStatus === false
                        ? 'Потрібен дозвіл для пуш-повідомлень'
                        : 'Перевірка статусу...'}
                    </StatusText>
                  </StatusRow>
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

          {/* Info banner removed per request */}
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

const StatusRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatusText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-left: 6px;
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
