import React, { useState } from 'react';
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

const FAQItem = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const FAQQuestion = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const QuestionText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  margin-right: 12px;
`;

const AnswerContainer = styled.View`
  margin-top: ${({ isExpanded }) => isExpanded ? '12px' : '0px'};
  max-height: ${({ isExpanded }) => isExpanded ? '1000px' : '0px'};
  overflow: hidden;
`;

const AnswerText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
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

const HelpScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "Як додати аніме до мого списку?",
      answer: "Знайдіть аніме через пошук, відкрийте сторінку аніме та натисніть кнопку 'Додати до списку'. Виберіть статус перегляду (дивлюся, заплановано, переглянуто тощо)."
    },
    {
      id: 2,
      question: "Як змінити статус аніме в моєму списку?",
      answer: "Перейдіть до свого профілю, відкрийте список аніме, знайдіть потрібне аніме та натисніть на нього. Ви зможете змінити статус, оцінку та кількість переглянутих епізодів."
    },
    {
      id: 3,
      question: "Чому я не отримую сповіщення?",
      answer: "Перевірте налаштування сповіщень в додатку та переконайтеся, що дозволили сповіщення для додатку в налаштуваннях телефону. Також перевірте підключення до інтернету."
    },
    {
      id: 4,
      question: "Як імпортувати список з MyAnimeList або AniList?",
      answer: "Перейдіть в Налаштування > Список > Імпорт списку. Виберіть джерело (MAL або AniList) та введіть ваше ім'я користувача або завантажте файл експорту."
    },
    {
      id: 5,
      question: "Як змінити тему додатку?",
      answer: "Перейдіть в Налаштування > Кастомізація. Там ви можете вибрати між світлою та темною темою, а також налаштувати кольори інтерфейсу."
    },
    {
      id: 6,
      question: "Що робити, якщо додаток працює повільно?",
      answer: "Спробуйте перезапустити додаток, перевірте підключення до інтернету та переконайтеся, що у вас встановлена остання версія додатку. Також очистіть кеш додатку."
    },
    {
      id: 7,
      question: "Як видалити аніме зі свого списку?",
      answer: "Відкрийте аніме у вашому списку, натисніть на нього та виберіть опцію 'Видалити зі списку' або змініть статус на 'Не в списку'."
    },
    {
      id: 8,
      question: "Чи можу я синхронізувати свій список з іншими сервісами?",
      answer: "Так, ви можете синхронізувати свій список з MyAnimeList, AniList та іншими популярними сервісами через налаштування імпорту/експорту."
    }
  ];

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@hikka.io');
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title="Допомога"
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title="Допомога"
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
            <SectionTitle>Часті питання</SectionTitle>
            <SectionText>
              Тут ви знайдете відповіді на найпоширеніші питання про використання додатку.
            </SectionText>
          </SectionCard>

          {faqData.map((faq) => (
            <FAQItem key={faq.id} onPress={() => toggleFAQ(faq.id)}>
              <FAQQuestion>
                <QuestionText>{faq.question}</QuestionText>
                <Ionicons 
                  name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </FAQQuestion>
              <AnswerContainer isExpanded={expandedFAQ === faq.id}>
                <AnswerText>{faq.answer}</AnswerText>
              </AnswerContainer>
            </FAQItem>
          ))}

          <SectionCard>
            <SectionTitle>Не знайшли відповідь?</SectionTitle>
            <SectionText>
              Якщо ви не знайшли відповідь на своє питання, зв'яжіться з нами:
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
                <ContactTitle>Написати нам</ContactTitle>
                <ContactSubtitle>support@hikka.io</ContactSubtitle>
              </ContactText>
            </ContactCard>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Корисні поради</SectionTitle>
            <SectionText>
              • Регулярно оновлюйте додаток для отримання нових функцій та виправлень
            </SectionText>
            <SectionText>
              • Використовуйте пошук для швидкого знаходження аніме
            </SectionText>
            <SectionText>
              • Налаштуйте сповіщення для відстеження нових епізодів
            </SectionText>
            <SectionText>
              • Створюйте резервні копії вашого списку через експорт
            </SectionText>
          </SectionCard>
        </ContentScroll>
      </ContentContainer>
    </Container>
  );
};

export default HelpScreen;
