import React, { useMemo, useEffect, useState } from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
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
  titleNumberOfLines = 2 // Новий проп для кількості рядків заголовка
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [userStatus, setUserStatus] = useState(null);
  
  // Memoize status colors to prevent recalculation
  const statusColors = useMemo(() => getStatusColors(theme), [theme]);

  // Create styles based on props
  const styles = useMemo(() => createStyles(theme, {
    cardWidth: typeof cardWidth === 'string' ? undefined : cardWidth,
    imageWidth: typeof imageWidth === 'string' ? undefined : imageWidth,
    imageHeight,
    titleFontSize,
    footerFontSize,
    badgeFontSize,
    badgePadding,
    badgeBottom,
    badgeLeft,
    badgeRight,
    marginTop,
    marginBottom,
    imageBorderRadius,
    titleNumberOfLines
  }), [theme, cardWidth, imageWidth, imageHeight, titleFontSize, footerFontSize, badgeFontSize, badgePadding, badgeBottom, badgeLeft, badgeRight, marginTop, marginBottom, imageBorderRadius, titleNumberOfLines]);

  // Форматуємо дію історії
  const historyAction = useMemo(() => formatHistoryAction(historyData), [historyData]);

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
            <View style={[styles.statusBadge, { backgroundColor: statusColors[userStatus] || '#666' }]}>
              <Text style={styles.statusText}>
                {statusLabels[userStatus] || userStatus}
              </Text>
            </View>
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
          <Text style={styles.textFooter}>
            {anime.score ?? '?'}
          </Text>
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
    borderRadius: props.imageBorderRadius,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: props.badgeFontSize,
    fontWeight: '500',
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
});

AnimeColumnCard.displayName = 'AnimeColumnCard';

export default AnimeColumnCard;
