import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
  Platform,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import CollectionCard from '../components/Cards/CollectionCard';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const PAGE_SIZE = 20;
const contentTypeOptions = ['anime', 'character', 'person'];

const sortOptions = [
  { label: 'За рейтингом', value: 'system_ranking:desc' },
  { label: 'Найновіші', value: 'created:desc' },
];

const AnimeCollectionsScreen = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const fetchCollections = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const allResults = await Promise.all(
        contentTypeOptions.map((type) =>
          axios.post(
            `https://api.hikka.io/collections?page=1&size=${PAGE_SIZE}`,
            {
              sort: [sort],
              content_type: type,
              only_public: true,
            },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          )
        )
      );

      const combined = allResults.flatMap(res => res.data.list || []);
      setCollections(combined);
    } catch (error) {
      
    } finally {
      if (!silent) setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchCollections();
  }, [sort]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCollections(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCollections]);

  const renderHeader = () => (
    <FilterContainer>
      <DropdownButton onPress={() => setIsSortModalVisible(true)}>
        <DropdownText>
          {sortOptions.find((opt) => opt.value === sort)?.label || 'Сортування'}
        </DropdownText>
        <Ionicons name="chevron-down" size={16} color="#999" />
      </DropdownButton>
    </FilterContainer>
  );

  return (
    <>
      <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
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
              paddingTop: insets.top + 56 + 20,
              paddingBottom: 20 + insets.bottom,
              paddingHorizontal: 12,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
            ListHeaderComponent={renderHeader}
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
            showsVerticalScrollIndicator={false}
          />
        )}
      </Wrapper>

      {/* Модальне вікно сортування */}
      <Modal
        transparent
        animationType="fade"
        visible={isSortModalVisible}
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <ModalBackdrop onPress={() => setIsSortModalVisible(false)}>
          <Pressable onPress={() => {}} style={{ width: '80%' }}>
            <ModalContainer>
{sortOptions.map((option) => {
  const isSelected = sort === option.value;
  return (
    <SortOption
      key={option.value}
      onPress={() => {
        setSort(option.value);
        setIsSortModalVisible(false);
      }}
    >
      <SortRow>
        <Checkbox>
          {isSelected && <InnerCircle />}
        </Checkbox>
        <SortText>{option.label}</SortText>
      </SortRow>
    </SortOption>
  );
})}

            </ModalContainer>
          </Pressable>
        </ModalBackdrop>
      </Modal>
    </>
  );
};

export default AnimeCollectionsScreen;

// === Styled Components ===

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
  gap: 12px;
  margin-bottom: 16px;
`;

const DropdownButton = styled(TouchableOpacity)`
  padding: 0px 12px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const DropdownText = styled(Text)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: 600;
`;

const ModalBackdrop = styled(Pressable)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 20px;
  border-radius: 32px;
  width: 100%;
`;

const SortOption = styled.TouchableOpacity`
  padding: 12px 0;
`;

const SortRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const SortText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const Checkbox = styled.View`
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const InnerCircle = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
`;
