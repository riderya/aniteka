import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';

const ColorSelector = () => {
  const { changePrimaryColor, theme, isDark, primaryColorIndex } = useTheme();

  const lightColors = ['#E63946', '#ff6666', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
  const darkColors = ['#C084E4', '#00E5FF', '#81C784', '#FFD54F', '#BA68C8', '#F06292'];

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
  margin-bottom: 20px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CurrentColorLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-right: 12px;
`;

const CurrentColorPreview = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ color }) => color};
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  padding: 16px 0;
  flex-wrap: wrap;
`;

const Circle = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  margin: 8px;
  background-color: ${({ color }) => color};
  border-width: ${({ active }) => (active ? 4 : 2)}px;
  border-color: ${({ active }) => (active ? '#000' : 'rgba(0,0,0,0.1)')};
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ActiveIndicator = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: #000;
  opacity: ${({ active }) => (active ? 1 : 0)};
`;
