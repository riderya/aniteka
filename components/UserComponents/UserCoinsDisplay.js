import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getUserCoins } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';

const CoinsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.card};
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CoinsIcon = styled(Ionicons)`
  color: #FFD700;
  font-size: 16px;
  margin-right: 6px;
`;

const CoinsText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 14px;
`;

const UserCoinsDisplay = ({ onPress }) => {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      if (userData?.reference) {
        try {
          const userCoins = await getUserCoins(userData.reference);
          setCoins(userCoins);
        } catch (error) {
  
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCoins();
  }, [userData?.reference]);

  if (loading) {
    return (
      <CoinsContainer theme={theme}>
        <CoinsIcon name="star" />
        <CoinsText theme={theme}>...</CoinsText>
      </CoinsContainer>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <CoinsContainer theme={theme}>
        <CoinsIcon name="star" />
        <CoinsText theme={theme}>{coins}</CoinsText>
      </CoinsContainer>
    </TouchableOpacity>
  );
};

export default UserCoinsDisplay;
