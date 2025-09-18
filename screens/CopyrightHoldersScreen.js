import React from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  View,
  Platform,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
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

const ContactCard = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

const ContactIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const ContactText = styled.View`
  flex: 1;
`;

const ContactTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const ContactSubtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BulletPoint = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
  margin-left: 16px;
`;

const CopyrightHoldersScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@hikka.io');
  };

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title="Правовласникам"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Правовласникам"
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
            <SectionTitle>Правовласникам</SectionTitle>
            <SectionText>
              Якщо Ви помітили матеріал в нашому додатку, що порушує Ваші авторські права, або іншим чином дотичне до Вас, будь ласка, зв'яжіться з нами для розв'язання цього питання. Для цього потрібно відправити лист на нашу електронну пошту, в якому міститься наступне:
            </SectionText>
            <BulletPoint>• посилання на спірний матеріал нашого сайту</BulletPoint>
            <BulletPoint>• контактні дані, для зв'язку з Вами</BulletPoint>
            <BulletPoint>• завірені копії документів, що підтверджують ваше право на матеріал</BulletPoint>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Контакти</SectionTitle>
            <SectionText>
              Адреса нашої електронної пошти:
            </SectionText>
            
            <ContactCard onPress={handleEmailPress}>
              <ContactIcon>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={theme.colors.primary} 
                />
              </ContactIcon>
              <ContactText>
                <ContactTitle>Email</ContactTitle>
                <ContactSubtitle>support@hikka.io</ContactSubtitle>
              </ContactText>
            </ContactCard>
          </SectionCard>

          <SectionCard>
            <SectionText>
              Ваш лист та предʼявлені документи будуть перевірені в найкоротші терміни, та з Вами зв'яжуться для урегулювання питання матеріалу. Увесь контент в нашому додатку отриманий з відкритих джерел та не для продажу, а служить тільки в ознайомчих цілях.
            </SectionText>
          </SectionCard>
        </ContentScroll>
      </ContentContainer>
    </Container>
  );
};

export default CopyrightHoldersScreen;
