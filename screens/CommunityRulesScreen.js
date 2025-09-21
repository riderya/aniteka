import React from 'react';
import styled from 'styled-components/native';
import { 
  ScrollView, 
  View,
  Platform
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
    paddingHorizontal: 12,
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

const RuleItem = styled.View`
  flex-direction: row;
  margin-bottom: 12px;
  align-items: flex-start;
`;

const RuleNumber = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 12px;
  min-width: 24px;
`;

const RuleText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

const WarningCard = styled.View`
  background-color: ${({ theme }) => theme.colors.warning}20;
  border: 1px solid ${({ theme }) => theme.colors.warning}40;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: flex-start;
`;

const WarningIcon = styled.View`
  margin-right: 12px;
  margin-top: 2px;
`;

const WarningText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.warning};
  flex: 1;
`;

const CommunityRulesScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title="Правила спільноти"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Правила спільноти"
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
            <SectionTitle>Загальні правила</SectionTitle>
            <SectionText>
              Ласкаво просимо до нашої спільноти! Щоб забезпечити комфортне та безпечне середовище для всіх користувачів, просимо дотримуватися наступних правил:
            </SectionText>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Правила поведінки</SectionTitle>
            
            <RuleItem>
              <RuleNumber>1.</RuleNumber>
              <RuleText>Поважайте інших користувачів. Заборонено образи, дискримінація, тролінг та будь-які форми домагань.</RuleText>
            </RuleItem>

            <RuleItem>
              <RuleNumber>2.</RuleNumber>
              <RuleText>Не публікуйте спам, рекламу або неактуальний контент. Всі публікації повинні стосуватися аніме та манги.</RuleText>
            </RuleItem>

            <RuleItem>
              <RuleNumber>3.</RuleNumber>
              <RuleText>Заборонено публікувати контент 18+ або неприйнятний матеріал. Дотримуйтесь вікових обмежень.</RuleText>
            </RuleItem>

            <RuleItem>
              <RuleNumber>4.</RuleNumber>
              <RuleText>Не розголошуйте спойлери без попередження. Використовуйте відповідні теги для спойлерів.</RuleText>
            </RuleItem>

            <RuleItem>
              <RuleNumber>5.</RuleNumber>
              <RuleText>Заборонено піратство та поширення посилань на нелегальний контент.</RuleText>
            </RuleItem>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Правила коментарів та обговорень</SectionTitle>
            
            <RuleItem>
              <RuleNumber>6.</RuleNumber>
              <RuleText>Ведіть конструктивні дискусії. Критика повинна бути обґрунтованою та ввічливою.</RuleText>
            </RuleItem>

            <RuleItem>
              <RuleNumber>7.</RuleNumber>
              <RuleText>Не створюйте дублікати тем. Перевіряйте, чи не обговорювалося вже ваше питання.</RuleText>
            </RuleItem>

            <RuleItem>
              <RuleNumber>8.</RuleNumber>
              <RuleText>Використовуйте зрозумілі заголовки та описи для ваших публікацій.</RuleText>
            </RuleItem>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Правила профілю</SectionTitle>
            
            <RuleItem>
              <RuleNumber>9.</RuleNumber>
              <RuleText>Не використовуйте образливі або неприйнятні імена користувачів та аватари.</RuleText>
            </RuleItem>

            <RuleItem>
              <RuleNumber>10.</RuleNumber>
              <RuleText>Не видавайте себе за інших людей або персонажів з метою обману.</RuleText>
            </RuleItem>
          </SectionCard>

          <WarningCard>
            <WarningIcon>
              <Ionicons 
                name="warning-outline" 
                size={20} 
                color={theme.colors.warningText || '#856404'} 
              />
            </WarningIcon>
            <WarningText>
              Порушення правил може призвести до попередження, тимчасового або постійного блокування акаунту. 
              Адміністрація залишає за собою право модерувати контент та приймати рішення щодо порушень.
            </WarningText>
          </WarningCard>

          <SectionCard>
            <SectionTitle>Повідомлення про порушення</SectionTitle>
            <SectionText>
              Якщо ви помітили порушення правил спільноти, будь ласка, повідомте про це адміністрації через функцію скарг або напишіть на support@hikka.io.
            </SectionText>
            <SectionText>
              Ми прагнемо створити позитивну та дружню спільноту для всіх любителів аніме та манги. Дякуємо за розуміння та співпрацю!
            </SectionText>
          </SectionCard>
        </ContentScroll>
      </ContentContainer>
    </Container>
  );
};

export default CommunityRulesScreen;
