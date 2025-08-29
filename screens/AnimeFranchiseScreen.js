import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AnimeRowCard from '../components/Cards/AnimeRowCard';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CountText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  text-transform: uppercase;
`;

const CountContainer = styled.View`
  padding: 0px 12px;
  position: relative;
`;

const CardContainer = styled.View`
  padding: 20px 0px;
  position: relative;
`;

const VerticalLine = styled.View`
  position: absolute;
  left: 49px;
  top: 0;
  height: 20px;
  width: 4px;
  background-color: ${({ theme }) => theme.colors.primary}50;
  z-index: 1;
`;

const BottomVerticalLine = styled.View`
  position: absolute;
  left: 49px;
  bottom: 0;
  height: 20px;
  width: 4px;
  background-color: ${({ theme }) => theme.colors.primary}50;
  z-index: 1;
`;

const CardContent = styled.View`
  z-index: 2;
`;



const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
  margin-top: 16px;
`;

const RetryButton = styled.TouchableOpacity`
  margin-top: 16px;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
`;

const RetryButtonText = styled.Text`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const AnimeFranchiseScreen = () => {
  const [franchise, setFranchise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { slug, title } = route.params || {};
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const fetchFranchise = async (isRefresh = false) => {
    if (!slug) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`https://api.hikka.io/related/anime/${slug}/franchise`);
      const animeFranchise = response.data.anime || [];

      const filtered = animeFranchise
        .filter(item => item.slug !== slug)
        .sort((a, b) => (b.year || 0) - (a.year || 0));

      setFranchise(filtered);
      setError(false);
    } catch (err) {
      console.error('Error fetching franchise:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFranchise();
  }, [slug]);

  const onRefresh = () => {
    fetchFranchise(true);
  };

  const renderCountItem = () => (
    <CountContainer>
      <CardContent>
        <CountText>
        {franchise.length} всього
        </CountText>
      </CardContent>
    </CountContainer>
  );

  const renderAnimeItem = ({ item, index }) => (
    <CardContainer>
      {index > 0 && <VerticalLine />}
      {index < franchise.length - 1 && <BottomVerticalLine />}
      <CardContent>
        <AnimeRowCard 
          anime={item}
          imageWidth={100}
          imageHeight={135}
          titleFontSize={16}
          episodesFontSize={12}
          scoreFontSize={12}
          starIconSize={12}
          descriptionFontSize={12}
          statusFontSize={12}
          marginBottom={0}
          imageBorderRadius={24}
          titleNumberOfLines={2}
        />
      </CardContent>
    </CardContainer>
  );

  const renderEmpty = () => (
    <EmptyContainer>
      <FontAwesome name="film" size={48} color={theme.colors.gray} />
      <EmptyText>
        {error 
          ? 'Помилка завантаження франшизи' 
          : 'Франшиза не знайдена або порожня'
        }
      </EmptyText>
      {error && (
        <RetryButton onPress={() => fetchFranchise()}>
          <RetryButtonText>Спробувати знову</RetryButtonText>
        </RetryButton>
      )}
    </EmptyContainer>
  );

  const renderItem = ({ item, index }) => {
    if (index === 0) {
      return renderCountItem();
    }
    return renderAnimeItem({ item, index: index - 1 });
  };

  const combinedData = [{ type: 'count' }, ...franchise];

  if (loading) {
    return (
      <Container>
        <HeaderTitleBar title={title ? `Пов'язане: ${title}` : "Пов'язане"} />
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderTitleBar title={title ? `Пов'язане: ${title}` : "Пов'язане"} />
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index === 0 ? 'count' : item.slug}
        contentContainerStyle={{
          paddingTop: insets.top + 56 + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 12,
        }}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.text]}
            tintColor={theme.colors.text}
            progressViewOffset={insets.top + 56}
            progressBackgroundColor={isDark ? theme.colors.card : undefined}
          />
        }
      />
    </Container>
  );
};

export default AnimeFranchiseScreen;
