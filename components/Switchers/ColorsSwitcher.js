import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';

const ColorSelector = () => {
  const { changePrimaryColor, theme, isDark, primaryColorIndex } = useTheme();

  const lightColors = ['#9A60AC', '#ff6666', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
  const darkColors = ['#C084E4', '#00E5FF', '#81C784', '#FFD54F', '#BA68C8', '#F06292'];

  const colors = isDark ? darkColors : lightColors;

  return (
    <Row>
      {colors.map((color, index) => (
        <TouchableOpacity key={color} onPress={() => changePrimaryColor(index)}>
          <Circle color={color} active={primaryColorIndex === index} />
        </TouchableOpacity>
      ))}
    </Row>
  );
};

export default ColorSelector;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  padding: 16px 0;
  flex-wrap: wrap;
`;

const Circle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin: 8px;
  background-color: ${({ color }) => color};
  border-width: ${({ active }) => (active ? 3 : 1)}px;
  border-color: ${({ active }) => (active ? '#000' : '#ccc')};
`;
