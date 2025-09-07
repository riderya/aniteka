import React, { useState } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  View,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
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

const ListImportInfo = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  flex-direction: row;
  align-items: center;
`;

const ListImportInfoIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const ListImportInfoText = styled.View`
  flex: 1;
`;

const ListImportInfoTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const ListImportInfoDescription = styled.Text`
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

const FileUploadContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 12px;
  align-items: center;
  justify-content: center;
  min-height: 120px;
`;

const FileUploadIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const FileUploadText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  text-align: center;
`;

const FileUploadSubtext = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
`;

const FileUploadHint = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  text-align: center;
  font-style: italic;
`;

const SelectedFileContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

const SelectedFileIcon = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const SelectedFileText = styled.View`
  flex: 1;
`;

const SelectedFileName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
`;

const SelectedFileSize = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

const RemoveFileButton = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #ff4444;
  align-items: center;
  justify-content: center;
`;

const SwitchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
`;

const SwitchText = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const SwitchTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const SwitchDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ImportButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const ImportButtonText = styled.Text`
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
`;

const ListImportScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedFile, setSelectedFile] = useState(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleFilePicker = async () => {
    try {
      // Поки що показуємо повідомлення про розробку
      // В майбутньому тут буде реалізовано вибір файлу
      Toast.show({
        type: 'info',
        text1: 'Розробляється',
        text2: 'Функція вибору файлу буде доступна найближчим часом'
      });
      
      // Симуляція вибору файлу для демонстрації
      setSelectedFile({
        name: 'myanimelist_export.xml',
        size: 1024 * 50, // 50KB
        uri: 'file://example.xml',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося вибрати файл'
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Спочатку виберіть файл для імпорту'
      });
      return;
    }

    setImporting(true);
    
    try {
      // Тут буде логіка імпорту файлу
      // Поки що симулюємо процес
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Toast.show({
        type: 'success',
        text1: 'Успішно',
        text2: 'Список аніме успішно імпортовано'
      });
      
      setSelectedFile(null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося імпортувати список'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleAniListImport = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Імпорт з AniList буде доступний найближчим часом'
    });
  };

  const handleMyAnimeListImport = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Імпорт з MyAnimeList буде доступний найближчим часом'
    });
  };

  const handleShikimoriImport = () => {
    Toast.show({
      type: 'info',
      text1: 'Розробляється',
      text2: 'Імпорт з Shikimori буде доступний найближчим часом'
    });
  };


  // Перевіряємо чи користувач авторизований
  if (!isAuthenticated) {
    return (
      <Container>
        {Platform.OS === 'ios' ? (
          <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
            <HeaderTitleBar 
              title="Імпорт аніме"
              showBack={true}
            />
          </BlurOverlay>
        ) : (
          <HeaderOverlay>
            <HeaderTitleBar 
              title="Імпорт аніме"
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
                Увійдіть в акаунт, щоб імпортувати свій список аніме
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
            title="Імпорт аніме"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Імпорт аніме"
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
          <ListImportInfo>
            <ListImportInfoIcon>
              <Ionicons 
                name="list" 
                size={20} 
                color={theme.colors.primary} 
              />
            </ListImportInfoIcon>
            <ListImportInfoText>
              <ListImportInfoTitle>Імпорт списку аніме</ListImportInfoTitle>
              <ListImportInfoDescription>
                Імпортуйте свій список аніме з інших сервісів
              </ListImportInfoDescription>
            </ListImportInfoText>
          </ListImportInfo>

          <Section>
            <SectionTitle>Імпорт аніме</SectionTitle>
            
            <SettingsItem onPress={handleAniListImport}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="globe-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>AniList</SettingsTitle>
                  <SettingsDescription>Імпорт з AniList акаунту</SettingsDescription>
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

            <SettingsItem onPress={handleMyAnimeListImport}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="globe-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>MyAnimeList</SettingsTitle>
                  <SettingsDescription>Імпорт з MyAnimeList акаунту</SettingsDescription>
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

            <SettingsItem onPress={handleShikimoriImport}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="globe-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Shikimori</SettingsTitle>
                  <SettingsDescription>Імпорт з Shikimori акаунту</SettingsDescription>
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
            <SectionTitle>Файл списку</SectionTitle>
            
            {selectedFile ? (
              <SelectedFileContainer>
                <SelectedFileIcon>
                  <Ionicons 
                    name="document-text" 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                </SelectedFileIcon>
                <SelectedFileText>
                  <SelectedFileName>{selectedFile.name}</SelectedFileName>
                  <SelectedFileSize>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </SelectedFileSize>
                </SelectedFileText>
                <RemoveFileButton onPress={handleRemoveFile}>
                  <Ionicons name="close" size={12} color="#ffffff" />
                </RemoveFileButton>
              </SelectedFileContainer>
            ) : (
              <FileUploadContainer onPress={handleFilePicker}>
                <FileUploadIcon>
                  <Ionicons 
                    name="cloud-upload-outline" 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </FileUploadIcon>
                <FileUploadText>Файл не вибрано</FileUploadText>
                <FileUploadSubtext>
                  Перетягніть сюди .XML файл, або натисніть, щоб завантажити
                </FileUploadSubtext>
                <FileUploadHint>
                  Ви можете імпортувати свій список з MyAnimeList або Shikimori
                </FileUploadHint>
              </FileUploadContainer>
            )}

            <SwitchContainer>
              <SwitchText>
                <SwitchTitle>Переписати аніме</SwitchTitle>
                <SwitchDescription>
                  Переписати аніме, які вже додані до списку
                </SwitchDescription>
              </SwitchText>
              <Switch
                value={overwriteExisting}
                onValueChange={setOverwriteExisting}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={overwriteExisting ? '#ffffff' : theme.colors.textSecondary}
              />
            </SwitchContainer>

            <ImportButton 
              onPress={handleImport} 
              disabled={!selectedFile || importing}
            >
              <ImportButtonText>
                {importing ? 'Імпортування...' : 'Імпортувати список'}
              </ImportButtonText>
            </ImportButton>
          </Section>
        </ContentScroll>
      </ContentContainer>
      <Toast config={toastConfig} position="bottom" />
    </Container>
  );
};

export default ListImportScreen;
