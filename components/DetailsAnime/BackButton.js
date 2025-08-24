import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BackButtonWrapper = styled(TouchableOpacity)`
  position: absolute;
  top: ${({ top, safeAreaTop }) => (top || 0) + safeAreaTop}px;
  left: ${({ left }) => left || 12}px;
  right: ${({ right }) => right || 'auto'};
  bottom: ${({ bottom }) => bottom || 'auto'};
  z-index: 10;
  width: 45px;
  height: 45px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 24px;
`;

const BackButton = ({ top, left, right, bottom }) => {
  const navigation = useNavigation();
  const { top: safeAreaTop } = useSafeAreaInsets();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      });
    }
  };

  return (
    <BackButtonWrapper 
      onPress={handleGoBack}
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      safeAreaTop={safeAreaTop}
    >
      <StyledIcon name="arrow-back" />
    </BackButtonWrapper>
  );
};

export default BackButton;
