import React, { useCallback } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Linking, Alert } from 'react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

const SocialLinks = React.memo(({ telegramUrl, discordUrl }) => {
  const theme = useTheme();

  const openLink = useCallback(async (url, linkType = 'посилання') => {
    if (!url) {

      Alert.alert('Помилка', 'Посилання не доступне');
      return;
    }
    
    
    
    try {
      const supported = await Linking.canOpenURL(url);
      
      
      if (supported) {
        await Linking.openURL(url);
        
      } else {
        
        Alert.alert(
          'Неможливо відкрити посилання', 
          `Ваш пристрій не може відкрити це ${linkType}. Спробуйте встановити відповідний додаток або скопіювати посилання вручну: ${url}`
        );
      }
    } catch (error) {
      
      Alert.alert(
        'Помилка', 
        `Не вдалося відкрити ${linkType}. Спробуйте пізніше або скопіюйте посилання вручну: ${url}`
      );
    }
  }, []);

  return (
    <Container>
      <Button
        activeOpacity={0.7}
        onPress={() => openLink(telegramUrl, 'Telegram канал')}
        accessibilityRole="link"
      >
        <IconWrapper>
          <FontAwesome5 name="telegram-plane" size={20} color={theme.colors.text} />
        </IconWrapper>
        <ButtonText>Ми в Telegram</ButtonText>
      </Button>

      <Button
        activeOpacity={0.7}
        onPress={() => openLink(discordUrl, 'Discord сервер')}
        accessibilityRole="link"
      >
        <IconWrapper>
          <FontAwesome6 name="discord" size={16} color={theme.colors.text} />
        </IconWrapper>
        <ButtonText>Ми в Discord</ButtonText>
      </Button>
    </Container>
  );
});

SocialLinks.displayName = 'SocialLinks';

SocialLinks.defaultProps = {
  telegramUrl: 'https://t.me/anitekalib',
  discordUrl: 'https://discord.gg/5truHDdzEq',
};

export default SocialLinks;

const Container = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 12px;
`;

const Button = styled.TouchableOpacity`
  width: 48%;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0px 24px;
  height: 56px;
  border-radius: 999px;
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled.View`
  margin-right: 10px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;


