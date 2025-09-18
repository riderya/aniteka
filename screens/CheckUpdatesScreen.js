import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  View,
  Platform,
  Linking,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';

import { useTheme } from '../context/ThemeContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { useAppUpdates } from '../hooks/useAppUpdates';
import UpdateService from '../services/UpdateService';
import UpdateModal from '../components/UpdateModal/UpdateModal';

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
    paddingTop: 120,
    paddingBottom: insets.bottom + 20,
    paddingHorizontal: 16,
  },
}))`
  flex: 1;
`;

const SectionCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const SectionText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const InfoLabel = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InfoValue = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  padding: 16px;
  align-items: center;
  margin-bottom: 12px;
  flex-direction: row;
  justify-content: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-left: 8px;
`;

const StatusCard = styled.View`
  background-color: ${({ theme, status }) => 
    status === 'success' ? theme.colors.success || '#D4EDDA' :
    status === 'warning' ? theme.colors.warning || '#FFF3CD' :
    status === 'error' ? theme.colors.error || '#F8D7DA' :
    theme.colors.card
  };
  border: 1px solid ${({ theme, status }) => 
    status === 'success' ? theme.colors.successBorder || '#C3E6CB' :
    status === 'warning' ? theme.colors.warningBorder || '#FFEAA7' :
    status === 'error' ? theme.colors.errorBorder || '#F5C6CB' :
    theme.colors.border
  };
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: flex-start;
`;

const StatusIcon = styled.View`
  margin-right: 12px;
  margin-top: 2px;
`;

const StatusText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme, status }) => 
    status === 'success' ? theme.colors.successText || '#155724' :
    status === 'warning' ? theme.colors.warningText || '#856404' :
    status === 'error' ? theme.colors.errorText || '#721C24' :
    theme.colors.text
  };
  flex: 1;
`;

const CheckUpdatesScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [updateStatus, setUpdateStatus] = useState(null);
  const [appVersion, setAppVersion] = useState('');
  const [buildVersion, setBuildVersion] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  
  const {
    isCheckingForUpdate,
    updateAvailable,
    isDownloading,
    versionInfo,
    checkForUpdates,
    downloadAndInstall,
    getVersionInfo
  } = useAppUpdates();

  useEffect(() => {
    loadAppInfo();
  }, []);

  const loadAppInfo = async () => {
    try {
      // Try to get version info, fallback to defaults if not available
      let version = 'Unknown';
      let build = 'Unknown';

      try {
        if (Application.getApplicationVersionAsync) {
          version = await Application.getApplicationVersionAsync();
        }
      } catch (e) {
        console.log('Could not get app version:', e.message);
      }

      try {
        if (Application.getApplicationBuildVersionAsync) {
          build = await Application.getApplicationBuildVersionAsync();
        }
      } catch (e) {
        console.log('Could not get build version:', e.message);
      }

      setAppVersion(version);
      setBuildVersion(build);
    } catch (error) {
      console.log('Error loading app info:', error);
      setAppVersion('Unknown');
      setBuildVersion('Unknown');
    }
  };

  const handleCheckForUpdates = async () => {
    setUpdateStatus(null);

    try {
      const update = await checkForUpdates();
      
      if (update) {
        setUpdateInfo(update);
        setUpdateStatus({
          type: 'warning',
          message: 'Доступне нове оновлення! Натисніть "Завантажити оновлення" для встановлення.'
        });
        setShowUpdateModal(true);
      } else {
        setUpdateStatus({
          type: 'success',
          message: 'Ви використовуєте найновішу версію додатку!'
        });
      }
    } catch (error) {
      setUpdateStatus({
        type: 'error',
        message: 'Помилка при перевірці оновлень. Перевірте підключення до інтернету та спробуйте знову.'
      });
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      setShowUpdateModal(false);
      const success = await downloadAndInstall();
      
      if (!success) {
        Alert.alert(
          'Помилка',
          'Не вдалося завантажити оновлення. Спробуйте пізніше.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Помилка',
        'Не вдалося завантажити оновлення. Спробуйте пізніше.'
      );
    }
  };

  const openAppStore = () => {
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/yummyanimelist' 
      : 'https://play.google.com/store/apps/details?id=com.yummyanimelist';
    
    Linking.openURL(storeUrl);
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title="Перевірити оновлення"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Перевірити оновлення"
            showBack={true}
          />
        </HeaderOverlay>
      )}
      
      <ContentContainer>
        <ContentScroll 
          insets={insets}
          showsVerticalScrollIndicator={false}
        >
          <SectionCard>
            <SectionTitle>Інформація про версію</SectionTitle>
            <InfoRow>
              <InfoLabel>Версія додатку:</InfoLabel>
              <InfoValue>{versionInfo?.currentVersion || appVersion || 'Завантаження...'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Номер збірки:</InfoLabel>
              <InfoValue>{buildVersion || 'Завантаження...'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Канал оновлень:</InfoLabel>
              <InfoValue>{versionInfo?.channel || 'default'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Платформа:</InfoLabel>
              <InfoValue>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</InfoValue>
            </InfoRow>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Перевірка оновлень</SectionTitle>
            <SectionText>
              Натисніть кнопку нижче, щоб перевірити наявність нових версій додатку.
            </SectionText>
            
            <ActionButton onPress={handleCheckForUpdates} disabled={isCheckingForUpdate}>
              <Ionicons 
                name={isCheckingForUpdate ? "sync" : "refresh-outline"} 
                size={20} 
                color="white" 
              />
              <ButtonText>
                {isCheckingForUpdate ? 'Перевірка...' : 'Перевірити оновлення'}
              </ButtonText>
            </ActionButton>
          </SectionCard>

          {updateStatus && (
            <StatusCard status={updateStatus.type}>
              <StatusIcon>
                <Ionicons 
                  name={getStatusIcon(updateStatus.type)} 
                  size={24} 
                  color={
                    updateStatus.type === 'success' ? theme.colors.successText || '#155724' :
                    updateStatus.type === 'warning' ? theme.colors.warningText || '#856404' :
                    updateStatus.type === 'error' ? theme.colors.errorText || '#721C24' :
                    theme.colors.text
                  } 
                />
              </StatusIcon>
              <StatusText status={updateStatus.type}>
                {updateStatus.message}
              </StatusText>
            </StatusCard>
          )}

          {updateStatus?.type === 'warning' && (
            <SectionCard>
              <ActionButton onPress={handleDownloadUpdate} disabled={isDownloading}>
                <Ionicons 
                  name={isDownloading ? "sync" : "download-outline"} 
                  size={20} 
                  color="white" 
                />
                <ButtonText>
                  {isDownloading ? 'Завантаження...' : 'Завантажити оновлення'}
                </ButtonText>
              </ActionButton>
            </SectionCard>
          )}

          <SectionCard>
            <SectionTitle>Магазин додатків</SectionTitle>
            <SectionText>
              Ви також можете перевірити оновлення в офіційному магазині додатків.
            </SectionText>
            
            <ActionButton onPress={openAppStore}>
              <Ionicons 
                name={Platform.OS === 'ios' ? "logo-apple" : "logo-google-playstore"} 
                size={20} 
                color="white" 
              />
              <ButtonText>
                Відкрити {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}
              </ButtonText>
            </ActionButton>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Ручна перевірка оновлень</SectionTitle>
            <SectionText>
              Оновлення перевіряються тільки вручну через цей екран. Рекомендуємо періодично перевіряти наявність нових версій для отримання покращень та виправлень помилок.
            </SectionText>
          </SectionCard>

        </ContentScroll>
      </ContentContainer>
      
      <UpdateModal
        visible={showUpdateModal}
        onUpdate={handleDownloadUpdate}
        onDismiss={() => setShowUpdateModal(false)}
        isDownloading={isDownloading}
        updateInfo={updateInfo}
      />
    </Container>
  );
};

export default CheckUpdatesScreen;
