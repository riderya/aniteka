import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import MarkdownText from '../Custom/MarkdownText';

const Card = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
`;

const AvatarWrapper = styled.View`
  position: relative;
  overflow: visible;
`;

const UserImage = styled.Image`
  width: ${({ imageWidth }) => imageWidth || 90}px;
  height: ${({ imageHeight }) => imageHeight || 120}px;
  border-radius: ${({ imageBorderRadius }) => imageBorderRadius || 16}px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const StatusCircle = styled.View`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background-color: ${({ active }) => (active ? '#16a34a' : '#94a3b8')};
  border-width: 3px;
  border-color: ${({ theme }) => theme.colors.background};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const UsernameContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ fontSize }) => fontSize || '16px'};
  font-weight: bold;
`;

const UserBadge = styled.View`
  background-color: ${({ theme }) => `${theme.colors.primary}20`};
  padding: 4px 8px;
  border-radius: 12px;
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ fontSize }) => fontSize || '14px'};
  margin-top: 4px;
`;

const RowInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const Role = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
`;

const StyledDot = styled(FontAwesome)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 4px;
`;

// Function to render role icon
const getRoleIcon = (role, theme) => {
  switch (role?.toLowerCase()) {
    case 'admin':
    case 'адмін':
    case 'administrator':
      return <MaterialIcons name="admin-panel-settings" size={16} color={theme.colors.primary} />;
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

const UserCardItem = ({ 
  user, 
  imageBorderRadius = 16,
  imageWidth = 90,
  imageHeight = 120,
  usernameFontSize = '16px',
  descriptionFontSize = '14px'
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const parsedDescFont = typeof descriptionFontSize === 'string' 
    ? parseInt(descriptionFontSize, 10) 
    : descriptionFontSize;
  const lineHeight = Math.round((parsedDescFont || 14) * 1.35);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('UserProfileScreen', {
          username: user.username,
        })
      }
    >
      <Card>
        <AvatarWrapper>
          <UserImage
            source={{ uri: user.avatar }}
            imageBorderRadius={imageBorderRadius}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
          />
          <StatusCircle active={user.active} />
        </AvatarWrapper>
        <Info>
          <UsernameContainer>
            <Username fontSize={usernameFontSize} numberOfLines={1}>
              {user.username}
            </Username>
            {shouldShowRoleBadge(user.role) && (
              <UserBadge>
                {getRoleIcon(user.role, theme)}
              </UserBadge>
            )}
          </UsernameContainer>
          <Description fontSize={descriptionFontSize}>
            <React.Fragment>
              <MarkdownText 
                disableLinks={true}
                style={{
                  body: {
                    color: theme.colors.gray,
                    fontSize: parsedDescFont || 14,
                    lineHeight,
                  }
                }}
              >
                {user.description || ''}
              </MarkdownText>
            </React.Fragment>
          </Description>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default UserCardItem;
