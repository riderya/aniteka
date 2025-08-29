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
  width: ${({ imageWidth }) => imageWidth || 90}px;
  height: ${({ imageHeight }) => imageHeight || 120}px;
  border-radius: ${({ imageBorderRadius }) => imageBorderRadius || 16}px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ fontSize }) => fontSize || '16px'};
  font-weight: bold;
`;

const Role = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ fontSize }) => fontSize || '14px'};
  margin-top: 4px;
`;

const StaffCardRow = ({ 
  person, 
  roles, 
  onPress, 
  imageBorderRadius = 16,
  imageWidth = 90,
  imageHeight = 120,
  nameFontSize = '16px',
  roleFontSize = '14px'
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <Image
          source={
            person?.image?.trim() ? { uri: person.image } : avatarFallback
          }
          imageBorderRadius={imageBorderRadius}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
        <Info>
          <Name fontSize={nameFontSize} numberOfLines={1}>
            {person.name_ua || person.name_en}
          </Name>
          <Role fontSize={roleFontSize} numberOfLines={2}>
            {roles.map((r) => r.name_ua || r.name_en).join(', ')}
          </Role>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default StaffCardRow;
