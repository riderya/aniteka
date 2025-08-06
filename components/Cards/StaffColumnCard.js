import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import avatarFallback from '../../assets/image/image404.png';
import { useNavigation } from '@react-navigation/native';

const StaffCard = styled.View`
  margin-right: ${({ marginRight }) => marginRight || '15px'};
  width: ${({ cardWidth }) => typeof cardWidth === 'string' ? cardWidth : `${cardWidth}px`};
`;

const StaffImage = styled.Image`
  width: ${({ imageWidth }) => typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px`};
  height: ${({ imageHeight }) => typeof imageHeight === 'string' ? imageHeight : `${imageHeight}px`};
  border-radius: ${({ borderRadius }) => borderRadius || 24}px;
`;

const StaffName = styled.Text`
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const RoleText = styled.Text`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.gray};
`;

const StaffColumnCard = ({
  person,
  roles = [],
  cardWidth = '90px',
  imageWidth = '90px',
  imageHeight = '120px',
  borderRadius = 24,
  marginRight = '15px',
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AnimePeopleDetailsScreen', {
          slug: person.slug,
        })
      }
    >
      <StaffCard cardWidth={cardWidth} marginRight={marginRight}>
        <StaffImage
          source={
            person?.image?.trim()
              ? { uri: person.image }
              : avatarFallback
          }
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          borderRadius={borderRadius}
        />
        {roles.length > 0 && (
          <RoleText numberOfLines={1}>
            {roles[0].name_ua || roles[0].name_en}
          </RoleText>
        )}
        <StaffName numberOfLines={1}>
          {person.name_ua || person.name_en}
        </StaffName>
      </StaffCard>
    </TouchableOpacity>
  );
};

export default StaffColumnCard;
