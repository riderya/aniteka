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

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getStatusColors = (theme) => ({
  watching: hexToRgba(theme.colors.watching, 0.8),
  planned: hexToRgba(theme.colors.planned, 0.8),
  completed: hexToRgba(theme.colors.completed, 0.8),
  on_hold: hexToRgba(theme.colors.on_hold, 0.8),
  dropped: hexToRgba(theme.colors.dropped, 0.8),
});

const AnimeColumnCard = ({
  anime,
  onPress,
  cardWidth = 140,
  imageWidth = 140,
  imageHeight = 190,
  titleFontSize = 14,
  footerFontSize = 12,
  badgeFontSize = 14,
  badgePadding = 4,
}) => {
  const { theme } = useTheme();
  const statusColors = getStatusColors(theme);

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
          {statuses.map((status) => (
            <StatusBadge
              key={status}
              color={statusColors[status] || '#666'}
              badgePadding={badgePadding}
            >
              <StatusText badgeFontSize={badgeFontSize}>
                {statusLabels[status] || status}
              </StatusText>
            </StatusBadge>
          ))}
        </PosterWrapper>

        <Title numberOfLines={2} cardWidth={cardWidth} titleFontSize={titleFontSize}>
          {anime.title_ua || anime.title_en || anime.title_ja || '?'}
        </Title>

        <RowFooter>
          <TextFooter footerFontSize={footerFontSize}>
            {anime.episodes_released ?? '?'} з {anime.episodes_total ?? '?'} еп
          </TextFooter>
          <StyledIcon name="circle" size={4} />
          <TextFooter footerFontSize={footerFontSize}>
            {anime.score ?? '?'}
          </TextFooter>
        </RowFooter>
      </Item>
    </TouchableOpacity>
  );
};

export default AnimeColumnCard;

// styled components

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
  font-size: ${({ titleFontSize }) => titleFontSize}px;
  width: ${({ cardWidth }) => cardWidth}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const StatusBadge = styled.View`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background-color: ${({ color }) => color};
  padding: ${({ badgePadding }) => badgePadding}px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const StatusText = styled.Text`
  color: white;
  font-size: ${({ badgeFontSize }) => badgeFontSize}px;
  font-weight: 500;
`;

const RowFooter = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

const TextFooter = styled.Text`
  font-size: ${({ footerFontSize }) => footerFontSize}px;
  color: ${({ theme }) => theme.colors.gray};
`;

const StyledIcon = styled(FontAwesome)`
  color: ${({ theme }) => theme.colors.gray};
`;
