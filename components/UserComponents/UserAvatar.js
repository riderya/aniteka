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
`;

const UsernameContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const UserBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
`;

const UserBadgeText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const EmailWrapper = styled.TouchableOpacity`
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
`;

const ActivityInfoContainer = styled.TouchableOpacity`
  padding: 12px 16px;
  align-items: flex-start;
`;

const ActivityInfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ActivityTextGray = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  line-height: 18px;
`;

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'невідомо';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);
  
  if (years > 0) {
    return `${years} ${years === 1 ? 'рік' : years < 5 ? 'роки' : 'років'} тому`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? 'місяць' : months < 5 ? 'місяці' : 'місяців'} тому`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дні' : 'днів'} тому`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'годину' : hours < 5 ? 'години' : 'годин'} тому`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'хвилину' : minutes < 5 ? 'хвилини' : 'хвилин'} тому`;
  } else {
    return 'щойно';
  }
};

export default function UserAvatar({ userData, showEmailButton = true, showUserBadge = true }) {
  const { theme } = useTheme();
  const [showEmail, setShowEmail] = useState(false);
  const [showExpandedInfo, setShowExpandedInfo] = useState(false);

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
        <UsernameContainer>
          <Username>{userData.username}</Username>
          {showUserBadge && (
            <UserBadge>
              <UserBadgeText>{userData.role}</UserBadgeText>
            </UserBadge>
          )}
        </UsernameContainer>

        {/* Activity info block */}
        <ActivityInfoContainer 
          activeOpacity={1}
          onPress={() => {
            if (!showExpandedInfo) {
              setShowExpandedInfo(true);
            }
          }}
        >
          <ActivityInfoRow>
            <ActivityTextGray>
              був(ла) в мережі {userData.updated ? formatTimeAgo(userData.updated) : 'невідомо'}
            </ActivityTextGray>
            {!showExpandedInfo && <AntDesign name="right" size={16} color={theme.colors.gray} />}
          </ActivityInfoRow>
          {showExpandedInfo && userData.active && (
            <ActivityInfoRow>
              <ActivityTextGray style={{ marginTop: 4 }}>
                у числі учасників з {userData.created ? new Date(userData.created * 1000).toLocaleDateString('uk-UA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'невідомо'}
              </ActivityTextGray>
            </ActivityInfoRow>
          )}
        </ActivityInfoContainer>

        {showEmailButton && (
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
        )}

        {userData.description ? (
          <Description>{userData.description}</Description>
        ) : null}
      </ColumnInfo>
    </>
  );
}
