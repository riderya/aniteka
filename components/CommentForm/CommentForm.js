import React, { useState } from 'react';
import {
  Modal,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';

const getAuthToken = async () => {
  const token = await SecureStore.getItemAsync('hikka_token');
  return token;
};

export default function CommentForm({ content_type, slug }) {
  const [spoiler, setSpoiler] = useState(false);
  const [comment, setComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const { theme, isDark } = useTheme();
  const isCommentTooShort = comment.trim().length < 5;

  const handleSend = async () => {
    let finalComment = comment.trim();

    if (spoiler && !finalComment.startsWith(':::spoiler')) {
      finalComment = `:::spoiler\n${finalComment}\n:::`; 
    }

    const token = await getAuthToken();

    if (!token) {
      Alert.alert('Помилка', 'Потрібна авторизація для відправки коментаря.');
      return;
    }

    try {
      const response = await fetch(`https://api.hikka.io/comments/${content_type}/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth': token,
        },
        body: JSON.stringify({
          text: finalComment,
          parent: null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Помилка API:', result);
        Alert.alert('Помилка', result?.detail || 'Не вдалося надіслати коментар');
        return;
      }

      Alert.alert('Успішно', 'Коментар надіслано!');
      setComment('');
      setSpoiler(false);
    } catch (e) {
      Alert.alert('Помилка', 'Сталася помилка під час відправки коментаря');
      console.error(e);
    }
  };

  return (
    <>
      <Container>
        <RowTop>
          <SpoilerToggleBar onPress={() => setModalVisible(true)}>
            <SpoilerText>
              {spoiler ? (
                <>
                  Містить <GrayText>спойлер</GrayText>
                </>
              ) : (
                <>
                  Не містить <GrayText>спойлер</GrayText>
                </>
              )}
            </SpoilerText>
          </SpoilerToggleBar>

          <RulesButton onPress={() => setRulesModalVisible(true)}>
            <FontAwesome name="clipboard" size={14} color={theme.colors.gray} />
            <RulesText>Правила</RulesText>
          </RulesButton>
        </RowTop>

        <Row>
        <CommentInput
          placeholder="Ваш коментар"
          placeholderTextColor={theme.colors.gray}
          multiline
          value={comment}
          onChangeText={setComment}
        />

<SendButton
  onPress={handleSend}
  disabled={isCommentTooShort}
  style={{ opacity: isCommentTooShort ? 0.5 : 1 }}
>
  <Ionicons
    name="send"
    size={26}
    color={isCommentTooShort ? theme.colors.borderInput : theme.colors.gray}
  />
</SendButton>

        </Row>
      </Container>

      {/* Модалка: Спойлер */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Якщо ваш коментар містить спойлер, будь ласка, вкажіть це.</ModalTitle>
            <ModalDescription>
              Спойлер — це заздалегідь розкрита важлива інформація, яка псує враження від художнього твору.
            </ModalDescription>
            <Divider />
            <RadioOption onPress={() => { setSpoiler(true); setModalVisible(false); }}>
              <FontAwesome name={spoiler ? 'dot-circle-o' : 'circle-o'} size={22} color={theme.colors.gray} />
              <RadioLabel>Містить спойлер</RadioLabel>
            </RadioOption>
            <RadioOption onPress={() => { setSpoiler(false); setModalVisible(false); }}>
              <FontAwesome name={!spoiler ? 'dot-circle-o' : 'circle-o'} size={22} color={theme.colors.gray} />
              <RadioLabel>Не містить спойлер</RadioLabel>
            </RadioOption>
            <CloseButton onPress={() => setModalVisible(false)}>
              <CloseButtonText>Закрити</CloseButtonText>
            </CloseButton>
          </ModalContent>
        </ModalContainer>
      </Modal>

      {/* Модалка: Правила */}
<Modal transparent visible={rulesModalVisible} animationType="fade">
    <ModalContainer>
      <ModalContent>
        <ModalTitle>Правила</ModalTitle>
        <ContentText>
          Заборонено:
          {'\n\n'}• Спойлери без позначки;
          {'\n'}• Образи, погрози, конфлікти, нецензурщина;
          {'\n'}• Флуд, спам, випрошування вподобайок;
          {'\n\n'}Повна версія — в розділі "Налаштування" → "Правила спільноти".
        </ContentText>
        <CloseButton onPress={() => setRulesModalVisible(false)}>
          <CloseButtonText>Закрити</CloseButtonText>
        </CloseButton>
      </ModalContent>
    </ModalContainer>
</Modal>

    </>
  );
}


const Container = styled.View`
  position: relative;
  background-color: ${({ theme }) => theme.colors.card};
  flex: 1;
`;

const RowTop = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 0px 12px;
`;

const SpoilerToggleBar = styled.TouchableOpacity`
  flex: 1;
`;

const SpoilerText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;

const GrayText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
`;

const RulesButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-left: 10px;
`;

const RulesText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.card};
  padding: 0px 12px;
`;

const CommentInput = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  padding: 12px 0px;
  min-height: 80px;
`;

const SendButton = styled.TouchableOpacity``;

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 20px;
  border-radius: 36px;
  width: 90%;
`;

const ContentText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 16px;
`;

const ModalTitle = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
  font-size: 18px;
`;

const ModalDescription = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.borderInput};
  margin: 12px 0px;
`;

const RadioOption = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const RadioLabel = styled.Text`
  margin-left: 10px;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 15px;
  font-weight: 600;
`;

const CloseButton = styled.TouchableOpacity`
  margin-top: 12px;
  padding: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 45px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
`;

const CloseButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: bold;
`;