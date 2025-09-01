import React from 'react';
import styled from 'styled-components/native';
import avatarFallback from '../../assets/image/image404.png';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Card = styled.View`
  flex-direction: row;
  margin: 6px 0px;
`;

const CompanyImage = styled.Image`
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

const AltName = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ fontSize }) => fontSize || '14px'};
  margin-top: 4px;
`;

const CompanyCardItem = ({ 
  company, 
  imageBorderRadius = 16,
  imageWidth = 90,
  imageHeight = 120,
  nameFontSize = '16px',
  altNameFontSize = '14px'
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CompanyDetailScreen', {
          slug: company.slug,
        })
      }
    >
      <Card>
        <CompanyImage
          source={company.image ? { uri: company.image } : avatarFallback}
          imageBorderRadius={imageBorderRadius}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
        <Info>
          <Name fontSize={nameFontSize} numberOfLines={2}>
            {company.name}
          </Name>
          <AltName fontSize={altNameFontSize} numberOfLines={1}>
            {company.name || '?'}
          </AltName>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default CompanyCardItem;
