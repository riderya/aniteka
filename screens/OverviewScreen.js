import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, RefreshControl, ScrollView, Alert } from 'react-native';
import Header from '../components/Header/Header';
import OverviewButtons from '../components/OverviewComponents/OverviewButtons';
import ArticlesSlider from '../components/OverviewComponents/ArticlesSlider';
import CollectionSlider from '../components/OverviewComponents/CollectionSlider';
import AnimeScheduleSlider from '../components/OverviewComponents/AnimeScheduleSlider';
import LatestComments from '../components/OverviewComponents/LatestComments';
import SocialLinks from '../components/OverviewComponents/SocialLinks';
import { useTheme } from '../context/ThemeContext';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.card};
  margin: 20px 12px;
`;

const OverviewScreen = React.memo(() => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const refreshFunctionsRef = useRef([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Викликаємо всі функції оновлення паралельно
      const refreshPromises = refreshFunctionsRef.current.map(refreshFn => 
        refreshFn ? refreshFn().catch(error => {
          console.error('Error during refresh:', error);
          return Promise.resolve(); // Продовжуємо навіть якщо одна функція не вдалася
        }) : Promise.resolve()
      );
      await Promise.all(refreshPromises);
    } catch (error) {
      console.error('Error during refresh:', error);
      Alert.alert(
        'Помилка оновлення',
        'Не вдалося оновити деякі дані. Спробуйте ще раз.',
        [{ text: 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  const addRefreshFunction = useCallback((refreshFn) => {
    refreshFunctionsRef.current.push(refreshFn);
    return () => {
      const index = refreshFunctionsRef.current.indexOf(refreshFn);
      if (index > -1) {
        refreshFunctionsRef.current.splice(index, 1);
      }
    };
  }, []);

  return (
    <>
      <Header />
      <Container theme={theme}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.text]}
              tintColor={theme.colors.text}
              progressViewOffset={insets.top + (Platform.OS === 'ios' ? 70 : 50)}
              progressBackgroundColor={isDark ? theme.colors.card : undefined}
            />
          }
          contentContainerStyle={{
            paddingTop: insets.top + 70,
            paddingBottom: insets.bottom + 110
          }}
        >
          <OverviewButtons />
          <Divider />
          <CollectionSlider onRefresh={addRefreshFunction} />
          <Divider />
          <ArticlesSlider onRefresh={addRefreshFunction} />
          <Divider />
          <SocialLinks 
            telegramUrl="https://t.me/anitekalib"
            discordUrl="https://discord.gg/BHSxd2avUn"
          />
          <Divider />
          <AnimeScheduleSlider onRefresh={addRefreshFunction} />
          <Divider />
          <LatestComments onRefresh={addRefreshFunction} />
        </ScrollView>
      </Container>
    </>
  );
});

OverviewScreen.displayName = 'OverviewScreen';

export default OverviewScreen;
