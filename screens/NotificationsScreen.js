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
} from 'react-native';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 15;

export default function NotificationsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { token, isAuthenticated } = useAuth();
  const { unseenCount, setUnseenCount, loadUnseenCount, decrementUnseenCount } = useNotifications();

  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const canLoadMore = page < pages && !isLoading && !isLoadingMore;
  const keyExtractor = useCallback(
    (item) => item.reference || `${item.notification_type}:${item.created}`,
    []
  );
  const loadMoreLockRef = useRef(false);

  const loadPage = useCallback(
    async (targetPage = 1, replace = false) => {
      if (!token) return;
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

        setPages(totalPages);
        setPage(targetPage);
        setList((prev) => (replace || targetPage === 1 ? newList : [...prev, ...newList]));
      } catch (e) {
        Alert.alert('Помилка', 'Не вдалося завантажити сповіщення');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadUnseenCount(), loadPage(1, true)]);
    setIsRefreshing(false);
  }, [loadPage, loadUnseenCount]);

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
      }
    },
    [markAsSeen, navigation]
  );

  useEffect(() => {
    if (!token) return;
    loadPage(1, true);
  }, [token, loadPage]);

  const EmptyState = useMemo(() => (
    <EmptyContainer>
      <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textSecondary} />
      <EmptyTitle>Сповіщень немає</EmptyTitle>
      <EmptySubtitle>Тут зʼявляться оновлення від користувачів та контенту.</EmptySubtitle>
    </EmptyContainer>
  ), [theme.colors.textSecondary]);

  if (!isAuthenticated) {
    return (
      <ScreenContainer style={{ paddingBottom: insets.bottom }}>
        <HeaderRow experimentalBlurMethod="dimezis" intensity={100} tint={isDark ? 'dark' : 'light'} topOffset={insets.top}>
          <BackButton onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </BackButton>
          <HeaderTitle>Сповіщення</HeaderTitle>
          <View style={{ width: 32 }} />
        </HeaderRow>
        <ContentContainer style={{ paddingTop: insets.top + 56 }}>
          <CenterFill>
            <InfoText>Потрібна авторизація, щоб переглядати сповіщення.</InfoText>
            <PrimaryButton onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
              <PrimaryButtonText>Увійти</PrimaryButtonText>
            </PrimaryButton>
          </CenterFill>
        </ContentContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ paddingBottom: insets.bottom }}>
      <HeaderRow experimentalBlurMethod="dimezis" intensity={100} tint={isDark ? 'dark' : 'light'} topOffset={insets.top}>
        <BackButton onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </BackButton>
        <HeaderTitle>Сповіщення</HeaderTitle>
        <BadgeContainer onPress={markAllAsSeen} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          {unseenCount > 0 && (
            <Badge>
              <BadgeText>{unseenCount}</BadgeText>
            </Badge>
          )}
        </BadgeContainer>
      </HeaderRow>

      <ContentContainer>
        {isLoading && page === 1 ? (
          <LoaderContainer style={{ paddingTop: insets.top + 56 }}>
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
            ListEmptyComponent={EmptyState}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary} />
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
            contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 24 }}
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
    case 'thirdparty_login':
      return 'Стороння авторизація';
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
    case 'thirdparty_login':
      return `Ви авторизувались через застосунок ${appName}`;
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
    case 'thirdparty_login':
      return [
        <NormalText key="1">Ви авторизувались через застосунок </NormalText>,
        <BoldText key="2">{appName}</BoldText>
      ];
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
  return item?.notification_type === 'schedule_anime';
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

const HeaderRow = styled(BlurView)`
  height: ${({ topOffset }) => 56 + topOffset}px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 12px 12px 12px;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const BackButton = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: 700;
  height: 24px;
`;

const BadgeContainer = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const Badge = styled.View`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 2px 6px;
  border-radius: 999px;
`;

const BadgeText = styled.Text`
  color: #fff;
  font-size: 11px;
  font-weight: 700;
`;

const LoaderContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const NotificationItem = styled(TouchableOpacity)`
  padding: 12px 16px;
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
