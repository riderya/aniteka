// AnimatedModal.js
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Animated, TouchableWithoutFeedback } from 'react-native';
import styled from 'styled-components/native';

const AnimatedModal = ({ visible, onClose, title, children }) => {
  const [showModal, setShowModal] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 100, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <ModalContainer>
        <TouchableWithoutFeedback onPress={onClose}>
          <Background />
        </TouchableWithoutFeedback>
        <AnimatedContent style={{ opacity, transform: [{ translateY }] }}>
  <HandleBar />
  {title && <SheetLabel style={{ marginBottom: 15 }}>{title}</SheetLabel>}
  {children}
  <CloseButton onPress={onClose}>
    <CloseButtonText>Закрити</CloseButtonText>
  </CloseButton>
</AnimatedContent>

      </ModalContainer>
    </Modal>
  );
};

export default AnimatedModal;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const Background = styled.View`
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const HandleBar = styled.View`
  width: 40px;
  height: 5px;
  background-color: ${({ theme }) => theme.colors.borderInput};
  border-radius: 3px;
  align-self: center;
  margin-bottom: 15px;
`;

const AnimatedContent = styled(Animated.View)`
  background-color: ${({ theme }) => theme.colors.card};
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 20px;
  max-height: 90%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const SheetLabel = styled.Text`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.TouchableOpacity`
  height: 50px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
`;

const CloseButtonText = styled.Text`
  font-weight: bold;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
`;
