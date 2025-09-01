import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Pressable, Share, Linking, Alert, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Entypo } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createAnimeLink, createDeepLink } from '../../utils/linksConfig';

const Container = styled.View`
  position: relative;
`;

const StyledButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const StyledIcon = styled(Entypo)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 24px;
`;

const DropdownMenu = styled.View`
  position: absolute;
  width: 200px;
  bottom: 45px;
  right: 0;
  background-color: ${({ theme }) => theme.colors.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 10px;
  flex-direction: column;
  gap: 8px;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const DropdownItem = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
`;

const DropdownText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  margin-left: 10px;
  font-size: 14px;
  font-weight: 500;
`;

const MoreButton = ({ slug, animeTitle }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const toggleDropdown = () => setVisible(!visible);

  // Закриваємо dropdown при натисканні поза ним
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000); // Автоматично закриваємо через 5 секунд
      
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Динамічний лінк для поділення
  const shareUrl = createAnimeLink(slug);
  
  // Fallback посилання (використовується, якщо основне не працює)
  const fallbackUrl = createAnimeLink(slug, true);
  
  // Локальний deep link для переходу в додатку
  const deepLinkUrl = createDeepLink(slug);

  const handleShare = async () => {
    try {
      // Перевіряємо, чи доступна функція Share
      if (!Share.share) {
        Alert.alert('Помилка', 'Функція поділення не доступна на цьому пристрої');
        return;
      }

      const shareMessage = animeTitle 
        ? `Дивись аніме "${animeTitle}" у додатку YummyAnimeList: ${shareUrl}`
        : `Дивись це аніме у додатку YummyAnimeList: ${shareUrl}`;
      
      const result = await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: animeTitle || 'Аніме в YummyAnimeList'
      });

      if (result.action === Share.sharedAction) {
        console.log('Успішно поділено');
      }
    } catch (error) {
      console.log('Помилка поділення:', error);
      Alert.alert('Помилка', 'Не вдалося поділитись аніме');
    }
    setVisible(false);
  };

  const handleOpenInApp = () => {
    try {
      // Закриваємо dropdown
      setVisible(false);
      
      // Переходимо на екран аніме в додатку
      navigation.navigate('AnimeDetails', { slug });
    } catch (error) {
      console.log('Помилка навігації:', error);
      Alert.alert('Помилка', 'Не вдалося відкрити аніме в додатку');
    }
  };

  const handleOpenInBrowser = () => {
    setVisible(false);
    
    // Спочатку намагаємося відкрити основне посилання
    Linking.openURL(shareUrl).catch((err) => {
      console.log('Помилка відкриття основного посилання:', err);
      
      // Якщо основне посилання не працює, відкриваємо fallback
      Linking.openURL(fallbackUrl).catch((fallbackErr) => {
        console.log('Помилка відкриття fallback посилання:', fallbackErr);
        Alert.alert('Помилка', 'Не вдалося відкрити посилання. Перевірте інтернет-з\'єднання.');
      });
    });
  };

  const closeDropdown = () => setVisible(false);

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <Container>
        <StyledButton onPress={toggleDropdown} accessibilityLabel="Більше опцій">
          <StyledIcon name="dots-three-vertical" />
        </StyledButton>

        {visible && (
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownItem onPress={handleShare} android_ripple={{ color: '#555' }}>
                <Ionicons name="share-outline" size={20} color="#bbb" />
                <DropdownText>Поділитись</DropdownText>
              </DropdownItem>

              <DropdownItem onPress={handleOpenInApp} android_ripple={{ color: '#555' }}>
                <Ionicons name="phone-portrait-outline" size={20} color="#bbb" />
                <DropdownText>Відкрити в додатку</DropdownText>
              </DropdownItem>

              <DropdownItem onPress={handleOpenInBrowser} android_ripple={{ color: '#555' }}>
                <Ionicons name="globe-outline" size={20} color="#bbb" />
                <DropdownText>Відкрити в браузері</DropdownText>
              </DropdownItem>
            </DropdownMenu>
          </TouchableWithoutFeedback>
        )}
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default MoreButton;

