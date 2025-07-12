import React from 'react';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header/Header';
import TrendingSlider from '../components/OverviewComponents/TrendingSlider';
import OverviewButtons from '../components/OverviewComponents/OverviewButtons';
import ArticlesSlider from '../components/OverviewComponents/ArticlesSlider';
import CollectionSlider from '../components/OverviewComponents/CollectionSlider';
import AnimeScheduleSlider from '../components/OverviewComponents/AnimeScheduleSlider';
import LatestComments from '../components/OverviewComponents/LatestComments';

const StyledScrollView = styled.ScrollView`
  flex-grow: 1;
  padding-top: ${({ paddingTopValue }) => paddingTopValue}px;
  background: ${({ theme }) => theme.colors.background};
`;

const OverviewScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Header />
      <StyledScrollView
        paddingTopValue={insets.top + 70}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 75,
        }}
      >
        <TrendingSlider />
        <OverviewButtons />
        <ArticlesSlider />
        <CollectionSlider />
        <AnimeScheduleSlider />
        <LatestComments />
      </StyledScrollView>
    </>
  );
};


export default OverviewScreen;
