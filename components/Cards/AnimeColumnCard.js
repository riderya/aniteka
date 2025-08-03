import React, { useMemo, useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

const TOKEN_KEY = 'hikka_token';

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

const AnimeColumnCard = React.memo(({
  anime,
  onPress,
  cardWidth = 140,
  imageWidth = 140,
  imageHeight = 190,
  titleFontSize = 14,
  footerFontSize = 12,
  badgeFontSize = 14,
  badgePadding = 4,
  badgeBottom = 10,
  badgeLeft = 10,
  badgeRight = 10,
  marginTop = 0,
  marginBottom = 0,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [userStatus, setUserStatus] = useState(null);
  
  // Memoize status colors to prevent recalculation
  const statusColors = useMemo(() => getStatusColors(theme), [theme]);

  // Fetch user status from API like AnimeRowCard does
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) {
          setUserStatus(null);
          return;
        }

        const res = await fetch(`https://api.hikka.io/watch/${anime.slug}`, {
          headers: { auth: token }
        });

        if (!res.ok) {
          setUserStatus(null);
          return;
        }

        const data = await res.json();
        setUserStatus(data.status || null);
      } catch {
        setUserStatus(null);
      }
    };

    fetchUserStatus();
  }, [anime.slug]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('AnimeDetails', { slug: anime.slug });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Item 
        cardWidth={cardWidth} 
        marginTop={marginTop} 
        marginBottom={marginBottom}
      >
        <PosterWrapper>
          <Poster
            source={{ uri: anime.image }}
            resizeMode="cover"
            imageWidth={imageWidth}
            imageHeight={imageHeight}
          />
          {userStatus && (
            <StatusBadge
              color={statusColors[userStatus] || '#666'}
              badgePadding={badgePadding}
              bottom={badgeBottom}
              left={badgeLeft}
              right={badgeRight}
            >
              <StatusText badgeFontSize={badgeFontSize}>
                {statusLabels[userStatus] || userStatus}
              </StatusText>
            </StatusBadge>
          )}
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
});

AnimeColumnCard.displayName = 'AnimeColumnCard';

export default AnimeColumnCard;

// styled components

const Item = styled.View`
  width: ${({ cardWidth }) => cardWidth}px;
  margin-top: ${({ marginTop }) => marginTop}px;
  margin-bottom: ${({ marginBottom }) => marginBottom}px;
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
  bottom: ${({ bottom = 10 }) => bottom}px;
  left: ${({ left = 10 }) => left}px;
  right: ${({ right = 10 }) => right}px;
  background-color: ${({ color }) => color};
  padding: 4px;
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
