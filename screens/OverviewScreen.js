import React, { useMemo, useCallback, useState } from 'react';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, RefreshControl } from 'react-native';
import Header from '../components/Header/Header';
import OverviewButtons from '../components/OverviewComponents/OverviewButtons';
import ArticlesSlider from '../components/OverviewComponents/ArticlesSlider';
import CollectionSlider from '../components/OverviewComponents/CollectionSlider';
import AnimeScheduleSlider from '../components/OverviewComponents/AnimeScheduleSlider';
import LatestComments from '../components/OverviewComponents/LatestComments';
import SocialLinks from '../components/OverviewComponents/SocialLinks';
import { useTheme } from '../context/ThemeContext';

const StyledScrollView = styled.ScrollView`
  flex-grow: 1;
  padding-top: ${({ paddingTopValue }) => paddingTopValue}px;
  background: ${({ theme }) => theme.colors.background};
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

  const paddingTopValue = useMemo(() => {
    const basePadding = Platform.OS === 'ios' ? 70 : 70;
    return insets.top + basePadding;
  }, [insets.top]);
  const paddingBottomValue = useMemo(() => insets.bottom + 95, [insets.bottom]);

  const contentContainerStyle = useMemo(() => ({
    paddingBottom: paddingBottomValue,
  }), [paddingBottomValue]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <>
      <Header />
      <StyledScrollView
        paddingTopValue={paddingTopValue}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.text]}
            tintColor={theme.colors.text}
            progressViewOffset={insets.top + 50}
            progressBackgroundColor={isDark ? theme.colors.card : undefined}
          />
        }
      >
        <OverviewButtons />
        <Divider />
        <CollectionSlider />
        <Divider />
        <ArticlesSlider />
        <Divider />
        <SocialLinks 
          // telegramUrl="https://t.me/YummyAnimeList"
          // discordUrl="https://discord.gg/5truHDdzEq"
        />
        <Divider />
        <AnimeScheduleSlider />
        <Divider />
        <LatestComments />
      </StyledScrollView>
    </>
  );
});

OverviewScreen.displayName = 'OverviewScreen';

export default OverviewScreen;
