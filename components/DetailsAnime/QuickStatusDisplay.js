import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useWatchStatus } from '../../context/WatchStatusContext';

const QuickStatusDisplay = ({ slug }) => {
  const { theme } = useTheme();
  const { getAnimeStatus, getAnimeFavourite } = useWatchStatus();

  const status = getAnimeStatus(slug);
  const isFavourite = getAnimeFavourite(slug);

  const statusApiMapping = {
    'Не дивлюсь': null,
    Дивлюсь: 'watching',
    'В планах': 'planned',
    Переглянуто: 'completed',
    Відкладено: 'on_hold',
    Закинуто: 'dropped',
  };

  const statusColors = {
    Дивлюсь: theme.colors.watching,
    'В планах': theme.colors.planned,
    Переглянуто: theme.colors.completed,
    Відкладено: theme.colors.on_hold,
    Закинуто: theme.colors.dropped,
    'Не дивлюсь': theme.colors.gray,
  };

  const statusBorderColors = {
    Дивлюсь: theme.colors.watching,
    'В планах': theme.colors.planned,
    Переглянуто: theme.colors.completed,
    Відкладено: theme.colors.on_hold,
    Закинуто: theme.colors.dropped,
    'Не дивлюсь': theme.colors.border,
  };

  // Знаходимо UI статус за API статусом
  const getUiStatus = (apiStatus) => {
    if (!apiStatus) return 'Не дивлюсь';
    return Object.keys(statusApiMapping).find(
      (k) => statusApiMapping[k] === apiStatus,
    ) || 'Не дивлюсь';
  };

  const uiStatus = getUiStatus(status);

  return (
    <Container>
      <StatusIndicator borderColor={statusBorderColors[uiStatus]}>
        <StatusText color={statusColors[uiStatus]}>{uiStatus}</StatusText>
      </StatusIndicator>
      
      {isFavourite && (
        <FavouriteIndicator>
          <Ionicons
            name="heart"
            size={16}
            color={theme.colors.favourite}
          />
        </FavouriteIndicator>
      )}
    </Container>
  );
};

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.View`
  padding: 4px 8px;
  border-width: 1px;
  border-radius: 12px;
  border-color: ${({ borderColor }) => borderColor};
`;

const StatusText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ color }) => color};
`;

const FavouriteIndicator = styled.View`
  padding: 4px;
`;

export default QuickStatusDisplay;
