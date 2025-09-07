import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  ActivityIndicator, 
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
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

const ProfileInfo = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  flex-direction: row;
  align-items: center;
`;

const ProfileInfoIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const ProfileInfoText = styled.View`
  flex: 1;
`;

const ProfileInfoTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const ProfileInfoDescription = styled.Text`
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

const ImageContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
`;

const ImageSection = styled.View`
  margin-bottom: 20px;
`;

const ImageTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
`;

const ImageDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: 12px;
`;

const BannerContainer = styled.View`
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const BannerImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const AvatarContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  border: 3px solid ${({ theme }) => theme.colors.background};
  overflow: hidden;
  align-self: center;
  margin-bottom: 20px;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const ImageButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary}20;
  border: 1px solid ${({ theme }) => theme.colors.primary}40;
  border-radius: 999px;
  padding: 12px;
  align-items: center;
  margin-right: 8px;
  flex: 1;
`;

const ImageButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
`;

const RemoveButton = styled.TouchableOpacity`
  background-color: #ff4444;
  border-radius: 999px;
  padding: 12px;
  align-items: center;
  flex: 1;
`;

const RemoveButtonText = styled.Text`
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
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

const ModalTextArea = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
  height: 100px;
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

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ProfileEditScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  
  // Стан для модальних вікон
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Стан для форм
  const [usernameInput, setUsernameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [saving, setSaving] = useState(false);

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('hikka_token');
    } catch (err) {
      return null;
    }
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: token }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося завантажити профіль'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Помилка',
          text2: 'Потрібен дозвіл для доступу до галереї'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        await uploadAvatar(processedImage.uri);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося вибрати зображення'
      });
    }
  };

  const pickCoverImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Помилка',
          text2: 'Потрібен дозвіл для доступу до галереї'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1500, height: 500 } }],
          { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        await uploadCover(processedImage.uri);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося вибрати зображення'
      });
    }
  };

  const uploadAvatar = async (imageUri) => {
    setUploadingAvatar(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const formData = new FormData();
      const fileInfo = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      };
      formData.append('file', fileInfo);

      const response = await fetch('https://api.hikka.io/upload/avatar', {
        method: 'PUT',
        headers: {
          auth: token,
          'Accept': '*/*',
          'Accept-Language': 'uk,en-US;q=0.9,en;q=0.8,ru;q=0.7',
          'Origin': 'https://hikka.io',
          'Referer': 'https://hikka.io/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, avatar: data.url }));
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Аватар оновлено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка завантаження аватара');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося завантажити аватар'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCover = async (imageUri) => {
    setUploadingCover(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const formData = new FormData();
      const fileInfo = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'cover.jpg'
      };
      formData.append('file', fileInfo);

      const response = await fetch('https://api.hikka.io/upload/cover', {
        method: 'PUT',
        headers: {
          auth: token,
          'Accept': '*/*',
          'Accept-Language': 'uk,en-US;q=0.9,en;q=0.8,ru;q=0.7',
          'Origin': 'https://hikka.io',
          'Referer': 'https://hikka.io/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, cover: data.url }));
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Обкладинку оновлено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка завантаження обкладинки');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося завантажити обкладинку'
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const removeCover = async () => {
    setRemovingCover(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const response = await fetch('https://api.hikka.io/settings/image/cover', {
        method: 'DELETE',
        headers: {
          auth: token,
          'Accept': '*/*',
          'Accept-Language': 'uk,en-US;q=0.9,en;q=0.8,ru;q=0.7',
          'Origin': 'https://hikka.io',
          'Referer': 'https://hikka.io/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        },
      });

      if (response.ok) {
        setUserData(prev => ({ ...prev, cover: null }));
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Обкладинку видалено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка видалення обкладинки');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося видалити обкладинку'
      });
    } finally {
      setRemovingCover(false);
    }
  };

  const removeAvatar = async () => {
    setRemovingAvatar(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const response = await fetch('https://api.hikka.io/settings/image/avatar', {
        method: 'DELETE',
        headers: {
          auth: token,
          'Accept': '*/*',
          'Accept-Language': 'uk,en-US;q=0.9,en;q=0.8,ru;q=0.7',
          'Origin': 'https://hikka.io',
          'Referer': 'https://hikka.io/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        },
      });

      if (response.ok) {
        setUserData(prev => ({ ...prev, avatar: null }));
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Аватар видалено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка видалення аватара');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося видалити аватар'
      });
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleEditUsername = () => {
    console.log('handleEditUsername called');
    setUsernameInput(userData?.username || '');
    setShowUsernameModal(true);
  };

  const handleEditDescription = () => {
    console.log('handleEditDescription called');
    setDescriptionInput(userData?.description || '');
    setShowDescriptionModal(true);
  };

  const handleEditEmail = () => {
    console.log('handleEditEmail called');
    setEmailInput(userData?.email || '');
    setShowEmailModal(true);
  };

  const handleChangePassword = () => {
    console.log('handleChangePassword called');
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const saveUsername = async () => {
    if (!usernameInput.trim() || usernameInput.trim() === userData?.username) {
      setShowUsernameModal(false);
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

      const response = await fetch('https://api.hikka.io/settings/username', {
        method: 'PUT',
        headers: {
          auth: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usernameInput.trim()
        }),
      });

      if (response.ok) {
        setUserData(prev => ({ ...prev, username: usernameInput.trim() }));
        setShowUsernameModal(false);
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Ім\'я користувача оновлено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення імені користувача');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося зберегти ім\'я користувача'
      });
    } finally {
      setSaving(false);
    }
  };

  const saveDescription = async () => {
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

      const response = await fetch('https://api.hikka.io/settings/description', {
        method: 'PUT',
        headers: {
          auth: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: descriptionInput
        }),
      });

      if (response.ok) {
        setUserData(prev => ({ ...prev, description: descriptionInput }));
        setShowDescriptionModal(false);
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Опис оновлено'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення опису');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: error.message || 'Не вдалося зберегти опис'
      });
    } finally {
      setSaving(false);
    }
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (!isAuthenticated) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </LoadingContainer>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title="Редагування профілю"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Редагування профілю"
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
          <ProfileInfo>
            <ProfileInfoIcon>
              <Ionicons 
                name="person" 
                size={20} 
                color={theme.colors.primary} 
              />
            </ProfileInfoIcon>
            <ProfileInfoText>
              <ProfileInfoTitle>Ваш профіль</ProfileInfoTitle>
              <ProfileInfoDescription>
                Налаштуйте зображення та інформацію про себе
              </ProfileInfoDescription>
            </ProfileInfoText>
          </ProfileInfo>

          <Section>
            <SectionTitle>Зображення профілю</SectionTitle>
            
            <ImageContainer>
              <ImageSection>
                <ImageTitle>Обкладинка профілю</ImageTitle>
                <ImageDescription>
                  Рекомендований розмір: 1500x500 пікселів
                </ImageDescription>
                
                <BannerContainer>
                  {userData?.cover ? (
                    <BannerImage 
                      source={{ uri: userData.cover }} 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: theme.colors.card,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderStyle: 'dashed',
                      borderRadius: 12
                    }}>
                      <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
                    </View>
                  )}
                </BannerContainer>
                
                <ButtonRow>
                  <ImageButton onPress={pickCoverImage} disabled={uploadingCover}>
                    {uploadingCover ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <ImageButtonText>Змінити</ImageButtonText>
                    )}
                  </ImageButton>
                  {userData?.cover && (
                    <RemoveButton onPress={removeCover} disabled={removingCover}>
                      {removingCover ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <RemoveButtonText>Видалити</RemoveButtonText>
                      )}
                    </RemoveButton>
                  )}
                </ButtonRow>
              </ImageSection>

              <ImageSection>
                <ImageTitle>Аватар</ImageTitle>
                <ImageDescription>
                  Рекомендований розмір: 400x400 пікселів
                </ImageDescription>
                
                <AvatarContainer>
                  {userData?.avatar ? (
                    <AvatarImage 
                      source={{ uri: userData.avatar }} 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: theme.colors.card,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderStyle: 'dashed'
                    }}>
                      <Ionicons name="person-outline" size={24} color={theme.colors.textSecondary} />
                    </View>
                  )}
                </AvatarContainer>
                
                <ButtonRow>
                  <ImageButton onPress={pickImage} disabled={uploadingAvatar}>
                    {uploadingAvatar ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <ImageButtonText>Змінити</ImageButtonText>
                    )}
                  </ImageButton>
                  {userData?.avatar && (
                    <RemoveButton onPress={removeAvatar} disabled={removingAvatar}>
                      {removingAvatar ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <RemoveButtonText>Видалити</RemoveButtonText>
                      )}
                    </RemoveButton>
                  )}
                </ButtonRow>
              </ImageSection>
            </ImageContainer>
          </Section>

          <Section>
            <SectionTitle>Основна інформація</SectionTitle>
            
            <SettingsItem onPress={handleEditUsername}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="at-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Ім'я користувача</SettingsTitle>
                  <SettingsDescription>{userData?.username || 'Не встановлено'}</SettingsDescription>
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

            <SettingsItem onPress={handleEditDescription}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="document-text-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Опис профілю</SettingsTitle>
                  <SettingsDescription>
                    {userData?.description ? 
                      (userData.description.length > 50 ? 
                        userData.description.substring(0, 50) + '...' : 
                        userData.description
                      ) : 'Додайте опис про себе'
                    }
                  </SettingsDescription>
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
            <SectionTitle>Безпека</SectionTitle>
            
            <SettingsItem onPress={handleEditEmail}>
              <SettingsItemLeft>
                <SettingsIcon>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </SettingsIcon>
                <SettingsText>
                  <SettingsTitle>Email адреса</SettingsTitle>
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
          </Section>
        </ContentScroll>
      </ContentContainer>
      
      {/* Модальне вікно для зміни імені користувача */}
      <Modal
        visible={showUsernameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <ModalOverlay>
          <ModalContainer>
            <ModalTitle>Змінити ім'я користувача</ModalTitle>
            <ModalInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="Введіть нове ім'я користувача"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ModalButtonRow>
              <ModalButtonCancel onPress={() => setShowUsernameModal(false)}>
                <ModalButtonTextCancel>Скасувати</ModalButtonTextCancel>
              </ModalButtonCancel>
              <ModalButtonSave onPress={saveUsername} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ModalButtonTextSave>Зберегти</ModalButtonTextSave>
                )}
              </ModalButtonSave>
            </ModalButtonRow>
          </ModalContainer>
        </ModalOverlay>
      </Modal>

      {/* Модальне вікно для зміни опису */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <ModalOverlay>
          <ModalContainer>
            <ModalTitle>Змінити опис профілю</ModalTitle>
            <ModalTextArea
              value={descriptionInput}
              onChangeText={setDescriptionInput}
              placeholder="Введіть опис профілю"
              placeholderTextColor={theme.colors.textSecondary}
              multiline={true}
              textAlignVertical="top"
            />
            <ModalButtonRow>
              <ModalButtonCancel onPress={() => setShowDescriptionModal(false)}>
                <ModalButtonTextCancel>Скасувати</ModalButtonTextCancel>
              </ModalButtonCancel>
              <ModalButtonSave onPress={saveDescription} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ModalButtonTextSave>Зберегти</ModalButtonTextSave>
                )}
              </ModalButtonSave>
            </ModalButtonRow>
          </ModalContainer>
        </ModalOverlay>
      </Modal>

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
                  <ActivityIndicator size="small" color="#ffffff" />
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
                  <ActivityIndicator size="small" color="#ffffff" />
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

export default ProfileEditScreen;