import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl, Platform } from 'react-native';
import styled from 'styled-components/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AnimeRowCard from '../Cards/AnimeRowCard';
import { AnimeRowCardSkeleton } from '../Skeletons';

const AnimeListSection = ({ animeList, sortOptions, toggleSort, showRandomAnime, theme, onRefreshData, isLoading = false, skeletonCount = 5 }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDots, setLoadingDots] = useState('...');


  // Анімація для крапок завантаження
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === '...') return '..';
          if (prev === '..') return '.';
          return '...';
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setLoadingDots('...');
    }
  }, [isLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (error) {
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
      <TextCount theme={theme}>
        {isLoading ? loadingDots : `${animeList.length} Всього`}
      </TextCount>
      <ButtonsRow>
        <SortButton 
          onPress={toggleSort} 
          theme={theme}
          disabled={isLoading}
        >
          <MaterialIcons 
            name="sort" 
            size={24} 
            color={isLoading ? theme.colors.gray + '80' : theme.colors.gray} 
          />
          <SortText theme={theme} style={isLoading ? { opacity: 0.7 } : {}}>
            По {sortOptions[0].includes('score') ? 'оцінкам' : 'додаванню'}
          </SortText>
          <Octicons 
            name="chevron-down" 
            size={24} 
            color={isLoading ? theme.colors.gray + '80' : theme.colors.gray} 
          />
        </SortButton>
        <RandomButton 
          onPress={onRandomPress} 
          theme={theme}
          disabled={isLoading}
        >
          <FontAwesome5 
            name="random" 
            size={20} 
            color={isLoading ? theme.colors.gray + '80' : theme.colors.gray} 
          />
        </RandomButton>
      </ButtonsRow>
    </RowSorting>
  );

  const renderSkeletonItem = () => (
    <AnimeRowCardSkeleton
      imageWidth={90}
      imageHeight={120}
      titleFontSize={16}
      episodesFontSize={15}
      scoreFontSize={15}
      descriptionFontSize={13}
      statusFontSize={11}
      marginBottom={20}
      theme={theme}
    />
  );

  const renderItem = ({ item }) => (
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
    />
  );

  return (
    <Container insets={insets}>
      {!isLoading && animeList?.length === 0 ? (
        <Center>
          <EmptyText>🤷 Нічого не знайдено.</EmptyText>
        </Center>
      ) : (
        <AnimeList
          data={isLoading ? Array(skeletonCount).fill(null) : animeList}
          keyExtractor={(item, index) => item?.slug || `skeleton-${index}`}
          renderItem={isLoading ? renderSkeletonItem : renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.text]}
              tintColor={theme.colors.text}
              progressBackgroundColor={isDark ? theme.colors.card : undefined}
            />
          }
        />
      )}
    </Container>
  );
};

export default AnimeListSection;

// Стилізовані компоненти
const Container = styled.View`
  flex: 1;
  padding: 0 12px;
`;

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
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
  background-color: ${({ theme, disabled }) => 
    disabled ? theme.colors.inputBackground + '80' : theme.colors.inputBackground
  };
  border-radius: 999px;
  padding: 12px 18px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
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
  background-color: ${({ theme, disabled }) => 
    disabled ? theme.colors.inputBackground + '80' : theme.colors.inputBackground
  };
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
`;

const AnimeList = styled.FlatList``;
