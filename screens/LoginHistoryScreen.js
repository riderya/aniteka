import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { Platform, FlatList, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import { getLoginHistory, clearLoginHistory, getLoginHistoryCount } from '../utils/loginHistoryDB';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(PlatformBlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background}80;
`;

const HeaderOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

// Видалено ScrollView, щоб уникнути вкладення з FlatList

const ItemContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin: 0 12px 12px 12px;
  flex-direction: row;
  align-items: center;
`;

const ItemText = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

const RightLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  text-align: center;
  margin-top: 16px;
`;

const ClearButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary}20;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  padding: 12px 24px;
  margin: 16px;
  align-items: center;
`;

const ClearButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 16px;
`;

export default function LoginHistoryScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [history, totalCount] = await Promise.all([
        getLoginHistory(),
        getLoginHistoryCount()
      ]);
      setEntries(history || []);
      setCount(totalCount || 0);
    } catch (e) {
      console.error('Error loading login history:', e);
      setEntries([]);
      setCount(0);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Очистити історію',
      'Ви впевнені, що хочете видалити всю історію входів? Цю дію неможливо скасувати.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearLoginHistory();
              await load();
            } catch (e) {
              console.error('Error clearing login history:', e);
            }
          },
        },
      ]
    );
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }) => {
    const date = new Date(item.timestamp);
    const dateStr = isNaN(date) ? item.timestamp : date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return (
      <ItemContainer>
        <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
        <ItemText>
          <Title>{item.username || 'Користувач'}</Title>
          <Subtitle>{dateStr}</Subtitle>
        </ItemText>
        <RightLabel>Aniteka App</RightLabel>
      </ItemContainer>
    );
  };

  const renderEmpty = () => (
    <EmptyContainer>
      <Ionicons name="time-outline" size={64} color={theme.colors.textSecondary} />
      <EmptyText>Історія входів порожня</EmptyText>
    </EmptyContainer>
  );

  return (
    <Container>
      {Platform.OS === 'ios' ? (
        <BlurOverlay intensity={25} tint={isDark ? 'dark' : 'light'}>
          <HeaderTitleBar 
            title={`Історія входів (${count})`}
            showBack={true}
          />
        </BlurOverlay>
      ) : (
        <HeaderOverlay>
          <HeaderTitleBar 
            title={`Історія входів (${count})`}
            showBack={true}
          />
        </HeaderOverlay>
      )}
      <ContentContainer>
        <FlatList
          data={entries}
          keyExtractor={(item, index) => `${item.id || item.timestamp}-${index}`}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={{ 
            paddingTop: 120,
            paddingHorizontal: 0,
            paddingBottom: insets.bottom + 20,
            flexGrow: entries.length === 0 ? 1 : 0
          }}
          ListFooterComponent={entries.length > 0 ? (
            <ClearButton onPress={handleClearHistory}>
              <ClearButtonText>Очистити історію</ClearButtonText>
            </ClearButton>
          ) : null}
          showsVerticalScrollIndicator={false}
        />
      </ContentContainer>
    </Container>
  );
}


