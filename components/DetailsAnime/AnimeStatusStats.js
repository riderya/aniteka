import React from 'react';
import { View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import RowLineHeader from './RowLineHeader';

const Container = styled.View``;

const LineGray = styled.View`
  margin: 25px 0px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const BarContainer = styled.View`
  flex-direction: row;
  height: 35px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 12px 12px;
`;

const BarSegment = styled.View`
  height: 100%;
`;

const FlexWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  margin: 0 12px;
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Dot = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 5px;
  margin-right: 6px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight: 600;
  font-size: 14px;
`;

const Score = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 14px;
`;

const getLabel = (key) => {
  switch (key) {
    case 'watching':
      return 'Дивлюсь';
    case 'planned':
      return 'В планах';
    case 'completed':
      return 'Переглянуто';
    case 'on_hold':
      return 'Відкладено';
    case 'dropped':
      return 'Закинуто';
    default:
      return key;
  }
};

const AnimeStatusStats = ({ anime }) => {
  const { colors } = useTheme();
  const stats = anime?.stats;

  if (!stats) return null;

  const segments = [
    { key: 'watching', value: stats.watching },
    { key: 'planned', value: stats.planned },
    { key: 'completed', value: stats.completed },
    { key: 'on_hold', value: stats.on_hold },
    { key: 'dropped', value: stats.dropped },
  ];

  const total = segments.reduce((acc, s) => acc + s.value, 0);

  return (
    <Container>
      <RowLineHeader title="В списках у людей" />

      <BarContainer>
        {segments.map(({ key, value }) => {
          const percent = (value / total) * 100;
          return (
            <BarSegment
              key={key}
              style={{
                width: `${percent}%`,
                backgroundColor: colors[key], // 👈 використовуємо theme
              }}
            />
          );
        })}
      </BarContainer>

      <FlexWrap>
        {segments.map(({ key, value }) => (
          <LegendItem key={key}>
            <Dot style={{ backgroundColor: colors[key] }} />
            <Label>
              {getLabel(key)} <Score>{value.toLocaleString('uk-UA')}</Score>
            </Label>
          </LegendItem>
        ))}
      </FlexWrap>

      <LineGray />
    </Container>
  );
};

export default AnimeStatusStats;
