import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RulesModal from './RulesModal';
import { processCommentText } from '../../utils/textUtils';
import Toast from 'react-native-toast-message';
import toastConfig from '../CustomToast';
import NotificationService from '../../services/NotificationService';

const getAuthToken = async () => {
  const token = await SecureStore.getItemAsync('hikka_token');
  return token;
};

const { height: screenHeight } = Dimensions.get('window');

export default function CommentForm({ content_type, slug, onCommentSent, currentUser, parentComment, isReply = false }) {
  const [spoiler, setSpoiler] = useState(false);
  const [comment, setComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const { theme, isDark } = useTheme();
  const isCommentTooShort = comment.trim().length < 5;
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        // Обмежуємо максимальну висоту клавіатури для стабільності
        const keyboardHeightValue = Math.min(Math.max(event.endCoordinates.height, 200), screenHeight * 0.6);
        setKeyboardHeight(keyboardHeightValue);
        
        // Тільки для Android використовуємо анімації
        if (Platform.OS === 'android') {
          Animated.timing(slideAnim, {
            toValue: keyboardHeightValue,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        
        // Тільки для Android використовуємо анімації
        if (Platform.OS === 'android') {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [slideAnim]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  const handleKeyPress = (event) => {
    // Enter завжди створює новий рядок, не відправляє коментар
    if (event.nativeEvent.key === 'Enter') {
      // Дозволяємо стандартну поведінку Enter (новий рядок)
      return;
    }
  };

  const handleSend = async () => {
    if (isSending) return;
    
    setIsSending(true);
    // Очищуємо текст перед відправкою
    let finalComment = processCommentText(comment.trim());

    if (spoiler && !finalComment.startsWith(':::spoiler')) {
      finalComment = `:::spoiler\n${finalComment}\n:::`; 
    }

    const token = await getAuthToken();

    if (!token) {
      Toast.show({
        type: 'info',
        text1: 'Авторизуйтеся, будь ласка',
        text2: 'Щоб відправляти коментарі, потрібно увійти в акаунт.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      setIsSending(false);
      return;
    }

    // Створюємо оптимістичний коментар
    let optimisticComment = null;
    if (onCommentSent && currentUser) {
      optimisticComment = {
        reference: `temp_${Date.now()}`,
        text: finalComment, // Вже очищений текст
        created: new Date().toISOString(),
        user: currentUser,
        likes: 0,
        dislikes: 0,
        is_liked: false,
        is_disliked: false,
        is_optimistic: true, // Позначаємо як оптимістичний
      };
      onCommentSent(optimisticComment);
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
          parent: isReply && parentComment ? parentComment.reference : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        Toast.show({
          type: 'error',
          text1: 'Помилка',
          text2: result?.detail || 'Не вдалося надіслати коментар',
          position: 'bottom',
          visibilityTime: 3000,
        });
        // Видаляємо оптимістичний коментар у випадку помилки
        if (optimisticComment && onCommentSent) {
          onCommentSent(null, optimisticComment.reference);
        }
        setIsSending(false);
        return;
      }

      setComment('');
      setSpoiler(false);
      dismissKeyboard();
      // Оновлюємо список коментарів після успішної відправки
      if (onCommentSent) {
        onCommentSent();
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Сталася помилка під час відправки коментаря',
        position: 'bottom',
        visibilityTime: 3000,
      });
      // Видаляємо оптимістичний коментар у випадку помилки
      if (optimisticComment && onCommentSent) {
        onCommentSent(null, optimisticComment.reference);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Різні підходи для різних платформ
  const maxKeyboardHeight = Math.max(keyboardHeight, 200);
  const safeBottom = Platform.OS === 'ios' ? insets.bottom  : insets.bottom + 12;
  
  let elevatedBottom;
  if (Platform.OS === 'ios') {
    // На iOS використовуємо відносне позиціонування від низу екрану
    elevatedBottom = maxKeyboardHeight;
  } else {
    // На Android використовуємо абсолютне позиціонування
    elevatedBottom = maxKeyboardHeight + 55;
  }
  
  const containerBottom = slideAnim.interpolate({
    inputRange: [0, maxKeyboardHeight],
    outputRange: [safeBottom, elevatedBottom],
    extrapolate: 'clamp',
  });

  return (
    <>
      <BackgroundContainer theme={theme}>
        <AnimatedContainer 
          theme={theme}
          insets={insets}
          style={{
            bottom: Platform.OS === 'ios' ? (keyboardVisible ? 12 : insets.bottom + 12) : containerBottom,
            zIndex: 1000,
          }}
        >
        
        <RowTop theme={theme}>
          <SpoilerToggleBar onPress={() => {
            setModalVisible(true);
          }}>
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

          <RulesButton onPress={() => {
            setRulesModalVisible(true);
          }}>
            <FontAwesome name="clipboard" size={14} color={theme.colors.gray} />
            <RulesText>Правила</RulesText>
          </RulesButton>
        </RowTop>

        <Row theme={theme}>
          <CommentInput
            ref={inputRef}
            placeholder={isReply ? `Відповідь на коментар ${parentComment?.author?.username ? `@${parentComment.author.username}` : 'користувача'}...` : "Ваш коментар"}
            placeholderTextColor={theme.colors.gray}
            multiline
            value={comment}
            onChangeText={setComment}
            onKeyPress={handleKeyPress}
            returnKeyType="default"
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={false}
            textAlignVertical="top"
            keyboardAppearance={isDark ? 'dark' : 'light'}
            style={{
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: 'transparent',
            }}
          />

          <SendButton
            onPress={handleSend}
            disabled={isCommentTooShort || isSending}
            style={{ 
              opacity: (isCommentTooShort || isSending) ? 0.5 : 1,
              transform: [{ scale: isSending ? 0.9 : 1 }]
            }}
          >
            <Ionicons
              name={isSending ? "hourglass" : "send"}
              size={26}
              color={(isCommentTooShort || isSending) ? theme.colors.borderInput : theme.colors.gray}
            />
          </SendButton>
        </Row>
      </AnimatedContainer>
      </BackgroundContainer>

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
      <RulesModal visible={rulesModalVisible} onClose={() => setRulesModalVisible(false)} />
      
      <Toast config={toastConfig} position="bottom" />
    </>
  );
}


const BackgroundContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 1;
`;

const Container = styled.View`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  overflow: hidden;
  left: 12px;
  right: 12px;
`;

const AnimatedContainer = Animated.createAnimatedComponent(Container);

const RowTop = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  background-color: ${({ theme }) => theme.colors.card};
  padding: 0px 12px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
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
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 0px 12px;
  min-height: 60px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const CommentInput = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  min-height: 36px;
  max-height: 120px;
  line-height: 20px;
  ${Platform.OS === 'android' ? `
    padding-top: 8px;
    padding-bottom: 8px;
  ` : ''}
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
  border-radius: 32px;
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