import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { useAuth } from '../../context/AuthContext';

const DebugContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 16px;
  margin: 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DebugTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const DebugText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
  font-family: monospace;
`;

export default function AuthDebugger() {
  const { isAuthenticated, isLoading, userData, token } = useAuth();

  return (
    <DebugContainer>
      <DebugTitle>🔍 Auth Debug Info</DebugTitle>
      <ScrollView>
        <DebugText>isAuthenticated: {isAuthenticated ? '✅ true' : '❌ false'}</DebugText>
        <DebugText>isLoading: {isLoading ? '⏳ true' : '✅ false'}</DebugText>
        <DebugText>hasToken: {token ? '✅ true' : '❌ false'}</DebugText>
        <DebugText>hasUserData: {userData ? '✅ true' : '❌ false'}</DebugText>
        {userData && (
          <>
            <DebugText>username: {userData.username || 'N/A'}</DebugText>
            <DebugText>reference: {userData.reference || 'N/A'}</DebugText>
            <DebugText>email: {userData.email || 'N/A'}</DebugText>
          </>
        )}
        <DebugText>token (first 20 chars): {token ? token.substring(0, 20) + '...' : 'N/A'}</DebugText>
      </ScrollView>
    </DebugContainer>
  );
}
