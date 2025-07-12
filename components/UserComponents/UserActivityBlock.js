import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import RowLineHeader from '../DetailsAnime/RowLineHeader';

// Styled Components
const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px 0px;
  width: 100%;
  margin-top: 15px;
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
  background-color: ${({ theme }) => theme.colors.primary};
  height: ${props => props.height}%;
`;

const DateRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 0 4px;
  margin-top: 4px;
`;

const DateLabel = styled.Text`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
`;

const TooltipBox = styled.View`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 6px;
  padding: 6px 10px;
  align-items: center;
  width: 70px;
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
  const totalMinutes = hours * 60;
  const days = Math.floor(totalMinutes / (60 * 24));
  const hoursLeft = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return {
    main: `${days} днів ${hoursLeft} години ${minutes} хвилин`,
    suffix: `/ 1 рік`,
  };
};


const UserActivityBlock = ({ activity, animeHours = 335 }) => {
  const [tooltipIndex, setTooltipIndex] = useState(null);
  const [showAnimeTooltip, setShowAnimeTooltip] = useState(false);

  const totalDays = (animeHours / 24).toFixed(0);
  const progress = Math.min((animeHours / (365 * 24)) * 100, 100);
  const maxActions = Math.max(...activity.map(item => item.actions || 0), 1);

  const lastTimestamp = activity[activity.length - 1]?.timestamp || Date.now() / 1000;
  const futureDays = [1, 2, 3].map(i => ({
    timestamp: lastTimestamp + i * 86400,
    actions: 0,
  }));

  const extendedActivity = [...activity, ...futureDays].slice(-10);

  const barWidth = 24;
  const containerWidth = Dimensions.get('window').width - 32;
  const gap = (containerWidth - barWidth * extendedActivity.length) / (extendedActivity.length - 1);

  return (
    <>
      {/* Anime Time */}
      <Card>
        <RowLineHeader title="Час аніме"/>
        <StatRow>
          <Label>{totalDays} днів</Label>
          <Value>{animeHours} годин</Value>
        </StatRow>

        <TouchableOpacity onPress={() => setShowAnimeTooltip(!showAnimeTooltip)}>
          <View style={{ position: 'relative' }}>
            {showAnimeTooltip && (
              <AnimeTooltip>
  <AnimeTooltipText>
    {formatAnimeTime(animeHours).main}{' '}
    <AnimeTooltipSub>{formatAnimeTime(animeHours).suffix}</AnimeTooltipSub>
  </AnimeTooltipText>
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
            {extendedActivity.map((item, index) => {
              const height = (item.actions / maxActions) * 100;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setTooltipIndex(index === tooltipIndex ? null : index)}
                  style={{ alignItems: 'center', width: barWidth, position: 'relative' }}
                >
                  {tooltipIndex === index && (
                    <TooltipBox style={{ bottom: height + 10 }}>
                      <TooltipText numberOfLines={1}>{item.actions} дій</TooltipText>
                    </TooltipBox>
                  )}
                  <View style={{ height: 100, justifyContent: 'flex-end' }}>
                    <Bar height={height} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </BarContainer>

          {/* Dates under bars */}
          <DateRow>
            {extendedActivity.map((item, index) => (
              <DateLabel key={index}>
                {format(new Date(item.timestamp * 1000), 'dd.MM', { locale: uk })}
              </DateLabel>
            ))}
          </DateRow>
        </BarChartWrapper>
      </Card>
    </>
  );
};

export default UserActivityBlock;
