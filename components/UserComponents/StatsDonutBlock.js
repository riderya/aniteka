import React, { useMemo } from 'react';
import styled from 'styled-components/native';
import Svg, { Circle } from 'react-native-svg';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import RowLineHeader from '../../components/DetailsAnime/RowLineHeader';

/* ====== дані кольорів ====== */
const palette = {
  watching:  '#10b981', // зелений
  planned:   '#a855f7', // фіолетовий
  completed: '#2563eb', // синій
  on_hold:   '#f59e0b', // оранжевий
  dropped:   '#ef4444', // червоний
};

/* ====== styled‑components ====== */
const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  width: 100%;
  margin-top: 15px;
  padding: 12px 0px;
`;

const LegendRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0px 12px;
  margin-top: -8px;
`;

const LegendList = styled.View`
  flex: 1;
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const ColorDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: ${({ color }) => color};
  margin-right: 6px;
`;

const LegendText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const DonutWrapper = styled.View`
`;

/* ====== компонент Donut ====== */
const Donut = ({ segments, radius = 55, stroke = 25 }) => {
  const CIRCUMFERENCE = 2 * Math.PI * radius;
  const adjustedRadius = radius - stroke / 2; // Коригуємо радіус для правильного відображення

  let acc = 0;
  return (
    <Svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
      {segments.map(({ value, color }, idx) => {
        const dash = (value / 100) * CIRCUMFERENCE;
        const dashArray = `${dash} ${CIRCUMFERENCE - dash}`;
        const circle = (
          <Circle
            key={idx}
            cx={radius}
            cy={radius}
            r={adjustedRadius}
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={dashArray}
            strokeDashoffset={-acc}
            strokeLinecap="butt"
            fill="transparent"
          />
        );
        acc += dash;
        return circle;
      })}
    </Svg>
  );
};

/* ====== головний блок ====== */
const StatsDonutBlock = ({ stats }) => {
    const { theme, isDark } = useTheme();
  // підготуємо дані
  const { watching, planned, completed, on_hold, dropped } = stats;

  const total = watching + planned + completed + on_hold + dropped || 1; // щоб не ділити на 0

  const data = useMemo(
    () => [
      { label: 'Дивлюсь',     value: watching,  color: palette.watching },
      { label: 'В планах',    value: planned,   color: palette.planned },
      { label: 'Переглянуто', value: completed, color: palette.completed },
      { label: 'Відкладено',  value: on_hold,   color: palette.on_hold },
      { label: 'Закинуто',    value: dropped,   color: palette.dropped },
    ],
    [watching, planned, completed, on_hold, dropped]
  );

  // масив секторів у відсотках
  const segments = data.map((d) => ({
    color: d.color,
    value: (d.value / total) * 100,
  }));

  return (
    <Card>
        <RowLineHeader title='Статистика'/>

      <LegendRow>
        {/* Легенда */}
        <LegendList>
          {data.map((d) => (
            <LegendItem key={d.label}>
              <ColorDot color={d.color} />
              <LegendText>
                {d.label}{' '}
                <LegendText style={{ color: theme.colors.text }}>{d.value}</LegendText>
              </LegendText>
            </LegendItem>
          ))}
        </LegendList>

        {/* Donut */}
        <DonutWrapper>
          <Donut segments={segments} />
        </DonutWrapper>
      </LegendRow>
      
    </Card>
  );
};

export default StatsDonutBlock;
