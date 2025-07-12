import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/DetailsAnime/BackButton';
import UserAvatar from '../components/UserComponents/UserAvatar';
import FollowStatsBlock from '../components/UserComponents/FollowStatsBlock';
import StatsDonutBlock from '../components/UserComponents/StatsDonutBlock';
import UserActivityBlock from '../components/UserComponents/UserActivityBlock';
import AnimeHistoryBlock from '../components/UserComponents/AnimeHistoryBlock';
import FollowingHistoryBlock from '../components/UserComponents/FollowingHistoryBlock';
import MyCollectionsBlock from '../components/UserComponents/MyCollectionsBlock';
import { Feather } from '@expo/vector-icons';

/* ======================= styled‑components ======================= */
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BackButtonWrapper = styled.View`
  position: absolute;
  top: 50px;
  left: 12px;
  z-index: 1;
`;

const Content = styled.View`
  flex: 1;
  padding: 0 12px;
  padding-bottom: ${({ insetBottom }) => insetBottom}px;
`;

const AvatarBanner = styled.Image`
  position: absolute;
  top: 0;
  width: 100%;
  height: 220px;
  z-index: 0;
  pointer-events: none; /* щоб свайпи проходили крізь */
`;

const ColumnWrapperContent = styled.View`
  flex: 1;
  align-items: center;
  margin-top: 160px;
`;

const LoadingWrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Username = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text || '#fff'};
  margin-top: 5px;
`;

const EditButton = styled.Pressable`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  margin-top: 12px;
`;

const EditLabel = styled.Text`
  margin-left: 6px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;
/* ================================================================ */

export default function UserScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [watchStats, setWatchStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const token = await SecureStore.getItemAsync('hikka_token');
        if (!token) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          return;
        }

        setLoading(true);

        try {
          const resUser = await fetch('https://api.hikka.io/user/me', {
            headers: { auth: token },
          });
          const textUser = await resUser.text();
          if (!resUser.ok) throw new Error(textUser);
          const parsedUser = JSON.parse(textUser);
          if (!isActive) return;

          setUserData(parsedUser);

          // ── follow stats ──
          const resFollow = await fetch(
            `https://api.hikka.io/follow/${parsedUser.username}/stats`,
            { headers: { auth: token } }
          );
          if (resFollow.ok) setFollowStats(await resFollow.json());

          // ── watch stats ──
          const resWatch = await fetch(
            `https://api.hikka.io/watch/${parsedUser.username}/stats`,
            { headers: { auth: token } }
          );
          if (resWatch.ok) setWatchStats(await resWatch.json());

          // ── activity ──
          const resActivity = await fetch(
            `https://api.hikka.io/user/${parsedUser.username}/activity`,
            { headers: { auth: token } }
          );
          if (resActivity.ok) setActivity(await resActivity.json());

          // ── collections ──
          const resCollections = await fetch('https://api.hikka.io/collections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              auth: token,
            },
            body: JSON.stringify({
              author: parsedUser.username,
              only_public: false,
            }),
          });

          if (resCollections.ok) {
            const data = await resCollections.json();
            setCollections(data.list || []);
          }
        } catch (err) {
          Alert.alert('Помилка', err.message);
        } finally {
          setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [navigation])
  );

  if (loading) {
    return (
      <LoadingWrapper>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </LoadingWrapper>
    );
  }

  return (
    <Container>
      <BackButtonWrapper>
        <BackButton />
      </BackButtonWrapper>

      <ScrollView style={{ flex: 1 }}>
        <AvatarBanner
          source={
            userData?.cover
              ? { uri: userData.cover }
              : require('../assets/image/noSearchImage.png')
          }
          resizeMode="cover"
        />
        <Content insetBottom={insets.bottom + 75}>
          <ColumnWrapperContent>
            {userData && <UserAvatar userData={userData} />}
            {followStats && <FollowStatsBlock stats={followStats} />}
            <EditButton onPress={() => navigation.navigate('EditProfile')}>
              <Feather name="edit-3" size={18} color={theme.colors.text} />
              <EditLabel>Редагувати</EditLabel>
            </EditButton>

            {watchStats && (
              <StatsDonutBlock
                stats={{
                  watching: watchStats.watching,
                  planned: watchStats.planned,
                  completed: watchStats.completed,
                  on_hold: watchStats.on_hold,
                  dropped: watchStats.dropped,
                  duration: watchStats.duration,
                  episodes: watchStats.completed_episodes,
                }}
                onPressShowAll={() => navigation.navigate('FullStats')}
              />
            )}

            {activity.length > 0 && <UserActivityBlock activity={activity} />}
            <MyCollectionsBlock collections={collections} username={userData?.username} />
            <AnimeHistoryBlock username={userData?.username} />
            <FollowingHistoryBlock />
          </ColumnWrapperContent>
        </Content>
      </ScrollView>
    </Container>
  );
}
