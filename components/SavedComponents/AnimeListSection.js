import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import AnimeRowCard from '../Cards/AnimeRowCard';

const AnimeListSection = ({ animeList, sortOptions, toggleSort, showRandomAnime, theme, onRefreshData }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (error) {
      console.log('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const onRandomPress = () => {
    if (showRandomAnime) {
      showRandomAnime(navigation);
    }
  };

  const renderHeader = () => (
    <RowSorting>
      <TextCount theme={theme}>{animeList.length} Всього</TextCount>
      <ButtonsRow>
        <SortButton onPress={toggleSort} theme={theme}>
          <MaterialIcons name="sort" size={24} color={theme.colors.gray} />
          <SortText theme={theme}>
            По {sortOptions[0].includes('score') ? 'оцінкам' : 'додаванню'}
          </SortText>
          <Octicons name="chevron-down" size={24} color={theme.colors.gray} />
        </SortButton>
        <RandomButton onPress={onRandomPress} theme={theme}>
          <FontAwesome5 name="random" size={20} color={theme.colors.gray} />
        </RandomButton>
      </ButtonsRow>
    </RowSorting>
  );

  return (
    <Container>
      <AnimeList
        data={animeList}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => 
        <AnimeRowCard 
        anime={item} 
        navigation={navigation} 
        imageWidth={90}
        imageHeight={120}
        titleFontSize={16}
        episodesFontSize={15}
        scoreFontSize={15} 
        descriptionFontSize={13}
        statusFontSize={11}
        />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.text]}
            tintColor={theme.colors.text}
          />
        }
      />
    </Container>
  );
};

export default AnimeListSection;

const Container = styled.View`
  flex: 1;
  padding: 0 12px;
`;

const RowSorting = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 10px 0px;
`;

const TextCount = styled.Text`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
  flex: 1;
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const SortButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 999px;
  padding: 12px 18px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const SortText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: bold;
`;

const RandomButton = styled.TouchableOpacity`
  border-radius: 999px;
  padding: 12px 18px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const AnimeList = styled.FlatList``;
