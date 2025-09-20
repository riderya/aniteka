import React, { useMemo, useEffect, useState } from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWatchStatus } from '../../context/WatchStatusContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useOrientation } from '../../hooks';
import { getResponsiveDimensions } from '../../utils/orientationUtils';

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
      case 'planned': return 'Заплановане';
      case 'watching': return 'Дивлюсь';
      case 'completed': return 'Завершено';
      case 'on_hold': return 'В очікуванні';
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
  historyData = null, // Новий опціональний проп для історії
  imageBorderRadius = 24, // Новий проп для border radius картинки
  titleNumberOfLines = 2, // Новий проп для кількості рядків заголовка
  starIconSize = 12 // Новий проп для розміру іконки зірки
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [userStatus, setUserStatus] = useState(null);
  const { getAnimeStatus, getAnimeFavourite, fetchAnimeFavourite } = useWatchStatus();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  
  // Анимация для иконки избранного
  const favouriteScaleAnim = React.useRef(new Animated.Value(0)).current;
  const favouriteFadeAnim = React.useRef(new Animated.Value(0)).current;
  const orientation = useOrientation();
  const responsiveDims = getResponsiveDimensions();
  
  // Отримуємо статус улюбленого аніме
  const isLiked = getAnimeFavourite(anime.slug);
  
  // Завантажуємо статус улюбленого при першому рендері
  useEffect(() => {
    if (anime.slug && isLiked === null) {
      fetchAnimeFavourite(anime.slug);
    }
  }, [anime.slug, isLiked, fetchAnimeFavourite]);
  
  // Memoize status colors to prevent recalculation
  const statusColors = useMemo(() => getStatusColors(theme), [theme]);

  // Create styles based on props and orientation
  const styles = useMemo(() => {
    const adaptiveCardWidth = orientation === 'landscape' ? responsiveDims.cardWidth : cardWidth;
    // Висоту зображення завжди беремо з пропса, щоб батьківський компонент міг керувати нею динамічно
    const adaptiveImageHeight = imageHeight;
    const adaptiveTitleFontSize = orientation === 'landscape' ? responsiveDims.fontSize.medium : titleFontSize;
    const adaptiveFooterFontSize = orientation === 'landscape' ? responsiveDims.fontSize.small : footerFontSize;
    
    return createStyles(theme, {
      cardWidth: typeof adaptiveCardWidth === 'string' ? undefined : adaptiveCardWidth,
      imageWidth: typeof imageWidth === 'string' ? undefined : imageWidth,
      imageHeight: adaptiveImageHeight,
      titleFontSize: adaptiveTitleFontSize,
      footerFontSize: adaptiveFooterFontSize,
      badgeFontSize,
      badgePadding,
      badgeBottom,
      badgeLeft,
      badgeRight,
      marginTop,
      marginBottom,
      imageBorderRadius,
      titleNumberOfLines,
      starIconSize
    });
  }, [theme, cardWidth, imageWidth, imageHeight, titleFontSize, footerFontSize, badgeFontSize, badgePadding, badgeBottom, badgeLeft, badgeRight, marginTop, marginBottom, imageBorderRadius, titleNumberOfLines, starIconSize, orientation, responsiveDims]);

  // Форматуємо дію історії
  const historyAction = useMemo(() => formatHistoryAction(historyData), [historyData]);

  // Animation effect when status changes
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
    if (isLiked === true) {
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
  }, [isLiked, favouriteFadeAnim, favouriteScaleAnim]);

  // Fetch user status from API like AnimeRowCard does
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
  }, [anime.slug, getAnimeStatus]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('AnimeDetails', { slug: anime.slug });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={[
        styles.item,
        typeof cardWidth === 'string' && { width: cardWidth }
      ]}>
        <View style={styles.posterWrapper}>
          <Image
            source={{ uri: anime.image }}
            style={[
              styles.poster,
              typeof imageWidth === 'string' && { width: imageWidth }
            ]}
            resizeMode="cover"
          />
          {userStatus && (
            <Animated.View 
              style={[
                styles.statusBadge, 
                { 
                  backgroundColor: statusColors[userStatus] || '#666',
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.statusText}>
                {statusLabels[userStatus] || userStatus}
              </Text>
            </Animated.View>
          )}
          {isLiked === true && (
            <Animated.View 
              style={[
                styles.heartIcon,
                {
                  opacity: favouriteFadeAnim,
                  transform: [{ scale: favouriteScaleAnim }]
                }
              ]}
            >
              <Ionicons name="heart" size={20} color={theme.colors.favourite} />
            </Animated.View>
          )}
        </View>

                 <Text numberOfLines={titleNumberOfLines} style={[
           styles.title,
           typeof cardWidth === 'string' && { width: cardWidth }
         ]}>
           {anime.title_ua || anime.title_en || anime.title_ja || '?'}
         </Text>

        {/* Показуємо дію історії, якщо вона є */}
        {historyAction && (
          <Text style={styles.historyActionText} numberOfLines={1}>
            {historyAction}
          </Text>
        )}

        <View style={styles.rowFooter}>
          <Text style={styles.textFooter}>
            {anime.episodes_released ?? '?'} з {anime.episodes_total ?? '?'} еп
          </Text>
          <FontAwesome name="circle" size={4} color={theme.colors.gray} />
          <View style={styles.scoreContainer}>
            <Text style={styles.textFooter}>
              {anime.native_score ?? anime.score ?? '?'}
            </Text>
            <FontAwesome name="star" size={starIconSize} color={theme.colors.gray} style={styles.starIcon} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (theme, props) => StyleSheet.create({
  item: {
    width: props.cardWidth,
    marginTop: props.marginTop,
    marginBottom: props.marginBottom,
  },
  posterWrapper: {
    position: 'relative',
  },
  poster: {
    width: props.imageWidth,
    height: props.imageHeight,
    borderRadius: props.imageBorderRadius || 24,
    backgroundColor: theme.colors.border,
  },
  title: {
    marginTop: 10,
    fontSize: props.titleFontSize,
    width: props.cardWidth,
    color: theme.colors.text,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    bottom: props.badgeBottom,
    left: props.badgeLeft,
    right: props.badgeRight,
    padding: props.badgePadding,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: props.badgeFontSize,
    fontWeight: '500',
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.favourite + '60',
    padding: 6,
    borderRadius: 10,
  },
  historyActionText: {
    fontSize: props.footerFontSize,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  textFooter: {
    fontSize: props.footerFontSize,
    color: theme.colors.gray,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    marginLeft: 0,
  },
});

AnimeColumnCard.displayName = 'AnimeColumnCard';

export default AnimeColumnCard;
