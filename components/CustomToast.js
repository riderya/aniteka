import React from 'react';
import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const toastConfig = {
  success: ({ text1, text2 }) => (
    <Container success>
      <MaterialCommunityIcons name="check-circle-outline" size={24} color="#4BB543" />
      <TextWrapper>
        <TextPrimary>{text1}</TextPrimary>
        {text2 ? <TextSecondary>{text2}</TextSecondary> : null}
      </TextWrapper>
    </Container>
  ),
  error: ({ text1, text2 }) => (
    <Container error>
      <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#FF3333" />
      <TextWrapper>
        <TextPrimary>{text1}</TextPrimary>
        {text2 ? <TextSecondary>{text2}</TextSecondary> : null}
      </TextWrapper>
    </Container>
  ),
  info: ({ text1, text2 }) => (
    <Container info>
      <MaterialCommunityIcons name="information-outline" size={24} color="#2F86EB" />
      <TextWrapper>
        <TextPrimary>{text1}</TextPrimary>
        {text2 ? <TextSecondary>{text2}</TextSecondary> : null}
      </TextWrapper>
    </Container>
  ),
};

// Styled components

const Container = styled.View`
  flex-direction: row;
  padding: 15px;
  border-radius: 12px;
  margin: 10px 10px 0 10px;
  align-items: center;
  background-color: ${({ success, error, info }) => 
    success ? '#e6f4ea' :
    error ? '#fdecea' :
    info ? '#e8f0fe' : '#fff'};
`;

const TextWrapper = styled.View`
  margin-left: 10px;
  flex-shrink: 1;
`;

const TextPrimary = styled.Text`
  font-size: 16px;
  color: #333;
`;

const TextSecondary = styled.Text`
  font-size: 13px;
  color: #666;
  margin-top: 2px;
`;

export default toastConfig;
