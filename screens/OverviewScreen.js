import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header/Header';
import OverviewButtons from '../components/OverviewComponents/OverviewButtons';
import ArticlesSlider from '../components/OverviewComponents/ArticlesSlider';
import CollectionSlider from '../components/OverviewComponents/CollectionSlider';
import AnimeScheduleSlider from '../components/OverviewComponents/AnimeScheduleSlider';
import LatestComments from '../components/OverviewComponents/LatestComments';
import SocialLinks from '../components/OverviewComponents/SocialLinks';

const StyledScrollView = styled.ScrollView`
  flex-grow: 1;
  padding-top: ${({ paddingTopValue }) => paddingTopValue}px;
  background: ${({ theme }) => theme.colors.background};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 20px 12px;
`;

const OverviewScreen = React.memo(() => {
  const insets = useSafeAreaInsets();

  const paddingTopValue = useMemo(() => insets.top + 70, [insets.top]);
  const paddingBottomValue = useMemo(() => insets.bottom + 205, [insets.bottom]);

  const contentContainerStyle = useMemo(() => ({
    paddingBottom: paddingBottomValue,
  }), [paddingBottomValue]);

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
