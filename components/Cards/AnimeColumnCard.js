import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const media_Type = {
  tv: 'ТБ-серіал',
  movie: 'Фільм',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Спешл',
  music: 'Музичне',
};

const statusLabels = {
  watching: 'Дивлюсь',
  planned: 'В планах',
  completed: 'Переглянуто',
  on_hold: 'Відкладено',
  dropped: 'Закинуто',
};

const AnimeColumnCard = ({
  anime,
  status,
  onPress,
  cardWidth = 140,
  imageWidth = 140,    // новий пропс для ширини постера
  imageHeight = 190,
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress}>
      <Item cardWidth={cardWidth}>
        <PosterWrapper>
          <Poster
            source={{ uri: anime.image }}
            resizeMode="cover"
            imageWidth={imageWidth}       // передаємо ширину
            imageHeight={imageHeight}
          />
          {status && (
            <StatusText status={status}>
              {statusLabels[status] || status}
            </StatusText>
          )}
        </PosterWrapper>
        <Title numberOfLines={2}>
          {anime.title_ua || anime.title_en || anime.title_ja || '?'}
        </Title>
        <RowFooter>
          <TextFooter>{media_Type[anime.media_type]}</TextFooter>
          <TextFooter>
            {anime.episodes_released || '?'}/
            {anime.episodes_total || '?'}еп
          </TextFooter>
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
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const RowFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

const TextFooter = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
`;

const StatusText = styled.Text`
  position: absolute;
  bottom: 5px;
  align-self: center;
  min-width: 90%;
  max-width: 90%;
  padding: 4px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  border-radius: 999px;
  text-align: center;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'watching':
        return `${theme.colors.watching}B3`;
      case 'planned':
        return `${theme.colors.planned}B3`;
      case 'dropped':
        return `${theme.colors.dropped}B3`;
      case 'on_hold':
        return `${theme.colors.on_hold}B3`;
      case 'completed':
        return `${theme.colors.completed}B3`;
      case 'favourite':
        return `${theme.colors.favourite}B3`;
      default:
        return 'rgba(51, 51, 51, 0.7)';
    }
  }};
`;
