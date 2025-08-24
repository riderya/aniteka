import React, { useMemo, useCallback, useState } from 'react';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, RefreshControl, ScrollView } from 'react-native';
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
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
          <CollectionSlider />
          <Divider />
          <ArticlesSlider />
          <Divider />
          <SocialLinks 
            telegramUrl="https://t.me/YummyAnimeList"
            // discordUrl="https://discord.gg/5truHDdzEq"
          />
          <Divider />
          <AnimeScheduleSlider />
          <Divider />
          <LatestComments />
        </ScrollView>
      </Container>
    </>
  );
});

OverviewScreen.displayName = 'OverviewScreen';

export default OverviewScreen;
