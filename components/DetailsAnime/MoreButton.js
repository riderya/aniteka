import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, Pressable, Share, Linking, Animated } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Entypo } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

const Container = styled.View`
  position: relative;
`;

const Overlay = styled(Pressable)`
  position: absolute;
  top: -1000px;
  left: -1000px;
  right: -1000px;
  bottom: -1000px;
  z-index: 1;
`;

const StyledButton = styled(TouchableOpacity)`
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
`;

const StyledIcon = styled(Entypo)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 22px;
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
  const [isAnimating, setIsAnimating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  // Очищуємо анімацію при розмонтуванні компонента
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim]);

  const toggleDropdown = () => {
    // Запобігаємо повторним натисканням під час анімації
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (!visible) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        setIsAnimating(false);
      });
    }
  };

  // Потрібно замінити цей URL на динамічний лінк Firebase, який створиш у консолі Firebase
  // Приклад: https://yummyanimelist.page.link/anime-naruto
  const firebaseDynamicLink = `https://yummyanimelist.page.link/anime-${slug}`;

  const closeDropdown = () => {
    // Запобігаємо повторним натисканням під час анімації
    if (isAnimating || !visible) return;
    
    setIsAnimating(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setIsAnimating(false);
    });
  };

  const handleShare = async () => {
    if (isAnimating) return;
    
    try {
      await Share.share({
        message: `Дивись це аніме у додатку: ${firebaseDynamicLink}`,
      });
    } catch (error) {
      
    }
    closeDropdown();
  };

  const handleOpen = () => {
    if (isAnimating) return;
    
    // Тут відкриваємо кастомний deep link (якщо додаток встановлений)
    const deepLinkUrl = `yummyanimelist://anime/${slug}`;
    Linking.openURL(deepLinkUrl).catch((err) => {
      
      // Можна за бажанням відкривати веб-версію, якщо deep link не працює
      Linking.openURL(firebaseDynamicLink);
    });
    closeDropdown();
  };

  return (
    <Container>
      <StyledButton 
        onPress={toggleDropdown} 
        accessibilityLabel="Більше опцій"
        disabled={isAnimating}
        style={{ opacity: isAnimating ? 0.6 : 1 }}
      >
        <StyledIcon name="dots-three-vertical" />
      </StyledButton>

      {visible && (
        <>
          <Overlay onPress={closeDropdown} />
          <Animated.View
            style={{
              position: 'absolute',
              width: 200,
              bottom: 60,
              right: 0,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 10,
              padding: 10,
              flexDirection: 'column',
              gap: 8,
              zIndex: 2,
              opacity: fadeAnim,
            }}
          >
            <DropdownItem onPress={handleShare} android_ripple={{ color: '#555' }}>
              <Ionicons name="share-outline" size={20} color="#bbb" />
              <DropdownText>Поділитись</DropdownText>
            </DropdownItem>

            <DropdownItem onPress={handleOpen} android_ripple={{ color: '#555' }}>
              <Ionicons name="home-outline" size={20} color="#bbb" />
              <DropdownText>На головний екран</DropdownText>
            </DropdownItem>
          </Animated.View>
        </>
      )}
    </Container>
  );
};

export default MoreButton;

