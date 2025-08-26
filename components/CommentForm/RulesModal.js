import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';

const ModalBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.View`
  width: 90%;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 36px;
  padding: 18px;
`;

const ModalTitle = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 10px;
`;

const ModalText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

const ModalActions = styled.View`
  margin-top: 16px;
`;

const CloseBtn = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.disabled};
  border-radius: 999px;
  padding: 12px;
  align-items: center;
`;

const CloseText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.9;
  font-weight: 700;
`;

const RulesModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <ModalBackdrop>
        <ModalCard>
          <ModalTitle>Правила</ModalTitle>
          <ModalText>Заборонено:</ModalText>
          <ModalText>{`
• Спойлери без позначки;
• Образи, погрози, конфлікти, нецензурщина;
• Флуд, спам, випрошування вподобайок;

Повна версія — в розділі "Налаштування" → "Правила спільноти".`}</ModalText>
          <ModalActions>
            <CloseBtn onPress={onClose} activeOpacity={0.85}>
              <CloseText>Закрити</CloseText>
            </CloseBtn>
          </ModalActions>
        </ModalCard>
      </ModalBackdrop>
    </Modal>
  );
};

export default RulesModal;


