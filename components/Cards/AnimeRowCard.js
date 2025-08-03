import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TOKEN_KEY = 'hikka_token';
import * as SecureStore from 'expo-secure-store';

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Функция для обработки базового Markdown
const parseMarkdown = (text) => {
  if (!text) return '';
  
  // Удаляем ссылки в формате [текст](url) и оставляем только текст
  let processedText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Удаляем **жирный текст** и __жирный текст__
  processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '$1');
  processedText = processedText.replace(/__([^_]+)__/g, '$1');
  
  // Удаляем *курсив* и _курсив_
  processedText = processedText.replace(/\*([^*]+)\*/g, '$1');
  processedText = processedText.replace(/_([^_]+)_/g, '$1');
  
  // Удаляем `код`
  processedText = processedText.replace(/`([^`]+)`/g, '$1');
  
  // Удаляем ~~зачеркнутый текст~~
  processedText = processedText.replace(/~~([^~]+)~~/g, '$1');
  
  // Удаляем заголовки (# ## ###)
  processedText = processedText.replace(/^#{1,6}\s+/gm, '');
  
  // Удаляем маркированные списки
  processedText = processedText.replace(/^[\s]*[-*+]\s+/gm, '');
  
  // Удаляем нумерованные списки
  processedText = processedText.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // Удаляем блоки кода
  processedText = processedText.replace(/```[\s\S]*?```/g, '');
  
  // Удаляем одиночные обратные кавычки
  processedText = processedText.replace(/`/g, '');
  
  // Удаляем лишние пробелы и переносы строк
  processedText = processedText.replace(/\n\s*\n/g, '\n').trim();
  
  return processedText;
};

const getStatusColors = (theme) => ({
  watching: hexToRgba(theme.colors.watching, 0.8),
  planned: hexToRgba(theme.colors.planned, 0.8),
  completed: hexToRgba(theme.colors.completed, 0.8),
  on_hold: hexToRgba(theme.colors.on_hold, 0.8),
  dropped: hexToRgba(theme.colors.dropped, 0.8),
});

const AnimeRowCard = ({ 
  anime,
  imageWidth = 90,
  imageHeight = 120,
  titleFontSize = 16,
  episodesFontSize = 15,
  scoreFontSize = 15,
  descriptionFontSize = 13,
  statusFontSize = 12,
  marginBottom = 20,
  isLoading = false
}) => {
  const navigation = useNavigation();
  const [isFavourite, setIsFavourite] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [animeDescription, setAnimeDescription] = useState('');
  const { theme, isDark } = useTheme();
  
  // Анимация для скелетона
  const animatedValue = useMemo(() => new Animated.Value(0), []);
  
  // Memoize status colors to prevent recalculation
  const statusColors = useMemo(() => getStatusColors(theme), [theme]);

  // Анимация скелетона
  useEffect(() => {
    if (isLoading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isLoading, animatedValue]);

  // Fetch anime description from API
  useEffect(() => {
    const fetchAnimeDescription = async () => {
      try {
        const response = await fetch(`https://api.hikka.io/anime/${anime.slug}`);
        if (response.ok) {
          const data = await response.json();
          const rawDescription = data.synopsis_ua || data.synopsis_en || 'Опис відсутній';
          const processedDescription = parseMarkdown(rawDescription);
          setAnimeDescription(processedDescription);
        } else {
          setAnimeDescription('Опис відсутній');
        }
      } catch (error) {
        setAnimeDescription('Опис відсутній');
      }
    };

    fetchAnimeDescription();
  }, [anime.slug]);

  // Перевірка фаворитів (як було)
  useEffect(() => {
    const checkFavourite = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) return;

        const res = await fetch(`https://api.hikka.io/favourite/anime/${anime.slug}`, {
          headers: { auth: token }
        });
        setIsFavourite(res.status === 200);
      } catch {
        setIsFavourite(false);
      }
    };

    checkFavourite();
  }, [anime.slug]);

  // Новий useEffect для статусу користувача з /watch/{slug}
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

  const renderWatchStatus = (status) => {
    switch (status) {
      case 'watching':
        return 'Дивлюсь';
      case 'planned':
        return 'В планах';
      case 'dropped':
        return 'Закинуто';
      case 'on_hold':
        return 'Відкладено';
      case 'completed':
        return 'Переглянуто';
      case 'favourite':
        return 'Улюблене';
      default:
        return '';
    }
  };

  const handlePress = () => {
    if (!isLoading) {
      navigation.navigate('AnimeDetails', { slug: anime.slug });
    }
  };

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (isLoading) {
    return (
      <Card marginBottom={marginBottom}>
        <ImageWrapper imageWidth={imageWidth}>
          <SkeletonImage 
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            style={{ opacity }}
          />
        </ImageWrapper>
        <Info>
          <TitleRow>
            <SkeletonTitle 
              titleFontSize={titleFontSize}
              style={{ opacity }}
            />
          </TitleRow>
          <Row>
            <SkeletonText 
              episodesFontSize={episodesFontSize}
              style={{ opacity }}
            />
            <SkeletonDot style={{ opacity }} />
            <SkeletonText 
              scoreFontSize={scoreFontSize}
              style={{ opacity }}
            />
          </Row>
          <SkeletonDescription 
            descriptionFontSize={descriptionFontSize}
            style={{ opacity }}
          />
        </Info>
      </Card>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card marginBottom={marginBottom}>
        <ImageWrapper imageWidth={imageWidth}>
          <AnimeImage 
            source={{ uri: anime.image }} 
            resizeMode="cover" 
            imageWidth={imageWidth}
            imageHeight={imageHeight}
          />
          {userStatus && (
            <StatusText 
              color={statusColors[userStatus] || '#666'} 
              statusFontSize={statusFontSize}
            >
              {renderWatchStatus(userStatus)}
            </StatusText>
          )}
        </ImageWrapper>
        <Info>
          <TitleRow>
            <AnimeTitle numberOfLines={2} titleFontSize={titleFontSize}>{anime.title_ua || anime.title_en || 'Без назви'}</AnimeTitle>
          </TitleRow>
          <Row>
            <EpisodesText episodesFontSize={episodesFontSize}>{anime.episodes_released || '?'} / {anime.episodes_total || '?'} еп</EpisodesText>
            <FontAwesome name="circle" size={6} color={theme.colors.gray} />
            <ScoreText scoreFontSize={scoreFontSize}>{anime.score || '—'}</ScoreText>
            <Octicons style={{ marginLeft: -6 }} name="star-fill" size={12} color={theme.colors.gray} />
            {isFavourite && <FavouriteMark name="heart-fill" size={24} color={theme.colors.error} />}
          </Row>

          <DescriptionText numberOfLines={3} descriptionFontSize={descriptionFontSize}>
            {animeDescription}
          </DescriptionText>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default AnimeRowCard;

// ... стилі залишаються без змін


const Card = styled.View`
  flex-direction: row;
  margin-bottom: ${({ marginBottom }) => marginBottom}px;
  align-items: flex-start;
`;

const ImageWrapper = styled.View`
  position: relative;
  width: ${({ imageWidth }) => imageWidth}px;
  margin-right: 15px;
`;

const AnimeImage = styled.Image`
  width: ${({ imageWidth }) => imageWidth}px;
  height: ${({ imageHeight }) => imageHeight}px;
  border-radius: 12px;
`;

const Info = styled.View`
  flex: 1;
  justify-content: flex-start;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AnimeTitle = styled.Text`
  font-size: ${({ titleFontSize }) => titleFontSize}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
`;

const StatusText = styled.Text`
  position: absolute;
  text-align: center;
  bottom: 5px;
  left: 5px;
  right: 5px;
  padding: 4px;
  font-size: ${({ statusFontSize }) => statusFontSize}px;
  font-weight: 500;
  color: #fff;
  border-radius: 8px;
  background-color: ${({ color }) => color || 'rgba(51, 51, 51, 0.7)'};
`;



const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const EpisodesText = styled.Text`
  font-size: ${({ episodesFontSize }) => episodesFontSize}px;
  color: ${({ theme }) => theme.colors.gray};
`;

const ScoreText = styled.Text`
  font-size: ${({ scoreFontSize }) => scoreFontSize}px;
  color: ${({ theme }) => theme.colors.gray};
`;

const FavouriteMark = styled(Octicons)`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.error};
  margin-left: 8px;
`;

const DescriptionText = styled.Text`
  font-size: ${({ descriptionFontSize }) => descriptionFontSize}px;
  color: ${({ theme }) => theme.colors.gray};
`;

// Скелетон компоненти
const SkeletonImage = styled(Animated.View)`
  width: ${({ imageWidth }) => imageWidth}px;
  height: ${({ imageHeight }) => imageHeight}px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SkeletonTitle = styled(Animated.View)`
  width: 80%;
  height: ${({ titleFontSize }) => titleFontSize * 1.2}px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  margin-bottom: 6px;
`;

const SkeletonText = styled(Animated.View)`
  width: 60px;
  height: ${({ episodesFontSize }) => episodesFontSize}px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
`;

const SkeletonDot = styled(Animated.View)`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SkeletonDescription = styled(Animated.View)`
  width: 100%;
  height: ${({ descriptionFontSize }) => descriptionFontSize * 3.6}px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
`;
