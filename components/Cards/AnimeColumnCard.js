import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const statusLabels = {
  watching: 'Дивлюсь',
  planned: 'В планах',
  completed: 'Переглянуто',
  on_hold: 'Відкладено',
  dropped: 'Закинуто',
};

const statusColors = {
  watching: '#6c47ff',
  planned: '#ffaa00',
  completed: '#00aa00',
  on_hold: '#ff8800',
  dropped: '#ff4444',
};

const AnimeColumnCard = ({
  anime,
  onPress,
  cardWidth = 140,
  imageWidth = 140,
  imageHeight = 190,
}) => {
  const { theme } = useTheme();

  console.log('Anime watch array:', anime.watch);

  // Витягуємо унікальні статуси, якщо watch існує і має елементи
  const statuses = anime.watch && anime.watch.length > 0
    ? [...new Set(anime.watch.map((w) => w.status))]
    : [];

  return (
    <TouchableOpacity onPress={onPress}>
      <Item cardWidth={cardWidth}>
        <PosterWrapper>
          <Poster
            source={{ uri: anime.image }}
            resizeMode="cover"
            imageWidth={imageWidth}
            imageHeight={imageHeight}
          />
        </PosterWrapper>

        <Title numberOfLines={2}>
          {anime.title_ua || anime.title_en || anime.title_ja || '?'}
        </Title>

        <StatusesContainer>
          {statuses.length > 0 ? (
            statuses.map((status) => (
              <StatusBadge key={status} color={statusColors[status] || '#666'}>
                <StatusText>{statusLabels[status] || status}</StatusText>
              </StatusBadge>
            ))
          ) : null}
        </StatusesContainer>

        <RowFooter>
          <TextFooter>
            {anime.episodes_released ?? '?'} / {anime.episodes_total ?? '?'} еп
          </TextFooter>
          <StyledIcon name="circle" size={4} />
          <TextFooter>{anime.score ?? '?'}</TextFooter>
        </RowFooter>
      </Item>
    </TouchableOpacity>
  );
};

export default AnimeColumnCard;

const Item = styled.View`
  max-width: ${({ cardWidth }) => cardWidth}px;
  width: 100%;
`;

const PosterWrapper = styled.View`
  position: relative;
`;

const Poster = styled.Image`
  width: ${({ imageWidth }) => imageWidth}px;
  height: ${({ imageHeight }) => imageHeight}px;
  border-radius: 24px;
`;

const Title = styled.Text`
  margin-top: 10px;
  font-size: 14px;
  width: ${({ cardWidth }) => cardWidth}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const StatusesContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 6px;
  gap: 6px;
`;

const StatusBadge = styled.View`
  background-color: ${({ color }) => color};
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 6px;
`;

const StatusText = styled.Text`
  color: white;
  font-size: 12px;
`;

const RowFooter = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

const TextFooter = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
`;

const StyledIcon = styled(FontAwesome)`
  color: ${({ theme }) => theme.colors.gray};
`;
