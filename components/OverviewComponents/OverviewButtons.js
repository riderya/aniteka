import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { AntDesign, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';

const buttonsData = [
  { key: 'popular', label: 'Популярні', iconName: 'star', iconLib: AntDesign },
  { key: 'schedule', label: 'Розклад', iconName: 'schedule', iconLib: MaterialIcons },
  { key: 'collections', label: 'Колекції', iconName: 'folder', iconLib: Entypo },
  { key: 'filter', label: 'Фільтр', iconName: 'filter', iconLib: Ionicons },
  { key: 'random', label: 'Рандом', iconName: 'reload1', iconLib: AntDesign },
  { key: 'articles', label: 'Статті', iconName: 'article', iconLib: MaterialIcons },
];

const OverviewButtons = () => {
  const theme = useTheme();

  return (
    <Container>
      {buttonsData.map(({ key, label, iconName, iconLib: Icon }) => (
        <Button key={key} activeOpacity={0.7}>
          <IconWrapper>
            <Icon name={iconName} size={20} color={theme.colors.text} />
          </IconWrapper>
          <ButtonText>{label}</ButtonText>
        </Button>
      ))}
    </Container>
  );
};

export default OverviewButtons;

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0px 12px;
  margin-top: 20px;
`;

const Button = styled.TouchableOpacity`
  width: 48%;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0px 24px;
  height: 50px;
  margin: 6px 0px;
  border-radius: 999px;
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled.View`
  margin-right: 10px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;
