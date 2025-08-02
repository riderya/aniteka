import React from 'react';
import styled from 'styled-components/native';

const FollowStats = styled.View`
  margin: 12px 0px;
  flex-direction: row;
  justify-content: center;
`;

const StatItem = styled.View`
  align-items: center;
  flex: 1;
`;

const StatCount = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
`;

export default function FollowStatsBlock({ stats }) {
  return (
    <FollowStats>
      <StatItem>
        <StatCount>{stats.followers}</StatCount>
        <StatLabel>стежать</StatLabel>
      </StatItem>
      <StatItem>
        <StatCount>{stats.following}</StatCount>
        <StatLabel>відстежується</StatLabel>
      </StatItem>
    </FollowStats>
  );
}
