import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../context/ThemeContext';
import CollectionCard from '../Cards/CollectionCard';

const Container = styled.View`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px 0px;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  padding: 6px 12px;
`;

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const EmptyContainer = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  text-align: center;
  margin-top: 10px;
`;

const UserCollectionsBlock = ({ username, reference }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchUserCollections = async (isRefresh = false, page = 1, append = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const authToken = await getAuthToken();
      
      // Створюємо URL з query параметрами
      const url = new URL('https://api.hikka.io/collections');
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', '15');
      
      // Отримуємо колекції користувача через правильний API endpoint
      const collectionsResponse = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: username // Тільки обов'язковий параметр
        }),
      });

      if (!collectionsResponse.ok) {
        const errorText = await collectionsResponse.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${collectionsResponse.status}`);
      }

      const collectionsData = await collectionsResponse.json();
      
      // Отримуємо колекції з правильного поля list
      let collections = [];
      if (collectionsData.list && Array.isArray(collectionsData.list)) {
        collections = collectionsData.list;
      } else if (collectionsData.data && Array.isArray(collectionsData.data)) {
        collections = collectionsData.data;
      } else if (Array.isArray(collectionsData)) {
        collections = collectionsData;
      }
      
      // Отримуємо інформацію про пагінацію
      const pagination = collectionsData.pagination || {};
      const totalItems = pagination.total || 0;
      const totalPages = pagination.pages || 1;
      
      setTotalCount(totalItems);
      setCurrentPage(page);
      
      // Фільтруємо валідні колекції
      const validCollections = collections
        .filter(collection => collection && collection.title && collection.reference);
      
      if (append) {
        setCollections(prev => [...prev, ...validCollections]);
        setHasMore(page < totalPages);
      } else {
        setCollections(validCollections);
        setHasMore(page < totalPages);
      }

    } catch (error) {
      console.error('Error fetching user collections:', error);
      setError(error.message);
      
      if (page === 1) {
        Toast.show({
          type: 'error',
          text1: 'Помилка завантаження',
          text2: 'Не вдалося завантажити колекції користувача',
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMoreCollections = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      fetchUserCollections(false, nextPage, true);
    }
  };

  useEffect(() => {
    if (username && reference) {
      setCurrentPage(1);
      setHasMore(true);
      setCollections([]);
      fetchUserCollections();
    }
  }, [username, reference]);

  const onRefresh = async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchUserCollections(true, 1, false);
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <LoadingContainer>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </LoadingContainer>
      );
    }
    
    if (!hasMore && collections.length > 0) {
      return (
        <EmptyContainer>
          <EmptyText>Всі колекції завантажені</EmptyText>
        </EmptyContainer>
      );
    }
    
    return null;
  };

  const renderCollectionItem = ({ item }) => (
    <View style={{ marginBottom: 24, width: '100%', alignItems: 'center' }}>
      <CollectionCard 
        item={item} 
        compact={false}
        cardWidth={Dimensions.get('window').width - 48} // Ширина з відступами
      />
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </LoadingContainer>
      );
    }

    if (error) {
      return (
        <EmptyContainer>
          <EmptyText>Помилка завантаження колекцій</EmptyText>
        </EmptyContainer>
      );
    }

    if (!collections || collections.length === 0) {
      return (
        <EmptyContainer>
          <EmptyText>У користувача поки немає колекцій</EmptyText>
        </EmptyContainer>
      );
    }

    return (
      <FlatList
        data={collections}
        keyExtractor={(item) => `collection-${item.reference}`}
        vertical
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingVertical: 6,
          alignItems: 'center' // Вирівнюємо по центру
        }}
        renderItem={renderCollectionItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={loadMoreCollections}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter()}
      />
    );
  };

  return (
    <Container>
      <HeaderTitle>Колекції {totalCount > 0 ? `(${totalCount})` : ''}</HeaderTitle>
      {renderContent()}
    </Container>
  );
};

export default UserCollectionsBlock; 