import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { Entypo } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

const Container = styled.View`
  position: relative;
`;

const StyledButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const StyledIcon = styled(Entypo)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 24px;
`;

const DropdownMenu = styled.View`
  position: absolute;
  width: 200px;
  bottom: 45px;
  right: 0;
  background-color: ${({ theme }) => theme.colors.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 10px;
  flex-direction: column;
  gap: 8px;
`;

const DropdownItem = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  padding: 4px;
`;

const DropdownText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  margin-left: 10px;
  font-size: 14px;
`;

const MoreButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleDropdown = () => setVisible(!visible);
  const handleOption = (text) => {
    console.log(`Натиснуто: ${text}`);
    setVisible(false);
  };

  return (
    <Container>
      <StyledButton onPress={toggleDropdown} accessibilityLabel="Більше опцій">
        <StyledIcon name="dots-three-vertical" />
      </StyledButton>

      {visible && (
        <DropdownMenu>
          <DropdownItem
            onPress={() => handleOption('Поділитись')}
            android_ripple={{ color: '#555' }}
          >
            <Ionicons name="share-outline" size={20} color="#bbb" />
            <DropdownText>Поділитись</DropdownText>
          </DropdownItem>
          <DropdownItem
            onPress={() => handleOption('На головний екран')}
            android_ripple={{ color: '#555' }}
          >
            <Ionicons name="home-outline" size={20} color="#bbb" />
            <DropdownText>На головний екран</DropdownText>
          </DropdownItem>
        </DropdownMenu>
      )}
    </Container>
  );
};

export default MoreButton;
