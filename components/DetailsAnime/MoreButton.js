import React, { useState } from 'react';
import { TouchableOpacity, Pressable, Share, Linking } from 'react-native';
import styled from 'styled-components/native';
import { Entypo } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

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
`;

const DropdownItem = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  padding: 4px;
`;

const DropdownText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  margin-left: 10px;
  font-size: 14px;
`;

const MoreButton = ({ slug }) => {
  const [visible, setVisible] = useState(false);

  const toggleDropdown = () => setVisible(!visible);

  // Потрібно замінити цей URL на динамічний лінк Firebase, який створиш у консолі Firebase
  // Приклад: https://yummyanimelist.page.link/anime-naruto
  const firebaseDynamicLink = `https://yummyanimelist.page.link/anime-${slug}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Дивись це аніме у додатку: ${firebaseDynamicLink}`,
      });
    } catch (error) {
      console.error('Помилка при поділі:', error);
    }
    setVisible(false);
  };

  const handleOpen = () => {
    // Тут відкриваємо кастомний deep link (якщо додаток встановлений)
    const deepLinkUrl = `yummyanimelist://anime/${slug}`;
    Linking.openURL(deepLinkUrl).catch((err) => {
      console.error('Не вдалося відкрити посилання:', err);
      // Можна за бажанням відкривати веб-версію, якщо deep link не працює
      Linking.openURL(firebaseDynamicLink);
    });
    setVisible(false);
  };

  return (
    <Container>
      <StyledButton onPress={toggleDropdown} accessibilityLabel="Більше опцій">
        <StyledIcon name="dots-three-vertical" />
      </StyledButton>

      {visible && (
        <DropdownMenu>
          <DropdownItem onPress={handleShare} android_ripple={{ color: '#555' }}>
            <Ionicons name="share-outline" size={20} color="#bbb" />
            <DropdownText>Поділитись</DropdownText>
          </DropdownItem>

          <DropdownItem onPress={handleOpen} android_ripple={{ color: '#555' }}>
            <Ionicons name="home-outline" size={20} color="#bbb" />
            <DropdownText>На головний екран</DropdownText>
          </DropdownItem>
        </DropdownMenu>
      )}
    </Container>
  );
};

export default MoreButton;
