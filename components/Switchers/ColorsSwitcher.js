import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';

const ColorSelector = () => {
  const { changePrimaryColor, theme, isDark, primaryColorIndex } = useTheme();

  const lightColors = [
    '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5',
    '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342', '#C0CA33',
    '#FDD835', '#FFB300', '#FB8C00', '#F4511E', '#6D4C41', '#9B5571',
    '#000000'
  ];
  const darkColors = [
    '#FF6F6F', '#FF66A3', '#C084E4', '#9F8CFF', '#7C8CFF', '#66B2FF',
    '#33CCFF', '#26DAD1', '#4DD0AE', '#81C784', '#AED581', '#DCE775',
    '#FFE066', '#FFCA66', '#FF9E66', '#FF7A66', '#BCAAA4', '#FF6FA5',
    '#FFFFFF'
  ];

  const colors = isDark ? darkColors : lightColors;
  const currentColor = colors[primaryColorIndex];

  return (
    <Container>
      <CurrentColorInfo>
        <CurrentColorLabel>Поточний колір:</CurrentColorLabel>
        <CurrentColorPreview color={currentColor} />
      </CurrentColorInfo>
      <Row>
        {colors.map((color, index) => (
          <TouchableOpacity key={color} onPress={() => changePrimaryColor(index)}>
            <Circle color={color} active={primaryColorIndex === index}>
              <ActiveIndicator active={primaryColorIndex === index} />
            </Circle>
          </TouchableOpacity>
        ))}
      </Row>
    </Container>
  );
};

export default ColorSelector;

const Container = styled.View`
  width: 100%;
`;

const CurrentColorInfo = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CurrentColorLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-right: 12px;
`;

const CurrentColorPreview = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({ color }) => color};
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  padding: 12px 0;
  flex-wrap: wrap;
`;

const Circle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin: 6px;
  background-color: ${({ color }) => color};
  border-width: ${({ active }) => (active ? 3 : 2)}px;
  border-color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.border)};
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
`;

const ActiveIndicator = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
  opacity: ${({ active }) => (active ? 1 : 0)};
`;
