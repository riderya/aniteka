import React, { useState } from 'react';
import styled from 'styled-components/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTheme } from '../../context/ThemeContext';

const AvatarWrapper = styled.View`
  position: relative;
`;

const AvatarImage = styled.Image`
  width: 140px;
  height: 140px;
  border-radius: 999px;
  border-width: 6px;
  border-color: ${({ theme }) => theme.colors.background || '#f5f7fa'};
  background-color: ${({ theme }) => theme.colors.border || '#dbeafe'};
`;

const StatusCircle = styled.View`
  position: absolute;
  bottom: 0px;
  right: 20px;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background-color: ${({ active }) => (active ? '#16a34a' : '#94a3b8')};
  border-width: 4px;
  border-color: ${({ theme }) => theme.colors.background};
`;

const ColumnInfo = styled.View`
  align-items: center;
`;

const Username = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 8px;
`;

const EmailWrapper = styled.TouchableOpacity`
  margin-top: 8px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.card};
  padding: 6px 10px;
  border-radius: 8px;
`;

const EmailText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
`;

const Description = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
  margin-top: 8px;
`;

export default function UserAvatar({ userData }) {
  const { theme } = useTheme();
  const [showEmail, setShowEmail] = useState(false);

  return (
    <>
      <AvatarWrapper>
        <AvatarImage
          source={
            userData.avatar
              ? { uri: userData.avatar }
              : require('../../assets/image/noSearchImage.png')
          }
        />
        <StatusCircle active={userData.active} />
      </AvatarWrapper>

      <ColumnInfo>
        <Username>{userData.username}</Username>

        <EmailWrapper onPress={() => setShowEmail((prev) => !prev)}>
          <EmailText>
            {showEmail ? userData.email : 'Показати email'}
          </EmailText>
          <AntDesign
            name={showEmail ? 'eye' : 'eyeo'}
            size={16}
            color={theme.colors.gray}
            style={{ marginLeft: 6 }}
          />
        </EmailWrapper>

        {userData.description ? (
          <Description>{userData.description}</Description>
        ) : null}
      </ColumnInfo>
    </>
  );
}
