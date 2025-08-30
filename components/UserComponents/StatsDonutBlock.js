import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components/native';
import Svg, { Circle, G } from 'react-native-svg';
import { TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  border-radius: 16px;
  width: 100%;
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
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${({ color }) => color};
  margin-right: 6px;
`;

const LegendText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const DonutWrapper = styled.View`
  align-items: center;
  width: 120px;
  height: 120px;
`;

/* ====== ProgressRing компонент ====== */
const ProgressRing = ({ data, size = 100, strokeWidth = 25, rotation = 0, isDark = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Фоновий колір кільця
  const backgroundColor = isDark ? '#374151' : '#e5e7eb';
  
  let currentAngle = rotation;
  
  return (
    <Svg width={size} height={size}>
      {/* Фонове кільце */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="transparent"
        opacity={0.3}
      />
      
      {/* Сегменти даних */}
      {data.map((segment, index) => {
        const percentage = segment.percentage;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        
        // Обчислюємо координати для дуги
        const startX = center + radius * Math.cos((startAngle - 90) * Math.PI / 180);
        const startY = center + radius * Math.sin((startAngle - 90) * Math.PI / 180);
        const endX = center + radius * Math.cos((endAngle - 90) * Math.PI / 180);
        const endY = center + radius * Math.sin((endAngle - 90) * Math.PI / 180);
        
        // Визначаємо чи потрібна велика дуга
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        // Створюємо path для дуги
        const pathData = [
          `M ${startX} ${startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
        ].join(' ');
        
        currentAngle += angle;
        
                 return (
           <Circle
             key={index}
             cx={center}
             cy={center}
             r={radius}
             stroke={segment.color}
             strokeWidth={strokeWidth}
             fill="transparent"
             strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
             strokeDashoffset={-((currentAngle - angle - rotation) / 360) * circumference}
             strokeLinecap="butt"
             transform={`rotate(${rotation}, ${center}, ${center})`}
           />
         );
      })}
    </Svg>
  );
};

/* ====== головний блок ====== */
const StatsDonutBlock = ({ stats }) => {
    const { theme, isDark } = useTheme();
    const [rotation, setRotation] = useState(0);
    const [lastRotation, setLastRotation] = useState(0);
    
    // Ключ для сохранения положения круга
    const ROTATION_STORAGE_KEY = 'stats_donut_rotation';
    
    // Загружаем сохраненное положение при монтировании компонента
    useEffect(() => {
        loadSavedRotation();
    }, []);
    
    // Сохраняем положение при изменении
    useEffect(() => {
        saveRotation(rotation);
    }, [rotation]);
    
    const loadSavedRotation = async () => {
        try {
            const savedRotation = await AsyncStorage.getItem(ROTATION_STORAGE_KEY);
            if (savedRotation !== null) {
                const parsedRotation = parseFloat(savedRotation);
                setRotation(parsedRotation);
                setLastRotation(parsedRotation);
            }
        } catch (error) {
            console.log('Ошибка при загрузке положения круга:', error);
        }
    };
    
    const saveRotation = async (newRotation) => {
        try {
            await AsyncStorage.setItem(ROTATION_STORAGE_KEY, newRotation.toString());
        } catch (error) {
            console.log('Ошибка при сохранении положения круга:', error);
        }
    };
    
  // підготуємо дані
  const { watching, planned, completed, on_hold, dropped } = stats;

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

  // фільтруємо тільки категорії зі значеннями більше 0
  const filteredData = data.filter(d => d.value > 0);
  
  // обчислюємо загальну суму та відсотки
  const total = filteredData.reduce((sum, d) => sum + d.value, 0) || 1;
  
  // підготовка даних для ProgressRing
  const ringData = useMemo(() => {
    return filteredData.map((item) => {
      const percentage = (item.value / total) * 100;
      // Мінімальна ширина 2% для малих значень
      const minWidth = 2;
      const adjustedPercentage = percentage < minWidth && percentage > 0 ? minWidth : percentage;
      
      return {
        color: item.color,
        percentage: adjustedPercentage,
        originalValue: item.value,
      };
    });
  }, [filteredData, total]);

  const onGestureEvent = (event) => {
    const { translationX, translationY } = event.nativeEvent;
    const angle = Math.atan2(translationY, translationX) * (180 / Math.PI);
    setRotation(lastRotation + angle);
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      setLastRotation(rotation);
    }
  };

  return (
    <Card>
        <RowLineHeader title='Статистика'/>

      <LegendRow>
        {/* Легенда */}
        <LegendList>
          {filteredData.map((d) => (
            <LegendItem key={d.label}>
              <ColorDot color={d.color} />
              <LegendText>
                {d.label}{' '}
                <LegendText style={{ color: theme.colors.text }}>{d.value}</LegendText>
              </LegendText>
            </LegendItem>
          ))}
        </LegendList>

        {/* ProgressRing */}
        <DonutWrapper>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <TouchableOpacity activeOpacity={1}>
              <ProgressRing 
                data={ringData} 
                size={115} 
                strokeWidth={25} 
                rotation={rotation} 
                isDark={isDark} 
              />
            </TouchableOpacity>
          </PanGestureHandler>
        </DonutWrapper>
      </LegendRow>
      
    </Card>
  );
};

export default StatsDonutBlock;
