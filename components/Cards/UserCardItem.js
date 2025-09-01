import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Card = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
`;

const UserImage = styled.Image`
  width: ${({ imageWidth }) => imageWidth || 90}px;
  height: ${({ imageHeight }) => imageHeight || 120}px;
  border-radius: ${({ imageBorderRadius }) => imageBorderRadius || 16}px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ fontSize }) => fontSize || '16px'};
  font-weight: bold;
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

const UserCardItem = ({ 
  user, 
  imageBorderRadius = 16,
  imageWidth = 90,
  imageHeight = 120,
  usernameFontSize = '16px',
  descriptionFontSize = '14px'
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('UserProfileScreen', {
          username: user.username,
        })
      }
    >
      <Card>
        <UserImage
          source={{ uri: user.avatar || 'https://i.imgur.com/R8uKmI0.png' }}
          imageBorderRadius={imageBorderRadius}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
        <Info>
          <Username fontSize={usernameFontSize} numberOfLines={1}>
            {user.username}
          </Username>
          <Description fontSize={descriptionFontSize} numberOfLines={1}>
            {user.description || 'Без опису'}
          </Description>
          <RowInfo>
            <Role>{user.role || 'Користувач'}</Role>
            {user.active && (
              <>
                <StyledDot name="circle" />
                <Role>Активний</Role>
              </>
            )}
          </RowInfo>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default UserCardItem;
