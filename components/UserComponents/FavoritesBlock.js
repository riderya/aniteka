import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import CharacterColumnCard from '../Cards/CharacterColumnCard';
import CollectionCard from '../Cards/CollectionCard';

const { width: screenWidth } = Dimensions.get('window');
// Grid layout constants
const GRID_NUM_COLUMNS = 3;
const CONTAINER_HORIZONTAL_PADDING = 12; // styles.container padding
const CONTENT_HORIZONTAL_PADDING = 8; // contentContainerStyle when grid
const GRID_ITEM_MARGIN_HORIZONTAL = 4; // renderGridItem container marginHorizontal

const CONTENT_TYPES = [
  { key: 'anime', label: 'Аніме', icon: 'tv-outline' },
  { key: 'character', label: 'Персонажі', icon: 'person-outline' },
  { key: 'collection', label: 'Колекції', icon: 'folder-outline' },
];

const ITEMS_PER_PAGE = 21;

// Кеш для API запитів
const apiCache = new Map();

// Дебаунс функція
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 36,
  },
  dropdownButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '120%',
    right: 0,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    zIndex: 1000,
    minWidth: 150,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  viewModeButton: {
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
  gridContainer: {
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  listContainer: {
    paddingVertical: 8,
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: theme.colors.gray,
    fontSize: 14,
    marginTop: 8,
  },
});

const FavoritesBlock = ({ username }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isGridView, setIsGridView] = useState(true);
  const [selectedContentType, setSelectedContentType] = useState('anime');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Дебаунс для зміни типу контенту
  const debouncedContentType = useDebounce(selectedContentType, 300);

  const getContentTypeLabel = useCallback((type) => {
    const contentType = CONTENT_TYPES.find(ct => ct.key === type);
    return contentType ? contentType.label : type;
  }, []);

const fetchFavorites = async (contentType = selectedContentType, page = 1, append = false) => {
  try {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    setError(null);

    // Створюємо ключ для кешу
    const cacheKey = `${contentType}_${username}_${page}`;
    
    // Перевіряємо кеш
    if (apiCache.has(cacheKey)) {
      const cachedData = apiCache.get(cacheKey);
      const newItems = cachedData.list || [];
      const pagination = cachedData.pagination || {};
      const totalItems = pagination.total || 0;
      const totalPages = pagination.pages || 1;

      setTotalCount(totalItems);
      setCurrentPage(page);
      
      if (append) {
        setFavorites(prev => [...prev, ...newItems]);
        setHasMore(page < totalPages);
      } else {
        setFavorites(newItems);
        setHasMore(page < totalPages);
      }
      
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const response = await fetch(
      `https://api.hikka.io/favourite/${contentType}/${username}/list?page=${page}&size=${ITEMS_PER_PAGE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch favorites: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Зберігаємо в кеш
    apiCache.set(cacheKey, data);
    
    // Очищаємо старий кеш (залишаємо тільки останні 50 запитів)
    if (apiCache.size > 50) {
      const firstKey = apiCache.keys().next().value;
      apiCache.delete(firstKey);
    }

    const newItems = data.list || [];
    const pagination = data.pagination || {};
    const totalItems = pagination.total || 0;
    const totalPages = pagination.pages || 1;

    setTotalCount(totalItems);
    setCurrentPage(page);
    
    if (append) {
      setFavorites(prev => [...prev, ...newItems]);
      setHasMore(page < totalPages);
    } else {
      setFavorites(newItems);
      setHasMore(page < totalPages);
    }
  } catch (err) {
    
    if (page === 1) {
      setError(`Не вдалося завантажити улюблені ${getContentTypeLabel(contentType).toLowerCase()}: ${err.message}`);
    } else {
      setHasMore(false);
    }
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};


  const loadMoreFavorites = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      fetchFavorites(selectedContentType, nextPage, true);
    }
  }, [loadingMore, hasMore, loading, currentPage, selectedContentType]);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setFavorites([]);
    fetchFavorites();
  }, [username, debouncedContentType]); // Використовуємо дебаунс

  const toggleViewMode = useCallback(() => {
    setIsGridView(!isGridView);
  }, [isGridView]);

  const handleContentTypeSelect = useCallback((contentType) => {
    setSelectedContentType(contentType);
    setShowDropdown(false);
  }, []);

  const handleRetry = useCallback(() => {
    fetchFavorites();
  }, []);

  const renderGridItem = useCallback(({ item }) => (
    <View style={{ 
      width: selectedContentType === 'collection' 
        ? '100%'
        : ((screenWidth - (CONTAINER_HORIZONTAL_PADDING * 2) - (CONTENT_HORIZONTAL_PADDING * 2)) - (GRID_NUM_COLUMNS * GRID_ITEM_MARGIN_HORIZONTAL * 2)) / GRID_NUM_COLUMNS,
      marginHorizontal: selectedContentType === 'collection' ? 0 : GRID_ITEM_MARGIN_HORIZONTAL,
      marginBottom: 8
    }}>
      {selectedContentType === 'anime' && (
        <AnimeColumnCard
          anime={item}
          cardWidth="100%"
          imageWidth="100%"
          imageHeight={155}
          titleFontSize={13}
          footerFontSize={11}
          badgeFontSize={12}
          badgeBottom={5}
          badgeLeft={5}
          badgeRight={5}
          onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
        />
      )}
      {selectedContentType === 'character' && (
        <CharacterColumnCard 
          character={item}
          width="100%"
          height="140px"
          fontSize="13px"
          cardWidth="100%"
          onPress={() => navigation.navigate('CharacterDetails', { slug: item.slug })}
        />
      )}
      {selectedContentType === 'collection' && (
        <CollectionCard 
          item={item}
          compact={false}
          cardWidth={screenWidth - 48}
          onPress={() => navigation.navigate('CollectionDetails', { slug: item.slug })}
        />
      )}
    </View>
  ), [selectedContentType, navigation]);

  const renderListItem = useCallback(({ item }) => {
    switch (selectedContentType) {
      case 'anime':
        return (
          <AnimeRowCard 
            anime={item}
            onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
          />
        );
      case 'character':
        return (
          <CharacterColumnCard 
            character={item}
            width="60px"
            height="80px"
            fontSize="14px"
            cardWidth="100%"
            onPress={() => navigation.navigate('CharacterDetails', { slug: item.slug })}
          />
        );
      case 'collection':
        return (
          <CollectionCard 
            item={item}
            compact={false}
            onPress={() => navigation.navigate('CollectionDetails', { slug: item.slug })}
          />
        );
      default:
        return (
          <AnimeRowCard 
            anime={item}
            onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
          />
        );
    }
  }, [selectedContentType, navigation]);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingMoreText}>Завантаження...</Text>
        </View>
      );
    }
    
    if (!hasMore && favorites.length > 0) {
      return (
        <View style={styles.loadingMoreContainer}>
          <Text style={styles.loadingMoreText}>Всі {getContentTypeLabel(selectedContentType).toLowerCase()} завантажені</Text>
        </View>
      );
    }
    
    return null;
  }, [loadingMore, hasMore, favorites.length, getContentTypeLabel, selectedContentType, styles, theme.colors.primary]);

  const keyExtractor = useCallback((item, index) => `${item.slug || item.id || 'item'}-${index}`, []);
  
  const flatListKey = useMemo(() => 
    `${isGridView ? 'grid' : 'list'}-${selectedContentType}-${isGridView ? (selectedContentType === 'collection' ? 1 : 3) : 1}`, 
    [isGridView, selectedContentType]
  );

  const numColumns = useMemo(() => 
    isGridView ? (selectedContentType === 'collection' ? 1 : 3) : 1, 
    [isGridView, selectedContentType]
  );

  const columnWrapperStyle = useMemo(() => 
    isGridView && selectedContentType !== 'collection' ? styles.gridContainer : undefined, 
    [isGridView, selectedContentType, styles.gridContainer]
  );

  const contentContainerStyle = useMemo(() => ({
    paddingVertical: 8,
    paddingHorizontal: isGridView && selectedContentType !== 'collection' ? 8 : 0
  }), [isGridView, selectedContentType]);

  // Оптимізація для різних типів контенту
  const flatListProps = useMemo(() => {
    const baseProps = {
      removeClippedSubviews: true,
      showsVerticalScrollIndicator: false,
      scrollEnabled: true,
      onEndReached: loadMoreFavorites,
      onEndReachedThreshold: 0.1,
      ListFooterComponent: renderFooter,
      updateCellsBatchingPeriod: 50,
      disableVirtualization: false,
    };

    if (selectedContentType === 'collection') {
      return {
        ...baseProps,
        maxToRenderPerBatch: 3,
        windowSize: 5,
        initialNumToRender: 6,
        getItemLayout: (data, index) => ({
          length: 220, // висота колекції + відступи
          offset: 220 * index,
          index,
        }),
      };
    }

    return {
      ...baseProps,
      maxToRenderPerBatch: 10,
      windowSize: 10,
      initialNumToRender: ITEMS_PER_PAGE,
    };
  }, [selectedContentType, loadMoreFavorites, renderFooter]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          {getContentTypeLabel(selectedContentType)} ({totalCount > 0 ? totalCount : favorites.length})
        </Text>
        <View style={styles.controlsContainer}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Ionicons 
                name={CONTENT_TYPES.find(ct => ct.key === selectedContentType)?.icon || 'list'} 
                size={16} 
                color={theme.colors.text}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dropdownButtonText}>
                {getContentTypeLabel(selectedContentType)}
              </Text>
              <Ionicons 
                name={showDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
            
            {showDropdown && (
              <View style={styles.dropdownMenu}>
                {CONTENT_TYPES.map((contentType, index) => (
                  <TouchableOpacity
                    key={contentType.key}
                    style={[
                      styles.dropdownOption,
                      index === CONTENT_TYPES.length - 1 && styles.dropdownOptionLast,
                      selectedContentType === contentType.key && styles.dropdownOptionSelected
                    ]}
                    onPress={() => handleContentTypeSelect(contentType.key)}
                  >
                    <View style={[
                      styles.radioButton,
                      selectedContentType === contentType.key && styles.radioButtonSelected
                    ]}>
                      {selectedContentType === contentType.key && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      selectedContentType === contentType.key && styles.optionTextSelected
                    ]}>
                      {contentType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.viewModeButton} onPress={toggleViewMode}>
            <Ionicons 
              name={isGridView ? 'list' : 'grid'} 
              size={20} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            У користувача поки немає улюблених {getContentTypeLabel(selectedContentType).toLowerCase()}
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={keyExtractor}
          renderItem={isGridView ? renderGridItem : renderListItem}
          key={flatListKey}
          numColumns={numColumns}
          columnWrapperStyle={columnWrapperStyle}
          contentContainerStyle={contentContainerStyle}
          {...flatListProps}
        />
      )}
    </View>
  );
};

export default FavoritesBlock; 