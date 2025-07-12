import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

const BackButtonWrapper = styled(TouchableOpacity)`
  position: absolute;
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

const BackButton = () => {
  const navigation = useNavigation();

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
    <BackButtonWrapper onPress={handleGoBack}>
      <StyledIcon name="arrow-back" />
    </BackButtonWrapper>
  );
};

export default BackButton;
