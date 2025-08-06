import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  View,
  Text,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import AnimeRowCard from '../Cards/AnimeRowCard';
import AnimeColumnCard from '../Cards/AnimeColumnCard';

dayjs.extend(relativeTime);
dayjs.locale('uk');

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Move styles outside component to prevent recreation on every render
const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  historyCountBadge: {
    color: theme.colors.gray,
    fontSize: 14,
    marginLeft: 8,
  },

});

const AnimeHistoryBlock = ({ username, limit = 21 }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isGridView, setIsGridView] = useState(false);

  const fetchHistory = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      if (!username) {
        throw new Error('Не вказано користувача');
      }

      const response = await fetch(
        `https://api.hikka.io/history/user/${username}?page=${page}&size=${limit}`
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message || 'Не вдалося завантажити історію');
      }

      const data = await response.json();
      const allHistoryList = data.list || [];
      
      // Фільтруємо тільки аніме-записи
      const animeHistoryTypes = ['watch', 'list', 'score', 'favorite', 'unfavorite'];
      const filteredHistoryList = allHistoryList.filter(item => 
        animeHistoryTypes.includes(item.history_type)
      );
      
      setTotalCount(data.pagination?.total || 0);
      setCurrentPage(page);
      
      // Перевіряємо чи є ще дані для завантаження
      const totalItems = data.pagination?.total || 0;
      
      if (append) {
        setHistory(prev => {
          const newTotalCount = prev.length + filteredHistoryList.length;
          const hasMoreData = newTotalCount < totalItems && filteredHistoryList.length > 0;
          setHasMore(hasMoreData);
          return [...prev, ...filteredHistoryList];
        });
      } else {
        setHistory(filteredHistoryList);
        const hasMoreData = filteredHistoryList.length < totalItems && filteredHistoryList.length > 0;
        setHasMore(hasMoreData);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      if (page === 1) {
        setError(err.message || 'Не вдалося завантажити історію');
      } else {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchHistory();
    }
  }, [username, limit]);



  const formatDate = (timestamp) => {
    return dayjs.unix(timestamp).fromNow();
  };

  const toggleViewMode = useCallback(() => {
    setIsGridView(!isGridView);
  }, [isGridView]);

  const handleRandomHistory = useCallback(() => {
    if (history.length > 0) {
      const randomIndex = Math.floor(Math.random() * history.length);
      const randomItem = history[randomIndex];
      navigation.navigate('AnimeDetails', { slug: randomItem.content.slug });
    }
  }, [history, navigation]);

  const loadMoreHistory = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchHistory(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, loading, currentPage]);

  const handleRetry = useCallback(() => {
    fetchHistory();
  }, []);

  const renderGridItem = useCallback(({ item }) => {
    return (
      <AnimeColumnCard
        anime={item.content}
        historyData={item}
        cardWidth={110}
        imageWidth={110}
        imageHeight={150}
        titleFontSize={12}
        footerFontSize={10}
        badgeFontSize={10}
        badgePadding={3}
        badgeBottom={8}
        badgeLeft={8}
        badgeRight={8}
        marginBottom={8}
        imageBorderRadius={16}
        titleNumberOfLines={2}
      />
    );
  }, []);

  const renderListItem = useCallback(({ item }) => {
    return (
      <AnimeRowCard
        anime={item.content}
        historyData={item}
        imageWidth={85}
        imageHeight={110}
        titleFontSize={16}
        episodesFontSize={14}
        scoreFontSize={14}
        descriptionFontSize={12}
        statusFontSize={10}
        marginBottom={12}
        imageBorderRadius={16}
        titleNumberOfLines={3}
      />
    );
  }, []);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 8 }]}>Завантаження...</Text>
        </View>
      );
    }
    
    if (!hasMore && history.length > 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Вся історія завантажена</Text>
        </View>
      );
    }
    
    return null;
  }, [loadingMore, hasMore, history.length, styles, theme.colors.primary]);

  // Оптимізація для FlatList
  const flatListKey = useMemo(() => 
    `${isGridView ? 'grid' : 'list'}-history`, 
    [isGridView]
  );

  const numColumns = useMemo(() => 
    isGridView ? 3 : 1, 
    [isGridView]
  );

  const columnWrapperStyle = useMemo(() => 
    isGridView ? styles.gridContainer : undefined, 
    [isGridView, styles.gridContainer]
  );

  const contentContainerStyle = useMemo(() => ({
    paddingVertical: 8,
    paddingHorizontal: isGridView ? 8 : 0
  }), [isGridView]);

  const keyExtractor = useCallback((item) => item.reference, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
                  <Text style={styles.headerTitle}>
          {username ? `Історія ${username}` : 'Історія'}
          <Text style={styles.historyCountBadge}>({totalCount})</Text>
        </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleViewMode}>
              <Ionicons 
                name={isGridView ? 'list' : 'grid'} 
                size={20} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleRandomHistory}>
              <Ionicons name="shuffle" size={20} color={theme.colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {username ? `У користувача ${username} немає історії` : 'Виберіть користувача для перегляду історії'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          {username ? `Історія ${username}` : 'Історія'}
          <Text style={styles.historyCountBadge}>({totalCount})</Text>
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleViewMode}>
            <Ionicons 
              name={isGridView ? 'list' : 'grid'} 
              size={20} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRandomHistory}>
            <Ionicons name="shuffle" size={20} color={theme.colors.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={keyExtractor}
        renderItem={isGridView ? renderGridItem : renderListItem}
        key={flatListKey}
        numColumns={numColumns}
        columnWrapperStyle={columnWrapperStyle}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreHistory}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={limit}
      />
    </View>
  );
};

export default AnimeHistoryBlock;
