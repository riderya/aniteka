import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  ActivityIndicator, 
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import toastConfig from '../components/CustomToast';

import { useTheme } from '../context/ThemeContext';
import { ThemeToggleButton } from '../components/Switchers/ThemeToggleButton';
import { BlurView } from 'expo-blur';
import ColorSelector from '../components/Switchers/ColorsSwitcher';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ContentContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding-top: 110px;
`;

const TabListContainer = styled.View`
  flex: 1;
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
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const TabCard = styled.TouchableOpacity`
  width: 48%;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px 16px;
  margin-bottom: 16px;
  align-items: center;
  justify-content: center;
`;

const TabCardIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const TabCardTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 4px;
`;

const TabCardDescription = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;



const ContentScroll = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 12,
    paddingBottom: 0,
  },
})`
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

const AvatarSection = styled.View`
  align-items: center;
  margin-bottom: 30px;
`;

const AvatarContainer = styled.TouchableOpacity`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 15px;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const AvatarPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

const AvatarPlaceholderText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 40px;
`;

const ChangeAvatarButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ChangeAvatarText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 14px;
`;

const InputGroup = styled.View`
  margin-bottom: 20px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const Input = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  height: 100px;
  text-align-vertical: top;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${({ theme, disabled }) => 
    disabled ? theme.colors.border : theme.colors.primary};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 20px;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

const SaveButtonText = styled.Text`
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-top: 5px;
`;

const SecurityItem = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SecurityItemLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const SecurityIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const SecurityText = styled.View`
  flex: 1;
`;

const SecurityTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const SecurityDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ArrowIcon = styled.View`
  margin-left: 8px;
`;

const BannerContainer = styled.View`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const BannerImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const AvatarOverlay = styled.TouchableOpacity`
  position: absolute;
  left: 20px;
  bottom: 20px;
  width: 80px;
  height: 80px;
  border-radius: 40px;
  border: 3px solid ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const RemoveButton = styled.TouchableOpacity`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #FF5252;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.background};
`;

const SettingsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;
  
  // Отримуємо параметр з навігації, щоб визначити доступні вкладки
  const { fromEditProfile } = route.params || {};
  
  const [activeTab, setActiveTab] = useState(null);
  const [showTabList, setShowTabList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    email: '',
    about: '',
    location: '',
    website: '',
    birthday: ''
  });
  const [confirmEmail, setConfirmEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [lastUsernameChange, setLastUsernameChange] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  // Визначаємо доступні вкладки
  const availableTabs = fromEditProfile 
    ? [
        { 
          id: 'profile', 
          title: 'Профіль', 
          icon: 'person-outline',
          description: 'Налаштування профілю та зображень'
        },
        { 
          id: 'security', 
          title: 'Безпека', 
          icon: 'shield-checkmark-outline',
          description: 'Пароль, email та безпека акаунту'
        }
      ]
    : [
        { 
          id: 'profile', 
          title: 'Профіль', 
          icon: 'person-outline',
          description: 'Налаштування профілю та зображень'
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
          id: 'applications', 
          title: 'Застосунки', 
          icon: 'settings-outline',
          description: 'Системні налаштування'
        }
      ];

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('hikka_token');
    } catch (err) {
      return null;
    }
  };

    const fetchUserProfile = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      // Завантажуємо час останньої зміни імені користувача
      try {
        const lastChange = await SecureStore.getItemAsync('last_username_change');
        if (lastChange) {
          setLastUsernameChange(parseInt(lastChange));
        }
      } catch (error) {
        console.log('Не вдалося завантажити час останньої зміни імені користувача');
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
  };

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
         console.log('Вибрано зображення для аватара:', result.assets[0].uri);
         
         // Обробляємо зображення до точного розміру
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
         console.log('Вибрано зображення для обкладинки:', result.assets[0].uri);
         
         // Обробляємо зображення до точного розміру
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
      console.log('Файл для завантаження аватара:', fileInfo);
             formData.append('file', fileInfo);

             console.log('Відправляємо запит на завантаження аватара');
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

      console.log('Статус відповіді аватара:', response.status);
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
        console.error('Помилка від API аватара:', errorData);
        throw new Error(errorData.message || 'Помилка завантаження аватара');
      }
    } catch (error) {
      console.error('Помилка завантаження аватара:', error);
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
      console.log('Файл для завантаження обкладинки:', fileInfo);
             formData.append('file', fileInfo);

             console.log('Відправляємо запит на завантаження обкладинки');
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

      console.log('Статус відповіді обкладинки:', response.status);
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
        console.error('Помилка від API обкладинки:', errorData);
        throw new Error(errorData.message || 'Помилка завантаження обкладинки');
      }
    } catch (error) {
      console.error('Помилка завантаження обкладинки:', error);
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

              console.log('Відправляємо запит на видалення обкладинки');
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

       console.log('Статус відповіді видалення обкладинки:', response.status);
       if (response.ok) {
         setUserData(prev => ({ ...prev, cover: null }));
         Toast.show({
           type: 'success',
           text1: 'Успішно',
           text2: 'Обкладинку видалено'
         });
       } else {
         const errorData = await response.json();
         console.error('Помилка від API видалення обкладинки:', errorData);
         throw new Error(errorData.message || 'Помилка видалення обкладинки');
       }
     } catch (error) {
       console.error('Помилка видалення обкладинки:', error);
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

       console.log('Відправляємо запит на видалення аватара');
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

       console.log('Статус відповіді видалення аватара:', response.status);
       if (response.ok) {
         setUserData(prev => ({ ...prev, avatar: null }));
         Toast.show({
           type: 'success',
           text1: 'Успішно',
           text2: 'Аватар видалено'
         });
       } else {
         const errorData = await response.json();
         console.error('Помилка від API видалення аватара:', errorData);
         throw new Error(errorData.message || 'Помилка видалення аватара');
       }
     } catch (error) {
       console.error('Помилка видалення аватара:', error);
       Toast.show({
         type: 'error',
         text1: 'Помилка',
         text2: error.message || 'Не вдалося видалити аватар'
       });
     } finally {
       setRemovingAvatar(false);
     }
   };

  const calculateTimeRemaining = () => {
    if (!lastUsernameChange) return null;
    
    const now = new Date().getTime();
    const timeDiff = now - lastUsernameChange;
    const oneHour = 60 * 60 * 1000; // 1 година в мілісекундах
    
    if (timeDiff < oneHour) {
      const remainingMs = oneHour - timeDiff;
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return remainingMinutes;
    }
    
    return null;
  };

  const validateUsername = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Ім\'я користувача обов\'язкове';
    } else if (!/^[A-Za-z][A-Za-z0-9_]{4,63}$/.test(formData.username)) {
      newErrors.username = 'Ім\'я користувача має починатися з літери та містити 5-64 символи (літери, цифри, _)';
    }

    // Перевіряємо, чи не вводить користувач те саме ім'я
    if (formData.username.trim() === userData?.username) {
      newErrors.username = 'Це вже ваше поточне ім\'я користувача';
    }

    // Перевірка обмеження часу (тільки якщо ім'я дійсно змінюється)
    const remainingTime = calculateTimeRemaining();
    if (remainingTime && formData.username.trim() !== userData?.username) {
      newErrors.username = `Ім'я користувача можна змінювати раз на годину. Спробуйте через ${remainingTime} хвилин`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (formData.email && confirmEmail && formData.email !== confirmEmail) {
      newErrors.confirmEmail = 'Email не співпадає';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Пароль обов\'язковий';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Пароль має бути не менше 8 символів';
    } else if (newPassword.length > 256) {
      newErrors.newPassword = 'Пароль має бути не більше 256 символів';
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveUsername = async () => {
    if (!validateUsername()) {
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

             console.log('Відправляємо запит на зміну імені користувача:', formData.username);
       const response = await fetch('https://api.hikka.io/settings/username', {
         method: 'PUT',
         headers: {
           auth: token,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           username: formData.username
         }),
       });
       
       console.log('Статус відповіді:', response.status);

             if (response.ok) {
         // Зберігаємо час останньої зміни
         const currentTime = new Date().getTime();
         setLastUsernameChange(currentTime);
         await SecureStore.setItemAsync('last_username_change', currentTime.toString());
         Toast.show({
           type: 'success',
           text1: 'Успішно',
           text2: 'Ім\'я користувача оновлено'
         });
         if (fromEditProfile) {
           navigation.goBack();
         }
              } else {
         const errorData = await response.json();
         console.log('Помилка від API:', errorData);
         
                   // Обробляємо помилку cooldown від сервера
          if (errorData.code === 'settings:username_cooldown') {
            // Скидаємо локальний cooldown, оскільки сервер має свій
            setLastUsernameChange(null);
            setTimeRemaining(null);
            await SecureStore.deleteItemAsync('last_username_change');
            
            throw new Error('Ім\'я користувача можна змінювати раз на годину. Спробуйте пізніше.');
          }
         
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
          description: formData.about
        }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Опис оновлено'
        });
        if (fromEditProfile) {
          navigation.goBack();
        }
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
    if (!validateEmail()) {
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
          email: formData.email
        }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Email оновлено'
        });
        if (fromEditProfile) {
          navigation.goBack();
        }
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
    if (!validatePassword()) {
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
          password: newPassword
        }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Успішно',
          text2: 'Пароль оновлено'
        });
        setNewPassword('');
        setConfirmPassword('');
        if (fromEditProfile) {
          navigation.goBack();
        }
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

  const renderProfileTab = () => (
    <>
      <Section>
        <SectionTitle>Профіль</SectionTitle>
        <SectionTitle style={{ fontSize: 14, fontWeight: 400, marginBottom: 20 }}>
          Налаштуйте вигляд та деталі свого профілю
        </SectionTitle>
      </Section>

      <Section>
        <SectionTitle>Зображення профілю</SectionTitle>
                 <SectionTitle style={{ fontSize: 12, fontWeight: 400, marginBottom: 15 }}>
           Обов'язковий розмір: обкладинка 1500х500, аватар 400x400
         </SectionTitle>
        
                          {/* Банер з аватаром */}
         <BannerContainer>
           <TouchableOpacity onPress={pickCoverImage} style={{ width: '100%', height: '100%' }} disabled={uploadingCover || removingCover}>
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
                 alignItems: 'center'
               }}>
                 {uploadingCover ? (
                   <ActivityIndicator size="large" color={theme.colors.primary} />
                 ) : (
                   <>
                     <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
                     <Text style={{ 
                       color: theme.colors.textSecondary, 
                       marginTop: 8,
                       fontSize: 14,
                       textAlign: 'center'
                     }}>
                       Натисніть, щоб завантажити обкладинку
                     </Text>
                   </>
                 )}
               </View>
             )}
           </TouchableOpacity>
           {userData?.cover && (
             <RemoveButton onPress={removeCover} disabled={removingCover}>
               {removingCover ? (
                 <ActivityIndicator size="small" color="#ffffff" />
               ) : (
                 <Ionicons name="close" size={16} color="#ffffff" />
               )}
             </RemoveButton>
           )}
                                                 <AvatarOverlay onPress={pickImage} disabled={uploadingAvatar || removingAvatar}>
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
                  alignItems: 'center'
                                 }}>
                   {uploadingAvatar || removingAvatar ? (
                     <ActivityIndicator size="small" color={theme.colors.primary} />
                   ) : (
                     <Ionicons name="person-outline" size={32} color={theme.colors.textSecondary} />
                   )}
                 </View>
               )}
              {userData?.avatar && (
                <RemoveButton onPress={removeAvatar} disabled={removingAvatar}>
                  {removingAvatar ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="close" size={16} color="#ffffff" />
                  )}
                </RemoveButton>
              )}
           </AvatarOverlay>
         </BannerContainer>
      </Section>

                           <Section>
          <SectionTitle>Нове ім'я користувача</SectionTitle>
          <Input
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            placeholder="Введіть нове ім'я"
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {timeRemaining && (
            <Text style={{ 
              color: theme.colors.textSecondary, 
              fontSize: 14,
              marginTop: 8,
              textAlign: 'center'
            }}>
              ⏰ Ім'я користувача можна змінювати раз в годину. Спробуйте через {timeRemaining} хвилин
            </Text>
          )}
          {errors.username && <ErrorText>{errors.username}</ErrorText>}
          
                     <SaveButton 
             onPress={saveUsername} 
             disabled={saving || formData.username.trim() === userData?.username}
             style={{ marginTop: 15 }}
           >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <SaveButtonText>Зберегти</SaveButtonText>
            )}
          </SaveButton>
        </Section>

      <Section>
        <SectionTitle>Опис</SectionTitle>
        <TextArea
          value={formData.about}
          onChangeText={(text) => setFormData({...formData, about: text})}
          placeholder="Введіть опис"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          returnKeyType="done"
          blurOnSubmit={true}
        />
        
        <SaveButton 
          onPress={saveDescription} 
          disabled={saving}
          style={{ marginTop: 15 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <SaveButtonText>Зберегти</SaveButtonText>
          )}
        </SaveButton>
      </Section>
    </>
  );

    const renderSecurityTab = () => (
    <>
      <Section>
        <SectionTitle>Безпека</SectionTitle>
        <SectionTitle style={{ fontSize: 14, fontWeight: 400, marginBottom: 20 }}>
          Захистіть свій обліковий запис: змініть пароль чи email
        </SectionTitle>
      </Section>

      <Section>
        <SectionTitle>Поштова адреса</SectionTitle>
        
        <InputGroup>
          <InputLabel>Новий email</InputLabel>
          <Input
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="Введіть новий email"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <InputLabel>Підтвердити email</InputLabel>
          <Input
            value={confirmEmail}
            onChangeText={setConfirmEmail}
            placeholder="Підтвердіть новий email"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {errors.confirmEmail && <ErrorText>{errors.confirmEmail}</ErrorText>}
        </InputGroup>

        <SaveButton 
          onPress={saveEmail} 
          disabled={saving}
          style={{ marginTop: 15 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <SaveButtonText>Зберегти</SaveButtonText>
          )}
        </SaveButton>
      </Section>

      <Section>
        <SectionTitle>Пароль</SectionTitle>
        
        <InputGroup>
          <InputLabel>Новий пароль</InputLabel>
          <Input
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Введіть новий пароль"
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {errors.newPassword && <ErrorText>{errors.newPassword}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <InputLabel>Підтвердити пароль</InputLabel>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Підтвердіть новий пароль"
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
        </InputGroup>

        <SaveButton 
          onPress={savePassword} 
          disabled={saving}
          style={{ marginTop: 15 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <SaveButtonText>Зберегти</SaveButtonText>
          )}
        </SaveButton>
      </Section>

      <Section>
        <SecurityItem onPress={async () => {
          try {
            await SecureStore.deleteItemAsync('hikka_token');
            Toast.show({
              type: 'success',
              text1: 'Успішно',
              text2: 'Ви успішно вийшли з облікового запису'
            });
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Помилка',
              text2: 'Не вдалося вийти з облікового запису'
            });
          }
        }}>
          <SecurityItemLeft>
            <SecurityIcon>
              <Ionicons name="log-out" size={20} color="#FF5252" />
            </SecurityIcon>
            <SecurityText>
              <SecurityTitle style={{ color: '#FF5252' }}>Вийти з акаунту</SecurityTitle>
              <SecurityDescription>Завершити поточну сесію</SecurityDescription>
            </SecurityText>
          </SecurityItemLeft>
          <ArrowIcon>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </ArrowIcon>
        </SecurityItem>
      </Section>
    </>
  );

  const renderCustomizationTab = () => (
    <>
      <Section>
        <SectionTitle>Тема додатку</SectionTitle>
        <SectionTitle style={{ fontSize: 14, fontWeight: 400, marginBottom: 20 }}>
          Оберіть світлу або темну тему для зручного використання
        </SectionTitle>
        <ThemeToggleButton />
      </Section>

      <Section>
        <SectionTitle>Основний колір</SectionTitle>
        <SectionTitle style={{ fontSize: 14, fontWeight: 400, marginBottom: 20 }}>
          Оберіть улюблений колір для інтерфейсу додатку
        </SectionTitle>
        <ColorSelector />
      </Section>
    </>
  );

  const renderTabList = () => (
    <TabListContainer>
      <TabListTitle>{fromEditProfile ? 'Редагування профілю' : 'Налаштування'}</TabListTitle>
      <TabListSubtitle>
        {fromEditProfile ? 'Оберіть що хочете змінити у профілі' : 'Оберіть розділ налаштувань, який хочете змінити'}
      </TabListSubtitle>
      
      <TabListGrid>
        {availableTabs.map((tab) => (
          <TabCard
            key={tab.id}
            onPress={() => {
              setActiveTab(tab.id);
              setShowTabList(false);
            }}
          >
            <TabCardIcon>
              <Ionicons 
                name={tab.icon} 
                size={24} 
                color={theme.colors.primary} 
              />
            </TabCardIcon>
            <TabCardTitle>{tab.title}</TabCardTitle>
            <TabCardDescription>{tab.description}</TabCardDescription>
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

  const renderTabContent = () => {
    if (!activeTab) return null;
    
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'customization':
        return renderCustomizationTab();
      default:
        return renderOtherTabs();
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        display_name: userData.display_name || '',
        email: userData.email || '',
        about: userData.description || '',
        location: userData.location || '',
        website: userData.website || '',
        birthday: userData.birthday || ''
      });
    }
  }, [userData]);



  useEffect(() => {
    const updateTimeRemaining = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    
    const interval = setInterval(updateTimeRemaining, 60000); // Оновлюємо кожну хвилину
    
    return () => clearInterval(interval);
  }, [lastUsernameChange]);

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
      <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
      <HeaderTitleBar 
        title={fromEditProfile ? 'Редагування профілю' : (showTabList ? 'Налаштування' : (availableTabs.find(tab => tab.id === activeTab)?.title || 'Налаштування'))}
        showBack={true}
        onBack={() => {
          if (showTabList) {
            // Якщо ми на списку табів - виходимо з екрану
            navigation.goBack();
          } else {
            // Якщо ми в конкретному табі - повертаємося до списку
            setShowTabList(true);
            setActiveTab(null);
          }
        }}
      />
      </BlurOverlay>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ContentContainer>
          <ContentScroll 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {showTabList ? (
              renderTabList()
            ) : (
              <>
                {renderTabContent()}
              </>
            )}
          </ContentScroll>
        </ContentContainer>
      </KeyboardAvoidingView>
      <Toast config={toastConfig} position="bottom" />
    </Container>
  );
};

export default SettingsScreen;
