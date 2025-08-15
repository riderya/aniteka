import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getUserActiveItems, getShopItems } from '../../utils/supabase';

const AvatarWrapper = styled.View`
  position: relative;
  overflow: visible;
`;

const AvatarImage = styled.Image`
  width: 140px;
  height: 140px;
  border-radius: 999px;
  border-width: 6px;
  border-color: ${({ theme }) => theme.colors.background || '#f5f7fa'};
  background-color: ${({ theme }) => theme.colors.border || '#dbeafe'};
`;

const AvatarOverlay = styled.Image`
  position: absolute;
  top: -6px;
  left: -6px;
  width: 152px;
  height: 152px;
  z-index: 99;
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

const UserBadge = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  position: relative;
`;

const UserBadgeText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const TooltipContainer = styled.View`
  position: absolute;
  top: -50px;
  left: -60px;
  background-color: ${({ theme }) => theme.colors.text};
  padding: 8px 12px;
  border-radius: 8px;
  z-index: 1000;
  min-width: 120px;
  width: auto;
  align-items: center;
  flex-shrink: 0;
`;

const TooltipText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  flex-shrink: 0;
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
  margin-bottom: 10px;
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

// Function to render role icon
const getRoleIcon = (role, theme) => {
  switch (role?.toLowerCase()) {
    case 'admin':
    case 'адмін':
    case 'administrator':
      return <MaterialIcons name="admin-panel-settings" size={16} color="#ffffff" />;
    case 'moderator':
    case 'модератор':
    case 'mod':
      return <MaterialIcons name="verified-user" size={16} color="#ffffff" />;
    default:
      return null; // Для звичайних користувачів нічого не показуємо
  }
};

// Function to check if user should have badge
const shouldShowRoleBadge = (role) => {
  const validRoles = ['admin', 'адмін', 'administrator', 'moderator', 'модератор', 'mod'];
  return validRoles.includes(role?.toLowerCase());
};

// Function to get role text for tooltip
const getRoleText = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
    case 'адмін':
    case 'administrator':
      return 'Адміністратор';
    case 'moderator':
    case 'модератор':
    case 'mod':
      return 'Модератор';
    default:
      return '';
  }
};

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
  const { userData: currentUser } = useAuth();
  const [showEmail, setShowEmail] = useState(false);
  const [showExpandedInfo, setShowExpandedInfo] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);

  // Завантаження активного оверлею
  useEffect(() => {
    const loadActiveOverlay = async () => {
      if (currentUser?.reference) {
        try {
          const activeItems = await getUserActiveItems(currentUser.reference);
          
                     if (activeItems && activeItems.avatar_overlay_id) {
             
             const overlayItems = await getShopItems(null, 'avatar_overlay');
             
             const activeOverlayItem = overlayItems.find(item => item.id === activeItems.avatar_overlay_id);
             
             if (activeOverlayItem) {
       
               setActiveOverlay(activeOverlayItem);
             } else {
               
               setActiveOverlay(null);
             }
           } else {
             
             setActiveOverlay(null);
           }
        } catch (error) {
          
          setActiveOverlay(null);
        }
      } else {
        setActiveOverlay(null);
      }
    };

    loadActiveOverlay();
  }, [currentUser?.reference]);

  // Auto-hide tooltip after 3 seconds
  useEffect(() => {
    if (showTooltip) {
      const timeout = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [showTooltip]);

  return (
    <>
      <AvatarWrapper>
        <AvatarImage
          source={
            userData.avatar
              ? { uri: userData.avatar }
              : require('../../assets/image/noSearchImage.png')
          }
          resizeMode="cover"
        />
        {activeOverlay && 
         activeOverlay.image_url && 
         activeOverlay.is_active !== false && (
          <AvatarOverlay
            source={{ uri: activeOverlay.image_url }}
            resizeMode="cover"
          />
        )}
        <StatusCircle active={userData.active} />
      </AvatarWrapper>

      <ColumnInfo>
        <UsernameContainer>
          <Username>{userData.username}</Username>
          {showUserBadge && shouldShowRoleBadge(userData.role) && (
            <UserBadge 
              onPress={() => setShowTooltip(!showTooltip)}
              activeOpacity={0.8}
            >
              {getRoleIcon(userData.role, theme)}
              {showTooltip && (
                <TooltipContainer 
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <TooltipText>{getRoleText(userData.role)}</TooltipText>
                </TooltipContainer>
              )}
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

        {userData.description ? (
          <Description>{userData.description}</Description>
        ) : null}

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

      </ColumnInfo>
    </>
  );
}
