import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useWatchStatus } from '../../context/WatchStatusContext';
import PropTypes from 'prop-types';
import { Animated, Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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

// Функція для форматування сезону українською
const formatSeason = (season) => {
  switch (season?.toLowerCase()) {
    case 'winter': return 'зима';
    case 'spring': return 'весна';
    case 'summer': return 'літо';
    case 'fall':
    case 'autumn': return 'осінь';
    default: return season;
  }
};

// Функція для перекладу статусу аніме
const translateStatus = (status) => {
  switch (status) {
    case 'watching': return 'Дивлюсь';
    case 'planned': return 'В планах';
    case 'completed': return 'Переглянуто';
    case 'on_hold': return 'Відкладено';
    case 'dropped': return 'Закинуто';
    case 'favourite': return 'Улюблене';
    default: return status;
  }
};

// Функція для форматування дії історії
const formatHistoryAction = (historyData) => {
  if (!historyData) return null;
  
  const { history_type, data } = historyData;
  const after = data?.after;
  const ep = after?.episodes;
  const list = after?.status;
  const score = after?.score;

  const mapListStatus = (key) => {
    switch (key) {
      case 'planned': return 'В планах';
      case 'watching': return 'Дивлюсь';
      case 'completed': return 'Переглянуто';
      case 'on_hold': return 'Відкладено';
      case 'dropped': return 'Закинуто';
      default: return key;
    }
  };

  switch (history_type) {
    case 'watch':
      if (list && ep && ep > 0) {
        const statusText = mapListStatus(list);
        return `${statusText}, Переглянуто ${ep} епізод${ep === 1 ? '' : ep < 5 ? 'и' : 'ів'}`;
      }
      if (ep && ep > 0) {
        return `Переглянуто ${ep} епізод${ep === 1 ? '' : ep < 5 ? 'и' : 'ів'}`;
      }
      if (list) {
        return mapListStatus(list);
      }
      return 'Дивлюсь';
    case 'list':
      if (list) {
        return mapListStatus(list);
      }
      return 'Змінено список';
    case 'score':
      if (score) {
        return `Оцінено на ${score}`;
      }
      return 'Оцінено';
    case 'favorite':
      return 'Додано до улюблених';
    case 'unfavorite':
      return 'Видалено з улюблених';
    default:
      return mapListStatus(history_type) || 'Активність';
  }
};

const AnimeRowCard = React.memo(({ 
  anime,
  imageWidth = 90,
  imageHeight = 120,
  titleFontSize = 16,
  episodesFontSize = 15,
  scoreFontSize = 15,
  descriptionFontSize = 13,
  statusFontSize = 12,
  marginBottom = 20,
  isLoading = false,
  historyData = null, // Новий опціональний проп для історії
  imageBorderRadius = 24, // Новий проп для border radius картинки
  titleNumberOfLines = 2, // Новий проп для кількості рядків заголовка
  starIconSize = 12 // Новий проп для розміру іконки зірки
}) => {
  const navigation = useNavigation();
  const [isFavourite, setIsFavourite] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [animeDescription, setAnimeDescription] = useState('');
  const { theme, isDark } = useTheme();
  const { getAnimeStatus } = useWatchStatus();
  
  // Анимация для скелетона
  const animatedValue = useMemo(() => new Animated.Value(0), []);
  
  // Анимация для статуса
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  
  // Анимация для иконки избранного
  const favouriteScaleAnim = React.useRef(new Animated.Value(0)).current;
  const favouriteFadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Memoize status colors to prevent recalculation
  const statusColors = useMemo(() => getStatusColors(theme), [theme]);

  // Create styles based on props
  const styles = useMemo(() => createStyles(theme, {
    imageWidth,
    imageHeight,
    titleFontSize,
    episodesFontSize,
    scoreFontSize,
    descriptionFontSize,
    statusFontSize,
    marginBottom,
    imageBorderRadius,
    titleNumberOfLines,
    starIconSize
  }), [theme, imageWidth, imageHeight, titleFontSize, episodesFontSize, scoreFontSize, descriptionFontSize, statusFontSize, marginBottom, imageBorderRadius, titleNumberOfLines, starIconSize]);

  // Форматуємо дію історії
  const historyAction = useMemo(() => formatHistoryAction(historyData), [historyData]);

  // Анимация статуса
  useEffect(() => {
    if (userStatus) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [userStatus, fadeAnim, scaleAnim]);

  // Анимация иконки избранного
  useEffect(() => {
    if (isFavourite) {
      Animated.parallel([
        Animated.timing(favouriteFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(favouriteScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      favouriteFadeAnim.setValue(0);
      favouriteScaleAnim.setValue(0);
    }
  }, [isFavourite, favouriteFadeAnim, favouriteScaleAnim]);

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

  // Fetch anime description
  useEffect(() => {
    const fetchAnimeDescription = async () => {
      try {
        const response = await fetch(`https://api.hikka.io/anime/${anime.slug}`);
        if (response.ok) {
          const data = await response.json();
          const description = parseMarkdown(data.description_ua || data.description_en || '');
          setAnimeDescription(description);
        }
      } catch (error) {

      }
    };

    if (anime.slug) {
      fetchAnimeDescription();
    }
  }, [anime.slug]);

  // Check if anime is in favourites
  useEffect(() => {
    const checkFavourite = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) {
          setIsFavourite(false);
          return;
        }

        const response = await fetch(`https://api.hikka.io/favourite/anime/${anime.slug}`, {
          headers: { auth: token }
        });
        setIsFavourite(response.ok);
      } catch (error) {
        setIsFavourite(false);
      }
    };

    if (anime.slug) {
      checkFavourite();
    }
  }, [anime.slug]);

  // Fetch user status
  useEffect(() => {
    const fetchUserStatus = async () => {
      // Спочатку перевіряємо глобальний стан
      const globalStatus = getAnimeStatus(anime.slug);
      if (globalStatus) {
        setUserStatus(globalStatus);
        return;
      }

      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) {
          setUserStatus(null);
          return;
        }

        const response = await fetch(`https://api.hikka.io/watch/${anime.slug}`, {
          headers: { auth: token }
        });

        if (response.ok) {
          const data = await response.json();
          setUserStatus(data.status || null);
        } else {
          setUserStatus(null);
        }
      } catch (error) {
        setUserStatus(null);
      }
    };

    if (anime.slug) {
      fetchUserStatus();
    }
  }, [anime.slug, getAnimeStatus]);

  const handlePress = useCallback(() => {
    navigation.navigate('AnimeDetails', { slug: anime.slug });
  }, [navigation, anime.slug]);

  if (isLoading) {
    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.skeletonImage, { opacity }]} />
        <View style={styles.info}>
          <Animated.View style={[styles.skeletonTitle, { opacity }]} />
          <View style={styles.row}>
            <Animated.View style={[styles.skeletonText, { opacity }]} />
            <Animated.View style={[styles.skeletonDot, { opacity }]} />
            <Animated.View style={[styles.skeletonText, { opacity }]} />
          </View>
          <Animated.View style={[styles.skeletonDescription, { opacity }]} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: anime.image }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        {userStatus && (
          <Animated.View 
            style={[
              styles.statusBadge, 
              { 
                backgroundColor: statusColors[userStatus] || 'rgba(51, 51, 51, 0.7)',
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.statusText}>
              {translateStatus(userStatus)}
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.info}>
                 <View style={styles.titleRow}>
           <Text style={styles.animeTitle} numberOfLines={titleNumberOfLines}>
             {anime.title_ua || anime.title_en || anime.title_ja || '?'}
           </Text>
         </View>

        <View style={styles.row}>
          <Text style={styles.episodesText}>
            {anime.episodes_released ?? '?'} з {anime.episodes_total ?? '?'} еп
          </Text>
          <FontAwesome name="circle" size={4} color={theme.colors.gray} />
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {anime.native_score ?? anime.score ?? '?'}
            </Text>
            <FontAwesome name="star" size={starIconSize} color={theme.colors.gray} style={styles.starIcon} />
          </View>
          {isFavourite && (
            <Animated.View
              style={{
                opacity: favouriteFadeAnim,
                transform: [{ scale: favouriteScaleAnim }]
              }}
            >
              <Octicons name="heart-fill" size={14} color={theme.colors.error} />
            </Animated.View>
          )}
        </View>

        {/* Year, Season, and Type Tags */}
        <View style={styles.tagsContainer}>
          {anime.year && anime.season && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {formatSeason(anime.season)} {anime.year}р.
              </Text>
            </View>
          )}
          {(anime.media_type || anime.type) && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {(anime.media_type || anime.type) === 'tv' ? 'Серіал' : 
                 (anime.media_type || anime.type) === 'movie' ? 'Фільм' :
                 (anime.media_type || anime.type) === 'ova' ? 'OVA' :
                 (anime.media_type || anime.type) === 'ona' ? 'ONA' :
                 (anime.media_type || anime.type) === 'special' ? 'Спешл' :
                 (anime.media_type || anime.type) === 'music' ? 'Музика' :
                 (anime.media_type || anime.type) === 'tv_special' ? 'ТВ Спешл' :
                 (anime.media_type || anime.type) === 'cm' ? 'Реклама' :
                 (anime.media_type || anime.type) === 'pv' ? 'PV' :
                 (anime.media_type || anime.type) === 'tv_13' ? 'ТВ 13' :
                 (anime.media_type || anime.type) === 'tv_24' ? 'ТВ 24' :
                 (anime.media_type || anime.type) === 'tv_48' ? 'ТВ 48' :
                 (anime.media_type || anime.type) === 'tv_25' ? 'ТВ 25' :
                 (anime.media_type || anime.type) === 'tv_50' ? 'ТВ 50' :
                 (anime.media_type || anime.type) === 'tv_100' ? 'ТВ 100' :
                 (anime.media_type || anime.type) === 'tv_unknown' ? 'ТВ Невідомо' :
                 (anime.media_type || anime.type) === 'movie_unknown' ? 'Фільм Невідомо' :
                 (anime.media_type || anime.type) === 'ova_unknown' ? 'OVA Невідомо' :
                 (anime.media_type || anime.type) === 'ona_unknown' ? 'ONA Невідомо' :
                 (anime.media_type || anime.type) === 'special_unknown' ? 'Спешл Невідомо' :
                 (anime.media_type || anime.type) === 'music_unknown' ? 'Музика Невідомо' :
                 (anime.media_type || anime.type) === 'tv_special_unknown' ? 'ТВ Спешл Невідомо' :
                 (anime.media_type || anime.type) === 'cm_unknown' ? 'Реклама Невідомо' :
                 (anime.media_type || anime.type) === 'pv_unknown' ? 'PV Невідомо' :
                 (anime.media_type || anime.type)}
              </Text>
            </View>
          )}
        </View>

        {/* Показуємо дію історії, якщо вона є */}
        {historyAction && (
          <Text style={styles.historyActionText}>
            {historyAction}
          </Text>
        )}

        {animeDescription && (
          <Text style={styles.descriptionText} numberOfLines={3}>
            {animeDescription}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (theme, props) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: props.marginBottom,
  },
  imageWrapper: {
    position: 'relative',
    width: props.imageWidth,
    marginRight: 15,
  },
  animeImage: {
    width: props.imageWidth,
    height: props.imageHeight,
    borderRadius: props.imageBorderRadius || 24,
    backgroundColor: theme.colors.border,
  },
  info: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animeTitle: {
    fontSize: props.titleFontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    padding: 4,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: props.statusFontSize,
    fontWeight: '500',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  episodesText: {
    fontSize: props.episodesFontSize,
    color: theme.colors.gray,
  },
  scoreText: {
    fontSize: props.scoreFontSize,
    color: theme.colors.gray,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    marginLeft: 2,
  },
  historyActionText: {
    fontSize: props.descriptionFontSize,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: hexToRgba(theme.colors.primary, 0.1),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hexToRgba(theme.colors.primary, 0.2),
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: props.descriptionFontSize,
    color: theme.colors.gray,
  },
  // Скелетон стилі
  skeletonImage: {
    width: props.imageWidth,
    height: props.imageHeight,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  skeletonTitle: {
    width: '80%',
    height: props.titleFontSize * 1.2,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonText: {
    width: 60,
    height: props.episodesFontSize,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
  },
  skeletonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.background,
  },
  skeletonDescription: {
    width: '100%',
    height: props.descriptionFontSize * 3.6,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
  },
});

AnimeRowCard.displayName = 'AnimeRowCard';

export default AnimeRowCard;
