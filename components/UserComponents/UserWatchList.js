import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  View,
  Text,
  StyleSheet
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AnimeColumnCard from '../Cards/AnimeColumnCard';
import AnimeRowCard from '../Cards/AnimeRowCard';

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
  statusSelector: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusSelectorText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  statusCountBadge: {
    color: theme.colors.gray,
    fontSize: 14,
    marginLeft: 8,
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
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 1000,
    minWidth: 250,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownOptionLast: {
    borderBottomColor: 'transparent',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  radioButtonUnselected: {
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  dropdownOptionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownOptionCount: {
    color: theme.colors.gray,
    fontSize: 14,
    fontWeight: '400',
  },
});

const UserWatchList = ({ username, watchStatus = 'completed', limit = 21, onStatusChange }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(watchStatus);
  const [statusCounts, setStatusCounts] = useState({});
  const [isGridView, setIsGridView] = useState(true);

  const statusOptions = [
    { key: 'planned', title: 'Заплановано' },
    { key: 'watching', title: 'Дивлюсь' },
    { key: 'completed', title: 'Завершено' },
    { key: 'on_hold', title: 'Відкладено' },
    { key: 'dropped', title: 'Закинуто' }
  ];

  const fetchWatchList = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const requestBody = {
        years: [null, null],
        include_multiseason: false,
        only_translated: false,
        score: [null, null],
        media_type: [],
        rating: [],
        status: [],
        source: [],
        season: [],
        producers: [],
        studios: [],
        genres: [],
        sort: ["watch_score:desc", "watch_created:desc"],
        watch_status: currentStatus
      };

      const response = await fetch(`https://api.hikka.io/watch/${username}/list?page=${page}&size=${limit}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newAnimeList = data.list || [];
      
      setTotalCount(data.pagination?.total || 0);
      setCurrentPage(page);
      
      // Перевіряємо чи є ще дані для завантаження
      const totalItems = data.pagination?.total || 0;
      
      if (append) {
        // Для append режиму використовуємо функцію setState з callback
        setAnimeList(prev => {
          const newTotalCount = prev.length + newAnimeList.length;
          const hasMoreData = newTotalCount < totalItems && newAnimeList.length > 0;
          setHasMore(hasMoreData);

          return [...prev, ...newAnimeList];
        });
      } else {
        // Для першого завантаження
        setAnimeList(newAnimeList);
        const hasMoreData = newAnimeList.length < totalItems && newAnimeList.length > 0;
        setHasMore(hasMoreData);
  
      }
    } catch (err) {
      console.error('Error fetching watch list:', err);
      if (page === 1) {
        setError('Не вдалося завантажити список аніме');
      } else {
        // Для додаткового завантаження не показуємо помилку, а просто зупиняємо
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const counts = {};
      
      // Отримуємо кількість для кожного статусу
      for (const status of statusOptions) {
        const requestBody = {
          years: [null, null],
          include_multiseason: false,
          only_translated: false,
          score: [null, null],
          media_type: [],
          rating: [],
          status: [],
          source: [],
          season: [],
          producers: [],
          studios: [],
          genres: [],
          sort: ["watch_score:desc", "watch_created:desc"],
          watch_status: status.key
        };

        const response = await fetch(`https://api.hikka.io/watch/${username}/list?page=1&size=1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          counts[status.key] = data.pagination?.total || 0;
        } else {
          counts[status.key] = 0;
        }
      }
      
      setStatusCounts(counts);
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  };

  useEffect(() => {
    if (username) {
      fetchWatchList();
      fetchStatusCounts();
    }
  }, [username, currentStatus, limit]);

  useEffect(() => {
    setCurrentStatus(watchStatus);
  }, [watchStatus]);

  const getStatusTitle = (status) => {
    const statusTitles = {
      'completed': 'Завершено',
      'watching': 'Дивлюсь',
      'planned': 'Заплановано',
      'dropped': 'Закинуто',
      'on_hold': 'Відкладено'
    };
    return statusTitles[status] || status;
  };

  const handleStatusSelect = (status) => {
    setCurrentStatus(status);
    setCurrentPage(1);
    setHasMore(true);
    setAnimeList([]); // Очищаємо список при зміні статусу
    setIsDropdownOpen(false);
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleViewMode = useCallback(() => {
    setIsGridView(!isGridView);
  }, [isGridView]);

  const handleRandomAnime = useCallback(() => {
    if (animeList.length > 0) {
      const randomIndex = Math.floor(Math.random() * animeList.length);
      const randomAnime = animeList[randomIndex];
      navigation.navigate('AnimeDetails', { slug: randomAnime.anime.slug });
    }
  }, [animeList, navigation]);

  const loadMoreAnime = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchWatchList(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, loading, currentPage]);



  const handleRetry = useCallback(() => {
    fetchWatchList();
  }, []);

  const renderGridItem = useCallback(({ item }) => (
    <View style={{ 
      flex: 1,
      marginHorizontal: 4,
      marginBottom: 8
    }}>
      <AnimeColumnCard
        anime={{
          ...item.anime,
          score: item.score,
          episodes_released: item.episodes,
          episodes_total: item.anime.episodes_total
        }}
        cardWidth="100%"
        imageWidth="100%"
        imageHeight={140}
        titleFontSize={13}
        footerFontSize={11}
        badgeFontSize={12}
        badgeBottom={5}
        badgeLeft={5}
        badgeRight={5}
        onPress={() => navigation.navigate('AnimeDetails', { slug: item.anime.slug })}
      />
    </View>
  ), [navigation]);

  const renderListItem = useCallback(({ item }) => (
    <AnimeRowCard
      anime={{
        ...item.anime,
        score: item.score,
        episodes_released: item.episodes,
        episodes_total: item.anime.episodes_total
      }}
      imageWidth={90}
      imageHeight={120}
      titleFontSize={16}
      episodesFontSize={15}
      scoreFontSize={15}
      descriptionFontSize={13}
      statusFontSize={11}
      marginBottom={16}
      onPress={() => navigation.navigate('AnimeDetails', { slug: item.anime.slug })}
    />
  ), [navigation]);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 8 }]}>Завантаження...</Text>
        </View>
      );
    }
    
    if (!hasMore && animeList.length > 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Всі аніме завантажені</Text>
        </View>
      );
    }
    
    return null;
  }, [loadingMore, hasMore, animeList.length, styles, theme.colors.primary]);

  // Оптимізація для FlatList
  const flatListKey = useMemo(() => 
    `${isGridView ? 'grid' : 'list'}-${currentStatus}`, 
    [isGridView, currentStatus]
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

  if (animeList.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.statusSelector} onPress={toggleDropdown}>
            <Text style={styles.statusSelectorText}>
              {getStatusTitle(currentStatus)}
              <Text style={styles.statusCountBadge}>({totalCount})</Text>
            </Text>
            <Ionicons 
              name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.gray} 
            />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleViewMode}>
              <Ionicons 
                name={isGridView ? 'list' : 'grid'} 
                size={20} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleRandomAnime}>
              <Ionicons name="shuffle" size={20} color={theme.colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {isDropdownOpen && (
          <View style={styles.dropdownContainer}>
            {statusOptions.map((option, index) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.dropdownOption,
                  index === statusOptions.length - 1 && styles.dropdownOptionLast
                ]}
                onPress={() => handleStatusSelect(option.key)}
              >
                <View style={[
                  styles.radioButton,
                  currentStatus === option.key 
                    ? styles.radioButtonSelected 
                    : styles.radioButtonUnselected
                ]}>
                  {currentStatus === option.key && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.dropdownOptionText}>{option.title}</Text>
                <Text style={styles.dropdownOptionCount}>
                  ({statusCounts[option.key] || 0})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У користувача немає аніме у списку</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.statusSelector} onPress={toggleDropdown}>
          <Text style={styles.statusSelectorText}>
            {getStatusTitle(currentStatus)}
            <Text style={styles.statusCountBadge}>({totalCount})</Text>
          </Text>
          <Ionicons 
            name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.gray} 
          />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleViewMode}>
            <Ionicons 
              name={isGridView ? 'list' : 'grid'} 
              size={20} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRandomAnime}>
            <Ionicons name="shuffle" size={20} color={theme.colors.gray} />
          </TouchableOpacity>
        </View>
      </View>

      {isDropdownOpen && (
        <View style={styles.dropdownContainer}>
          {statusOptions.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.dropdownOption,
                index === statusOptions.length - 1 && styles.dropdownOptionLast
              ]}
              onPress={() => handleStatusSelect(option.key)}
            >
              <View style={[
                styles.radioButton,
                currentStatus === option.key 
                  ? styles.radioButtonSelected 
                  : styles.radioButtonUnselected
              ]}>
                {currentStatus === option.key && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.dropdownOptionText}>{option.title}</Text>
              <Text style={styles.dropdownOptionCount}>
                ({statusCounts[option.key] || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={animeList}
        keyExtractor={keyExtractor}
        renderItem={isGridView ? renderGridItem : renderListItem}
        key={flatListKey}
        numColumns={numColumns}
        columnWrapperStyle={columnWrapperStyle}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreAnime}
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

export default UserWatchList; 