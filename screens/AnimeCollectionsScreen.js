import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import CollectionCard from '../components/Cards/CollectionCard';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 20;

const contentTypeOptions = ['anime', 'manga', 'novel', 'character', 'person'];
const sortOptions = ['system_ranking:desc', 'created:desc'];

const AnimeCollectionsScreen = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [sort, setSort] = useState(sortOptions[0]);
  const [contentType, setContentType] = useState(contentTypeOptions[0]);

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const fetchCollections = useCallback(
    async (pageNumber = 1) => {
      try {
        if (pageNumber === 1) setLoading(true);
        else setIsFetchingMore(true);

        const response = await axios.post(
          `https://api.hikka.io/collections?page=${pageNumber}&size=${PAGE_SIZE}`,
          {
            sort: [sort],
            content_type: contentType,
            only_public: true,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const newData = response.data.list || [];

        setCollections((prev) =>
          pageNumber === 1 ? newData : [...prev, ...newData]
        );
        setHasMore(newData.length === PAGE_SIZE);
      } catch (error) {
        console.error(
          'Помилка при завантаженні колекцій:',
          error.response?.data || error.message
        );
      } finally {
        if (pageNumber === 1) setLoading(false);
        else setIsFetchingMore(false);
      }
    },
    [sort, contentType]
  );

  useEffect(() => {
    setPage(1);
    fetchCollections(1);
  }, [sort, contentType]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCollections(nextPage);
    }
  };

  const renderHeader = () => (
    <FilterContainer>
      <DropdownWrapper>
        <DropdownButton onPress={() => setTypeDropdownOpen(!typeDropdownOpen)}>
          <DropdownText>Тип: {contentType}</DropdownText>
          <Ionicons name="chevron-down" size={16} color="#999" />
        </DropdownButton>
        {typeDropdownOpen &&
          contentTypeOptions.map((option) => (
            <DropdownOption
              key={option}
              onPress={() => {
                setContentType(option);
                setTypeDropdownOpen(false);
              }}
            >
              <DropdownText>{option}</DropdownText>
            </DropdownOption>
          ))}
      </DropdownWrapper>

      <DropdownWrapper>
        <DropdownButton onPress={() => setSortDropdownOpen(!sortDropdownOpen)}>
          <DropdownText>Сортування</DropdownText>
          <Ionicons name="chevron-down" size={16} color="#999" />
        </DropdownButton>
        {sortDropdownOpen &&
          sortOptions.map((option) => (
            <DropdownOption
              key={option}
              onPress={() => {
                setSort(option);
                setSortDropdownOpen(false);
              }}
            >
              <DropdownText>{option}</DropdownText>
            </DropdownOption>
          ))}
      </DropdownWrapper>
    </FilterContainer>
  );

  return (
    <>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title="Колекції" />
      </BlurOverlay>

      <Wrapper>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={collections}
            keyExtractor={(item, index) => item.reference + index}
            renderItem={({ item }) => <CollectionCard item={item} />}
            contentContainerStyle={{
              paddingTop: 115,
              paddingBottom: 12 + insets.bottom,
              paddingHorizontal: 12,
            }}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
              ) : null
            }
          />
        )}
      </Wrapper>
    </>
  );
};

export default AnimeCollectionsScreen;

const Wrapper = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const FilterContainer = styled.View`
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const DropdownWrapper = styled.View`
  flex: 1;
`;

const DropdownButton = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 999px;
  height: 50px;
  padding: 0px 12px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const DropdownOption = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 10px;
  border-radius: 8px;
  margin-top: 4px;
`;

const DropdownText = styled(Text)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;
