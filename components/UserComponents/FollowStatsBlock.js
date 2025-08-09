import React, { useState } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import FollowersModal from './FollowersModal';

const FollowStats = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const StatItem = styled.TouchableOpacity`
  align-items: center;
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  background-color: ${({ pressed, theme }) => pressed ? theme.colors.border : 'transparent'};
`;

const StatCount = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
`;

export default function FollowStatsBlock({ stats, username }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('followers');
  
  // Перевіряємо чи є дані
  const followers = stats?.followers || 0;
  const following = stats?.following || 0;

  const handleFollowersPress = () => {
    setModalType('followers');
    setModalVisible(true);
  };

  const handleFollowingPress = () => {
    setModalType('following');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <FollowStats>
        <StatItem onPress={handleFollowersPress}>
          <StatCount>{followers}</StatCount>
          <StatLabel>стежать</StatLabel>
        </StatItem>
        <StatItem onPress={handleFollowingPress}>
          <StatCount>{following}</StatCount>
          <StatLabel>відстежується</StatLabel>
        </StatItem>
      </FollowStats>
      
      <FollowersModal
        visible={modalVisible}
        onClose={closeModal}
        username={username}
        type={modalType}
      />
    </>
  );
}
