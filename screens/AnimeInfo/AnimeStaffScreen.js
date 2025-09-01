import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
} from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlatformBlurView } from '../../components/Custom/PlatformBlurView';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import HeaderTitleBar from '../../components/Header/HeaderTitleBar';
import StaffCardRow from '../../components/Cards/StaffCardRow';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CenteredContainer = styled(Container)`
  align-items: center;
  justify-content: center;
`;

const BlurOverlay = styled(PlatformBlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const LoadingFooter = styled.View`
  padding: 25px;
  align-items: center;
  justify-content: center;
  min-height: 80px;
`;

const LoadingText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 10px;
  font-size: 14px;
`;

const EndMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 15px;
  font-size: 14px;
  font-weight: 500;
`;

const AnimeStaffScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug, title } = route.params;

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const STAFF_PER_PAGE = 20;
  const headerHeight = insets.top + 60;

  const fetchStaff = useCallback(async (page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      }
      
      const { data } = await axios.get(
        `https://api.hikka.io/anime/${slug}/staff?page=${page}&size=${STAFF_PER_PAGE}`
      );
      
      if (isLoadMore) {
        // Фільтруємо дублікати за slug
        setStaff(prev => {
          const existingSlugs = new Set(prev.map(person => person.person.slug));
          const newStaff = data.list.filter(person => !existingSlugs.has(person.person.slug));
          return [...prev, ...newStaff];
        });
      } else {
        setStaff(data.list);
      }
      
      // Перевіряємо, чи є ще дані для завантаження
      setHasMoreData(data.list.length === STAFF_PER_PAGE);
      setCurrentPage(page);
    } catch (error) {
      
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [slug, STAFF_PER_PAGE]);

  useEffect(() => {
    fetchStaff(1, false);
  }, [fetchStaff]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreData) {
      fetchStaff(currentPage + 1, true);
    }
  }, [loadingMore, hasMoreData, currentPage, fetchStaff]);

  const renderFooter = useCallback(() => {
    // Показуємо лоадер якщо завантажуємо більше або якщо є ще дані для завантаження
    if (loadingMore || (hasMoreData && staff.length > 0)) {
      return (
        <LoadingFooter>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <LoadingText theme={theme}>
            Завантаження авторів...
          </LoadingText>
        </LoadingFooter>
      );
    }
    
    if (!hasMoreData && staff.length > 0) {
      return (
        <EndMessage theme={theme}>
          Всі автори завантажені
        </EndMessage>
      );
    }
    
    return null;
  }, [loadingMore, hasMoreData, staff.length, theme]);

  if (loading) {
    return (
      <CenteredContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </CenteredContainer>
    );
  }

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={title ? `Всі автори: ${title}` : 'Всі автори'} />
      </BlurOverlay>

      <FlatList
        data={staff}
        keyExtractor={(item, index) => `staff-${item.person.slug}-${index}`}
        contentContainerStyle={{
          paddingTop: insets.top + 56 + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 12,
        }}
        renderItem={({ item }) => (
          <StaffCardRow
            person={item.person}
            roles={item.roles}
            onPress={() =>
              navigation.navigate('AnimePeopleDetailsScreen', {
                slug: item.person.slug,
              })
            }
            imageBorderRadius={24}
            imageWidth={90}
            imageHeight={120}
            nameFontSize="16px"
            roleFontSize="13px"
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 140,
          offset: 140 * index,
          index,
        })}
      />
    </Container>
  );
};

export default AnimeStaffScreen;
