import React from 'react';
import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const ToastComponent = ({ type, text1, text2 }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#27ae60' };
      case 'error':
        return { name: 'close-circle', color: '#e74c3c' };
      case 'info':
      default:
        return { name: 'information', color: '#3498db' };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Container theme={theme} insets={insets}>
      <IconContainer type={type}>
        <MaterialCommunityIcons name={iconConfig.name} size={20} color={iconConfig.color} />
      </IconContainer>
      <TextWrapper>
        <TextPrimary theme={theme}>{text1}</TextPrimary>
        {text2 ? <TextSecondary theme={theme}>{text2}</TextSecondary> : null}
      </TextWrapper>
    </Container>
  );
};

const toastConfig = {
  success: (props) => <ToastComponent {...props} type="success" />,
  error: (props) => <ToastComponent {...props} type="error" />,
  info: (props) => <ToastComponent {...props} type="info" />,
};

// Styled components

const Container = styled.View`
  flex-direction: row;
  padding: 16px 20px;
  border-radius: 20px;
  margin-bottom: ${({ insets }) => `${insets.bottom - 25}px`};
  margin-left: 12px;
  margin-right: 12px;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.card};
  shadow-color: ${({ theme }) => theme.isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 8;
  border: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 9999;
`;

const IconContainer = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${({ type }) => 
    type === 'success' ? 'rgba(39, 174, 96, 0.1)' :
    type === 'error' ? 'rgba(231, 76, 60, 0.1)' :
    type === 'info' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const TextWrapper = styled.View`
  flex: 1;
  flex-shrink: 1;
`;

const TextPrimary = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 20px;
`;

const TextSecondary = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  line-height: 18px;
`;

export default toastConfig;
