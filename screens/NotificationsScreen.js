import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import styled from 'styled-components/native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { Ionicons } from '@expo/vector-icons';
import LoginComponent from '../components/Auth/LoginComponent';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import NotificationService from '../services/NotificationService';

const PAGE_SIZE = 15;

export default function NotificationsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { unseenCount, setUnseenCount, loadUnseenCount, decrementUnseenCount } = useNotifications();

  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const canLoadMore = page < pages && !isLoading && !isLoadingMore;
  const keyExtractor = useCallback(
    (item) => {
      // Використовуємо reference як основний ключ, якщо він є
      if (item.reference) {
        return item.reference;
      }
      
      // Для schedule_anime використовуємо комбінацію anime_id + episode для унікальності
      if (item.notification_type === 'schedule_anime') {
        const animeData = item.data?.list?.[0] || item.data;
        const animeId = animeData?.anime_id || animeData?.id || '';
        const episode = animeData?.after?.episodes_released || animeData?.episodes_released || '';
        return `anime_${animeId}_ep_${episode}`;
      }
      
      // Для інших типів використовуємо комбінацію тип + ID користувача + час
      const userId = item.initiator_user?.id || '';
      const timestamp = Math.floor(item.created / 60) * 60; // Округлюємо до хвилини для групування
      return `${item.notification_type}_${userId}_${timestamp}`;
    },
    []
  );
  const loadMoreLockRef = useRef(false);

  // Функція для дедуплікації сповіщень
  const deduplicateNotifications = useCallback((notifications) => {
    const seen = new Set();
    const deduplicated = [];
    
    for (const notification of notifications) {
      const key = keyExtractor(notification);
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(notification);
      }
    }
    
    return deduplicated;
  }, [keyExtractor]);

  // Пуш-повідомлення тепер обробляються в NotificationsContext

  const loadPage = useCallback(
    async (targetPage = 1, replace = false) => {
      if (!token) return;
      
      // Показываем лоадер только если загрузка занимает больше 300мс
      const loaderTimeout = setTimeout(() => {
        if (targetPage === 1) setShowLoader(true);
      }, 300);
      
      if (targetPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const res = await fetch(
          `https://api.hikka.io/notifications?page=${targetPage}&size=${PAGE_SIZE}`,
          { headers: { auth: token } }
        );
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        const newList = Array.isArray(data.list) ? data.list : [];
        const totalPages = Number(data?.pagination?.pages) || 1;

        // Пуш-повідомлення тепер обробляються в NotificationsContext
        // Тут тільки завантажуємо дані для відображення
        
        // Дедуплікуємо нові сповіщення
        const deduplicatedNewList = deduplicateNotifications(newList);

        setPages(totalPages);
        setPage(targetPage);
        setList((prev) => {
          if (replace || targetPage === 1) {
            return deduplicatedNewList;
          }
          // Дедуплікуємо весь список при додаванні нових елементів
          const combinedList = [...prev, ...deduplicatedNewList];
          return deduplicateNotifications(combinedList);
        });
        
        if (targetPage === 1) {
          setIsInitialLoadComplete(true);
        }
      } catch (e) {
        console.error('Error loading notifications:', e);
        if (targetPage === 1) {
          setIsInitialLoadComplete(true);
        }
        Alert.alert('Помилка', 'Не вдалося завантажити сповіщення');
      } finally {
        clearTimeout(loaderTimeout);
        setShowLoader(false);
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token, deduplicateNotifications]
  );

  const refresh = useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple refresh calls
    setIsRefreshing(true);
    try {
      await Promise.all([loadUnseenCount(), loadPage(1, true)]);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPage, loadUnseenCount, isRefreshing]);

  const loadMore = useCallback(() => {
    if (!canLoadMore || loadMoreLockRef.current) return;
    loadMoreLockRef.current = true;
    Promise.resolve(loadPage(page + 1)).finally(() => {
      setTimeout(() => {
        loadMoreLockRef.current = false;
      }, 250);
    });
  }, [canLoadMore, loadPage, page]);

  const markAsSeen = useCallback(
    async (reference) => {
      if (!token || !reference) return;
      try {
        const res = await fetch(`https://api.hikka.io/notifications/${reference}/seen`, {
          method: 'POST',
          headers: { auth: token },
        });
        if (!res.ok) return;

        setList((prev) =>
          prev.map((n) => (n.reference === reference ? { ...n, seen: true } : n))
        );
        decrementUnseenCount();
      } catch (e) {
        // no-op
      }
    },
    [token, decrementUnseenCount]
  );

  const markAllAsSeen = useCallback(
    async () => {
      if (!token || unseenCount === 0) return;
      try {
        const res = await fetch('https://api.hikka.io/notifications/seen/all', {
          method: 'POST',
          headers: { auth: token },
        });
        if (!res.ok) return;

        setList((prev) =>
          prev.map((n) => ({ ...n, seen: true }))
        );
        setUnseenCount(0);
      } catch (e) {
        // no-op
      }
    },
    [token, unseenCount, setUnseenCount]
  );

  const onItemPress = useCallback(
    (item) => {
      if (!item?.seen) markAsSeen(item.reference);
      const type = item?.notification_type;
      if (type === 'schedule_anime') {
        const slug = getAnimeSlug(item);
        if (slug) navigation.navigate('AnimeDetails', { slug });
      } else if (type === 'hikka_update') {
        const link = item?.data?.link;
        if (link) {
          Linking.openURL(link).catch(() => {
            Alert.alert('Помилка', 'Не вдалося відкрити посилання');
          });
        }
      } else if (type === 'follow') {
        const username = item?.initiator_user?.username;
        if (username) {
          navigation.navigate('UserProfileScreen', { username });
        }
      } else if (type === 'comment_reply') {
        const slug = item?.data?.slug;
        const commentReference = item?.data?.comment_reference;
        if (slug && commentReference) {
          // Навігуємо до сторінки аніме з відкритим коментарем
          navigation.navigate('AnimeDetails', { 
            slug,
            openComments: true,
            commentReference: commentReference
          });
        } else if (slug) {
          // Якщо немає посилання на коментар, просто відкриваємо аніме
          navigation.navigate('AnimeDetails', { slug });
        }
      } else if (type === 'vote_increase' || type === 'comment_vote') {
        const slug = item?.data?.slug;
        if (slug) {
          navigation.navigate('AnimeDetails', { slug });
        }
      }
    },
    [markAsSeen, navigation]
  );

  useEffect(() => {
    if (!token) {
      setIsInitialLoadComplete(false);
      setShowLoader(false);
      setList([]);
      setPage(1);
      setPages(1);
      return;
    }
    
    // Prevent multiple rapid calls during auth process
    if (!isInitialLoadComplete) {
      // Загружаем сразу без задержки для быстрого отклика
      loadPage(1, true);
    }

    // Пуш-повідомлення тепер обробляються в NotificationsContext
    // Тут тільки завантажуємо дані для відображення
  }, [token, loadPage, isInitialLoadComplete]);

  const EmptyState = useMemo(() => (
    <EmptyContainer>
      <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textSecondary} />
      <EmptyTitle>Сповіщень немає</EmptyTitle>
      <EmptySubtitle>Тут зʼявляться оновлення від користувачів та контенту.</EmptySubtitle>
    </EmptyContainer>
  ), [theme.colors.textSecondary]);

  // Показуємо EmptyState тільки якщо завантаження завершено і список порожній
  const shouldShowEmptyState = isInitialLoadComplete && list.length === 0 && !showLoader;

  // Показуємо лоадер під час перевірки авторизації
  if (authLoading) {
    return (
      <ScreenContainer style={{ paddingBottom: insets.bottom }}>
        <HeaderTitleBar title="Сповіщення" />
        <ContentContainer>
          <LoaderContainer>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </LoaderContainer>
        </ContentContainer>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer style={{ paddingBottom: insets.bottom }}>
        <HeaderTitleBar title="Сповіщення" />
        <ContentContainer>
          <LoginComponent onLoginSuccess={refresh} />
        </ContentContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer >
      <HeaderTitleBar title="Сповіщення" />
      <ContentContainer>
        {showLoader && list.length === 0 ? (
          <LoaderContainer>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </LoaderContainer>
        ) : (
          <FlatList
            data={list}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <NotificationRow item={item} onPress={onItemPress} />
            )}
            ItemSeparatorComponent={() => <Separator />}
            ListEmptyComponent={shouldShowEmptyState ? EmptyState : null}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                colors={[theme.colors.text]}
                tintColor={theme.colors.text}
                progressViewOffset={insets.top + (Platform.OS === 'ios' ? 70 : 50)}
                progressBackgroundColor={isDark ? theme.colors.card : undefined}
              />
            }
            onEndReachedThreshold={0.3}
            onEndReached={loadMore}
            initialNumToRender={15}
            windowSize={8}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews
            ListFooterComponent={
              isLoadingMore ? (
                <FooterLoader>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </FooterLoader>
              ) : null
            }
            contentContainerStyle={{
              paddingTop: insets.top + 56,
              paddingBottom: 20 + insets.bottom,
            }}
          />
        )}
      </ContentContainer>
    </ScreenContainer>
  );
}

const NotificationRow = React.memo(function NotificationRow({ item, onPress }) {
  const { theme } = useTheme();
  const rightImageUri = getNotificationRightImageUri(item);
  
  return (
    <NotificationItem onPress={() => onPress(item)} activeOpacity={0.8}>
      <LeftIconContainer>
        <Ionicons name={renderNotificationIcon(item?.notification_type)} size={20} color={theme.colors.text} />
      </LeftIconContainer>
      <MiddleCol>
        <Title numberOfLines={2}>{renderNotificationTitle(item)}</Title>
        {!!renderNotificationSubtitle(item) && (
          <Subtitle>
            {renderNotificationSubtitleWithBold(item)}
          </Subtitle>
        )}
        <MetaRow>
          {!item.seen && <UnseenDot />}
          <MetaText>{formatTimeAgo(item.created)}</MetaText>
        </MetaRow>
      </MiddleCol>
      {rightImageUri && (
        <RightCol>
          <AvatarSmall
            source={{ uri: rightImageUri }}
            isPoster={isAnimePoster(item)}
          />
        </RightCol>
      )}
    </NotificationItem>
  );
}, (prev, next) => prev.item.seen === next.item.seen && prev.item.reference === next.item.reference);

function renderNotificationTitle(item) {
  const username = item?.initiator_user?.username || 'Користувач';
  const type = item?.notification_type || 'оновлення';
  const extra = item?.data?.delta ? ` (+${item.data.delta})` : '';
  switch (type) {
    case 'vote_increase':
    case 'comment_vote':
      return `Нова оцінка${extra}`;
    case 'oauth_login':
    case 'thirdparty_login': {
      const appName = item?.data?.client?.name || item?.data?.client_name || '';
      // Если это наше приложение, показываем просто "Авторизація"
      if (appName.toLowerCase().includes('yummyanimelist')) {
        return 'Авторизація';
      }
      return 'Стороння авторизація';
    }
    case 'schedule_anime': {
      const d = getScheduleAnimeData(item);
      const { title_ua, title_en, title_ja, season } = d || {};
      const title = title_ua || title_en || title_ja || 'Оновлення розкладу';
      if (season) return `${title} - ${season}`;
      return title;
    }
    case 'comment_reply':
      return 'Новий коментар';
    case 'hikka_update':
      return item?.data?.title || 'Оновлення Хікки';
    default:
      return humanizeNotificationType(type);
  }
}

function humanizeNotificationType(type) {
  switch (type) {
    case 'follow':
      return 'Нова підписка';
    case 'comment_reply':
      return 'Новий коментар';
    case 'like':
      return 'Нове вподобання';
    default:
      return type;
  }
}

function renderNotificationSubtitle(item) {
  const username = item?.initiator_user?.username || 'Користувач';
  const type = item?.notification_type || '';
  const appName = item?.data?.client?.name || item?.data?.client_name || '0';
  switch (type) {
    case 'vote_increase':
    case 'comment_vote':
      return `Користувач ${username} оцінив Ваш коментар`;
    case 'oauth_login':
    case 'thirdparty_login': {
      // Если это наше приложение, показываем более подходящий текст
      if (appName.toLowerCase().includes('yummyanimelist') || appName.toLowerCase().includes('ями аниме лист')) {
        return 'Ви успішно увійшли в систему';
      }
      return `Ви авторизувались через застосунок ${appName}`;
    }
    case 'schedule_anime': {
      const ep = getEpisodeNumber(item);
      return `Вийшов ${ep ? ep + ' епізод' : 'новий епізод'} аніме`;
    }
    case 'comment_reply':
      return `Користувач ${username} відповів на Ваш коментар`;
    case 'follow':
      return `Користувач ${username} підписався на Вас`;
    case 'hikka_update':
      return item?.data?.description || '';
    default:
      return '';
  }
}

function renderNotificationSubtitleWithBold(item) {
  const { theme } = useTheme();
  const username = item?.initiator_user?.username || 'Користувач';
  const type = item?.notification_type || '';
  const appName = item?.data?.client?.name || item?.data?.client_name || '0';
  
  const BoldText = ({ children }) => (
    <Text style={{ fontWeight: '700', color: theme.colors.text, fontSize: 13 }}>{children}</Text>
  );
  
  const NormalText = ({ children }) => (
    <Text style={{ color: theme.colors.text, fontSize: 13 }}>{children}</Text>
  );
  
  switch (type) {
    case 'vote_increase':
    case 'comment_vote':
      return [
        <NormalText key="1">Користувач </NormalText>,
        <BoldText key="2">{username}</BoldText>,
        <NormalText key="3"> оцінив Ваш коментар</NormalText>
      ];
    case 'oauth_login':
    case 'thirdparty_login': {
      // Если это наше приложение, показываем более подходящий текст
      if (appName.toLowerCase().includes('yummyanimelist') || appName.toLowerCase().includes('ями аниме лист')) {
        return [
          <NormalText key="1">Ви успішно увійшли в систему</NormalText>
        ];
      }
      return [
        <NormalText key="1">Ви авторизувались через застосунок </NormalText>,
        <BoldText key="2">{appName}</BoldText>
      ];
    }
    case 'schedule_anime': {
      const ep = getEpisodeNumber(item);
      if (ep) {
        return [
          <NormalText key="1">Вийшов </NormalText>,
          <BoldText key="2">{ep} епізод</BoldText>,
          <NormalText key="3"> аніме</NormalText>
        ];
      } else {
        return [
          <NormalText key="1">Вийшов </NormalText>,
          <BoldText key="2">новий епізод</BoldText>,
          <NormalText key="3"> аніме</NormalText>
        ];
      }
    }
    case 'comment_reply':
      return [
        <NormalText key="1">Користувач </NormalText>,
        <BoldText key="2">{username}</BoldText>,
        <NormalText key="3"> відповів на Ваш коментар</NormalText>
      ];
    case 'follow':
      return [
        <NormalText key="1">Користувач </NormalText>,
        <BoldText key="2">{username}</BoldText>,
        <NormalText key="3"> підписався на Вас</NormalText>
      ];
    case 'hikka_update':
      return [<NormalText key="1">{item?.data?.description || ''}</NormalText>];
    default:
      return [<NormalText key="1"></NormalText>];
  }
}

function renderNotificationIcon(type) {
  switch (type) {
    case 'vote_increase':
    case 'comment_vote':
      return 'heart-outline';
    case 'oauth_login':
    case 'thirdparty_login':
      return 'lock-open-outline';
    case 'schedule_anime':
      return 'logo-youtube';
    case 'comment_reply':
      return 'chatbubble-ellipses-outline';
    case 'follow':
      return 'person-add-outline';
    case 'hikka_update':
      return 'information-circle-outline';
    default:
      return 'notifications-outline';
  }
}

function getAnimeSlug(item) {
  const d = getScheduleAnimeData(item);
  return d?.slug || d?.anime_slug || d?.content?.slug || null;
}

function getNotificationRightImageUri(item) {
  const type = item?.notification_type;
  if (type === 'schedule_anime') {
    const d = getScheduleAnimeData(item);
    return d?.image || d?.poster || d?.cover || null;
  }
  // Для comment_reply, vote_increase, comment_vote показуємо аватар користувача
  if (type === 'comment_reply' || type === 'vote_increase' || type === 'comment_vote' || type === 'follow' || type === 'like') {
    return item?.initiator_user?.avatar && item.initiator_user.avatar !== 'string'
      ? item.initiator_user.avatar
      : null;
  }
  return item?.initiator_user?.avatar && item.initiator_user.avatar !== 'string'
    ? item.initiator_user.avatar
    : null;
}

function getEpisodeNumber(item) {
  const d = getScheduleAnimeData(item);
  const raw = d?.after?.episodes_released ?? d?.episodes_released;
  if (raw == null) return null;
  const str = String(raw).trim();
  const n = parseInt(str, 10);
  if (!Number.isNaN(n) && n > 0) return n;
  const match = str.match(/\d+/);
  if (match) {
    const m = parseInt(match[0], 10);
    return Number.isNaN(m) || m <= 0 ? null : m;
  }
  return null;
}

function getScheduleAnimeData(item) {
  const data = item?.notification_type === 'schedule_anime' ? item?.data : null;
  if (!data) return null;
  if (Array.isArray(data.list) && data.list.length > 0) return data.list[0];
  return data;
}

function isAnimePoster(item) {
  const type = item?.notification_type;
  // Для schedule_anime показуємо постер аніме
  if (type === 'schedule_anime') return true;
  // Для всіх інших типів показуємо круглий аватар
  return false;
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'щойно';
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - Number(timestamp));
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (years > 0) return `${years} ${years === 1 ? 'рік' : years < 5 ? 'роки' : 'років'} тому`;
  if (months > 0) return `${months} ${months === 1 ? 'місяць' : months < 5 ? 'місяці' : 'місяців'} тому`;
  if (days > 0) return `${days} ${days === 1 ? 'день' : days < 5 ? 'дні' : 'днів'} тому`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'годину' : hours < 5 ? 'години' : 'годин'} тому`;
  if (minutes > 0) return `${minutes} хв тому`;
  return 'щойно';
}

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const LoaderContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const NotificationItem = styled(TouchableOpacity)`
  padding: 12px;
  flex-direction: row;
  align-items: center;
`;

const LeftIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.card};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const MiddleCol = styled.View`
  flex: 1;
`;

const RightCol = styled.View`
  width: 44px;
  align-items: center;
`;

const AvatarSmall = styled(Image)`
  width: ${({ isPoster }) => (isPoster ? '44px' : '44px')};
  height: ${({ isPoster }) => (isPoster ? '60px' : '44px')};
  border-radius: ${({ isPoster }) => (isPoster ? '12px' : '999px')};
  background-color: ${({ theme }) => theme.colors.card};
`;

const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 600;
  margin-right: 12px;
`;

const Subtitle = styled(View)`
  margin-top: 4px;
  margin-right: 12px;
  flex-direction: row;
  flex-wrap: wrap;
`;

const MetaRow = styled.View`
  margin-top: 4px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const MetaText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

const UnseenDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const Separator = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin-left: 64px;
`;

const FooterLoader = styled.View`
  padding: 12px 0;
  align-items: center;
  justify-content: center;
`;

const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
`;

const EmptyTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  margin-top: 10px;
  font-size: 16px;
  font-weight: 700;
`;

const EmptySubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 6px;
  font-size: 14px;
  text-align: center;
`;

const CenterFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  margin-bottom: 16px;
  text-align: center;
`;

const PrimaryButton = styled(TouchableOpacity)`
  padding: 12px 18px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const PrimaryButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
`;