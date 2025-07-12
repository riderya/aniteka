import React, { useState } from 'react';
import {
  Modal,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const getAuthToken = async () => {
  const token = await SecureStore.getItemAsync('hikka_token');
  return token;
};

// СТИЛІ
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

const CommentInput = styled.TextInput`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  padding: 12px;
  min-height: 80px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const SendButton = styled.TouchableOpacity`
  position: absolute;
  background-color: #444;
  width: 45px;
  height: 45px;
  justify-content: center;
  align-items: center;
  bottom: 0px;
  right: 0;
`;

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 20px;
  border-radius: 28px;
  width: 90%;
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
  background-color: #444;
  margin-vertical: 12px;
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

export default function CommentForm({ content_type, slug }) {
  const [spoiler, setSpoiler] = useState(false);
  const [comment, setComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);

  const handleSend = async () => {
    let finalComment = comment.trim();

    if (finalComment.length < 1) {
      Alert.alert('Помилка', 'Коментар не може бути порожнім.');
      return;
    }

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
            <FontAwesome name="clipboard" size={16} color="#ccc" />
            <RulesText>Правила</RulesText>
          </RulesButton>
        </RowTop>

        <CommentInput
          placeholder="Ваш коментар"
          placeholderTextColor="#777"
          multiline
          value={comment}
          onChangeText={setComment}
        />

        <SendButton onPress={handleSend}>
          <FontAwesome name="arrow-up" size={20} color="#fff" />
        </SendButton>
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
              <FontAwesome name={spoiler ? 'dot-circle-o' : 'circle-o'} size={22} color="#ccc" />
              <RadioLabel>Містить спойлер</RadioLabel>
            </RadioOption>
            <RadioOption onPress={() => { setSpoiler(false); setModalVisible(false); }}>
              <FontAwesome name={!spoiler ? 'dot-circle-o' : 'circle-o'} size={22} color="#ccc" />
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
            <CommentInput
              editable={false}
              multiline
              value={`Заборонено:\n\n– Спойлери без позначки;\n– Образи, погрози, конфлікти, нецензурщина;\n– Флуд, спам, випрошування вподобайок;\n\nПовна версія — в розділі "Налаштування" → "Правила спільноти".`}
            />
            <CloseButton onPress={() => setRulesModalVisible(false)}>
              <CloseButtonText>Закрити</CloseButtonText>
            </CloseButton>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  );
}
