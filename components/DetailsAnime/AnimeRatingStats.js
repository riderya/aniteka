import React, { useState } from 'react';
import { Text, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';
import RowLineHeader from './RowLineHeader';
import AnimeRating from './AnimeRating';

const Container = styled.View`
`;

const MainRow = styled.View`
  flex-direction: row;
  margin-left: 12px;
  margin-right: 12px;
`;

const LeftCol = styled.View`
  width: 100px;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

const Average = styled.Text`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  line-height: 54px;
`;

const TotalVotes = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray};
  margin-top: 4px;
  text-align: center;
`;

const RightCol = styled.View`
  flex: 1;
  justify-content: flex-start;
`;

const BarRow = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  margin: 3px 0px;
`;

const ScoreLabel = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  width: 14px;
  font-size: 12px;
  font-weight: 500;
`;

const BarBackground = styled.View`
  flex: 1;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 6px;
  overflow: hidden;
  margin-left: 4px;
`;

const BarFill = styled.View`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  width: ${({ width }) => width || '0%'};
`;

const CountLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  text-align: right;
  font-weight: 500;
  margin-left: 10px;
  flex-shrink: 0;
`;


const AnimeRatingStats = ({ stats, score, slug }) => {
  const [activeScore, setActiveScore] = useState(null);

  if (!stats) return null;

  const scores = Array.from({ length: 10 }, (_, i) => i + 1);
  const totalVotes = scores.reduce((sum, score) => sum + (stats[`score_${score}`] || 0), 0);
  const weightedSum = scores.reduce((sum, score) => sum + score * (stats[`score_${score}`] || 0), 0);

  const filteredScores = scores.filter(score => (stats[`score_${score}`] || 0) > 0);
  const displayScores = scores.sort((a, b) => b - a);
  displayScores.sort((a, b) => b - a);

  const onPressScore = (score) => {
    setActiveScore(prev => (prev === score ? null : score));
  };

  return (
    <Container>
      <RowLineHeader
        title="Оцінки"
      />
      <MainRow>
        <LeftCol>
        <Average>{(Math.floor(score * 10) / 10).toFixed(1)}</Average>
          <TotalVotes>{totalVotes.toLocaleString()} голосів</TotalVotes>
        </LeftCol>

        <RightCol>
          {displayScores.map((score) => {
            const count = stats[`score_${score}`] || 0;
            const percent = totalVotes === 0 ? 0 : Math.max(0, Math.min(1, count / totalVotes));
            const isActive = activeScore === score;

            return (
              <BarRow key={score} activeOpacity={0.7} onPress={() => onPressScore(score)}>
                <ScoreLabel>{score}</ScoreLabel>
                <BarBackground>
                  <BarFill width={`${percent * 100}%`} />
                </BarBackground>
                {isActive && <CountLabel>{count}</CountLabel>}
              </BarRow>
            );
          })}
        </RightCol>
      </MainRow>

      <AnimeRating slug={slug} />
    </Container>
  );
};

export default AnimeRatingStats;
