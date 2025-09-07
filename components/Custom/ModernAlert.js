import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import styled from 'styled-components/native';

const { width: screenWidth } = Dimensions.get('window');

const ModernAlert = ({
  visible,
  title,
  message,
  buttons = [],
  onClose,
  theme,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: theme?.colors?.card,
              borderColor: theme?.colors?.border,
            },
          ]}
        >
          <AlertContent>
            {title && (
              <AlertTitle theme={theme}>
                {title}
              </AlertTitle>
            )}
            
            {message && (
              <AlertMessage theme={theme}>
                {message}
              </AlertMessage>
            )}
            
            <ButtonContainer>
              {buttons.map((button, index) => (
                <AlertButton
                  key={index}
                  onPress={() => handleButtonPress(button)}
                  style={[
                    styles.button,
                    {
                      backgroundColor: button.style === 'destructive' 
                        ? theme?.colors?.error
                        : button.style === 'cancel'
                        ? 'transparent'
                        : theme?.colors?.primary,
                      borderColor: button.style === 'cancel' 
                        ? theme?.colors?.border
                        : 'transparent',
                    },
                  ]}
                >
                  <ButtonText
                    style={{
                      color: button.style === 'destructive' 
                        ? theme?.colors?.text
                        : button.style === 'cancel'
                        ? theme?.colors?.text
                        : theme?.colors?.text,
                    }}
                  >
                    {button.text}
                  </ButtonText>
                </AlertButton>
              ))}
            </ButtonContainer>
          </AlertContent>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    borderRadius: 36,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginHorizontal: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const AlertContent = styled.View`
  padding: 24px;
`;

const AlertTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
  color: ${({ theme }) => theme?.colors?.text || '#080808'};
`;

const AlertMessage = styled.Text`
  font-size: 16px;
  text-align: center;
  line-height: 22px;
  margin-bottom: 24px;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#555555'};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const AlertButton = styled.Pressable`
  flex: 1;
  border-radius: 999px;
  border-width: 1px;
  align-items: center;
  justify-content: center;
  opacity: ${({ pressed }) => pressed ? 0.8 : 1};
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

export default ModernAlert;
