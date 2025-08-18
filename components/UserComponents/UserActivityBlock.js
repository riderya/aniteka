import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

// Styled Components
const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 12px 0px;
  width: 100%;
`;

const StatRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  padding: 0px 12px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
`;

const Value = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
  margin-left: auto;
`;

const DaysValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
  margin-right: 8px;
`;

const ProgressBar = styled.View`
  height: 15px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
  overflow: hidden;
  margin-top: 8px;
  margin: 0px 12px;
`;

const Progress = styled.View`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  width: ${props => props.progress || 0}%;
`;

const BarChartWrapper = styled.View`
  padding: 0px 12px;
`;

const BarContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  height: 100px;
  padding: 0 4px;
  position: relative;
`;

const Bar = styled.View`
  position: relative;
  width: 15px;
  border-radius: 999px;
  background-color: ${({ theme, hasData, isToday }) => {
    if (isToday) {
      return hasData ? theme.colors.primary : 'rgba(255, 193, 7, 0.6)';
    }
    return hasData ? theme.colors.primary : 'rgba(128, 128, 128, 0.3)';
  }};
  height: ${props => props.height || 0}%;
`;

const BarBackground = styled.View`
  position: absolute;
  width: 15px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
`;



const TooltipBox = styled.View`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 6px;
  padding: 8px 12px;
  align-items: center;
  width: 90px;
  z-index: 1000;
`;

const TooltipText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  font-size: 13px;
  align-self: center;
`;

const AnimeTooltip = styled.View`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  align-items: center;
  max-width: 260px;
`;

const AnimeTooltipText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

const AnimeTooltipSub = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: 500;
`;


// Time formatter
const formatAnimeTime = (hours) => {
  if (hours === 0) {
    return {
      main: 'Немає даних про перегляд',
      suffix: '',
    };
  }
  
  const totalMinutes = hours * 60;
  const totalDays = Math.floor(totalMinutes / (60 * 24)) + 1;
  
  // Calculate months and days using more accurate calculation
  // Assuming average month length of 30.44 days (365.25 / 12)
  const averageMonthDays = 30.44;
  const months = Math.floor(totalDays / averageMonthDays);
  const days = Math.floor(totalDays % averageMonthDays);
  
  // Calculate hours and minutes from the remaining time after days
  const remainingMinutes = totalMinutes - ((totalDays - 1) * 24 * 60);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const minutes = Math.floor(remainingMinutes % 60);
  

  
  if (months > 0) {
    let monthText = 'місяців';
    if (months === 1) monthText = 'місяць';
    else if (months < 5) monthText = 'місяці';
    
    let dayText = 'днів';
    if (days === 1) dayText = 'день';
    else if (days < 5) dayText = 'дні';
    
    let hourText = 'годин';
    if (remainingHours === 1) hourText = 'година';
    else if (remainingHours < 5) hourText = 'години';
    
         return {
       main: `${months} ${monthText} ${days} ${dayText} ${remainingHours} ${hourText}`,
       suffix: `/ 1 рік`,
     };
  } else {
    let dayText = 'днів';
    if (days === 1) dayText = 'день';
    else if (days < 5) dayText = 'дні';
    
    let hourText = 'годин';
    if (remainingHours === 1) hourText = 'година';
    else if (remainingHours < 5) hourText = 'години';
    
         return {
       main: `${days} ${dayText} ${remainingHours} ${hourText}`,
       suffix: `/ 1 рік`,
     };
  }
};

// Helper function to calculate anime time display
const calculateAnimeTimeDisplay = (hours) => {
  if (hours === 0) {
    return {
      months: 0,
      days: 0,
      displayText: 'Немає даних про перегляд'
    };
  }
  
  const totalMinutes = hours * 60;
  const totalDays = Math.floor(totalMinutes / (60 * 24));
  
  // Calculate months and days using more accurate calculation
  // Assuming average month length of 30.44 days (365.25 / 12)
  const averageMonthDays = 30.44;
  const months = Math.floor(totalDays / averageMonthDays);
  const days = Math.floor(totalDays % averageMonthDays);
  
  let monthText = 'місяців';
  if (months === 1) monthText = 'місяць';
  else if (months < 5) monthText = 'місяці';
  
  let dayText = 'днів';
  if (days === 1) dayText = 'день';
  else if (days < 5) dayText = 'дні';
  
  let displayText = '';
  if (months > 0) {
    displayText = `${months} ${monthText} ${days} ${dayText}`;
  } else {
    displayText = `${days} ${dayText}`;
  }
  
  return {
    months,
    days,
    displayText
  };
};

const UserActivityBlock = ({ activity, animeHours = 0 }) => {
  const [tooltipIndex, setTooltipIndex] = useState(null);
  const [showAnimeTooltip, setShowAnimeTooltip] = useState(false);

  const animeTimeDisplay = calculateAnimeTimeDisplay(animeHours);
  const progress = Math.min((animeHours / (365 * 24)) * 100, 100);
  
  // Створюємо масив для останніх 8 днів активності
  const generateLast8Days = () => {
    const days = [];
    const now = new Date();
    
    // Показуємо останні 8 днів, включаючи сьогоднішній
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const timestamp = Math.floor(date.getTime() / 1000);
      
      // Шукаємо активність для цього дня
      const dayActivity = activity?.find(item => {
        const itemDate = new Date(item.timestamp * 1000);
        return itemDate.toDateString() === date.toDateString();
      });
      
      // Визначаємо, чи це сьогоднішній день
      const isToday = date.toDateString() === now.toDateString();
      
             days.push({
         timestamp,
         actions: dayActivity?.actions || 0,
         hasData: !!dayActivity || isToday, // Сьогоднішній день завжди має дані для відображення
         isToday
       });
    }
    
    return days;
  };

  const last8Days = generateLast8Days();
  const maxActions = Math.max(...last8Days.map(item => item.actions), 1);

  const barWidth = 24;
  const containerWidth = Dimensions.get('window').width - 32;
  const gap = (containerWidth - barWidth * last8Days.length) / (last8Days.length - 1);

  return (
    <View style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <RowLineHeader title="Час аніме"/>
        <StatRow>
          <DaysValue>{Math.floor(animeHours / 24) + 1} днів</DaysValue>
          <Value>{animeHours} годин</Value>
        </StatRow>

        <TouchableOpacity onPress={() => setShowAnimeTooltip(!showAnimeTooltip)}>
          <View style={{ position: 'relative' }}>
            {showAnimeTooltip && (
              <AnimeTooltip>
                <AnimeTooltipText>
                  {animeHours > 0 ? formatAnimeTime(animeHours).main : 'Немає даних про перегляд'}
                </AnimeTooltipText>
                {animeHours > 0 && (
                  <AnimeTooltipSub>
                    {formatAnimeTime(animeHours).suffix}
                  </AnimeTooltipSub>
                )}
              </AnimeTooltip>
            )}
            <ProgressBar>
              <Progress progress={progress} />
            </ProgressBar>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Activity */}
      <Card>
        <RowLineHeader title="Активність"/>
        <BarChartWrapper>
          <BarContainer>
                         {last8Days.map((item, index) => {
               let height = maxActions > 0 ? Math.max(0, Math.min(100, (item.actions / maxActions) * 100)) : 0;
               
               // Завжди показуємо сьогоднішній день з мінімальною висотою, навіть якщо активності немає
               if (item.isToday && height === 0) {
                 height = 5; // Мінімальна висота для сьогоднішнього дня
               }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setTooltipIndex(index === tooltipIndex ? null : index)}
                  style={{ alignItems: 'center', width: barWidth, position: 'relative' }}
                >
                                     {tooltipIndex === index && (
                     <TooltipBox style={{ bottom: height + 10 }}>
                                               <TooltipText numberOfLines={1} style={{ textAlign: 'center' }}>
                          {item.actions > 0 ? `${item.actions} дій` : 'Немає активності'}
                        </TooltipText>
                       <TooltipText numberOfLines={1} style={{ fontSize: 11, marginTop: 2, textAlign: 'center' }}>
                         {item.isToday ? 'Сьогодні' : format(new Date(item.timestamp * 1000), 'dd.MM.yyyy', { locale: uk })}
                       </TooltipText>
                     </TooltipBox>
                   )}
                                     <View style={{ height: 100, justifyContent: 'flex-end' }}>
                     <BarBackground />
                     <Bar 
                       height={height} 
                       hasData={item.hasData}
                       isToday={item.isToday}
                     />
                   </View>
                </TouchableOpacity>
              );
            })}
                     </BarContainer>
        </BarChartWrapper>
      </Card>
    </View>
  );
};

export default UserActivityBlock;
