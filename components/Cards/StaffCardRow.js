// components/Cards/StaffItemCard.js
import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import avatarFallback from '../../assets/image/image404.png';

const Card = styled.View`
  flex-direction: row;
  margin: 6px 12px;
`;

const Image = styled.Image`
  width: 80px;
  height: 100px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
`;

const Role = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  margin-top: 4px;
`;

const StaffCardRow = ({ person, roles, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <Image
          source={
            person?.image?.trim() ? { uri: person.image } : avatarFallback
          }
        />
        <Info>
          <Name numberOfLines={1}>
            {person.name_ua || person.name_en}
          </Name>
          <Role numberOfLines={2}>
            {roles.map((r) => r.name_ua || r.name_en).join(', ')}
          </Role>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default StaffCardRow;
