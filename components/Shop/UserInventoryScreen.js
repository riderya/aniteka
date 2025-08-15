import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  getUserPurchases,
  setActiveItem,
  deactivateItem,
  getUserActiveItems,
} from '../../utils/supabase';
import UserCoinsDisplay from '../UserComponents/UserCoinsDisplay';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const SectionContainer = styled.View`
  margin: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const ItemsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const ItemCard = styled.TouchableOpacity`
  width: 48%;
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary + '20' : theme.colors.card};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.border};
`;

const ItemImage = styled.Image`
  width: 100%;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ItemName = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const ItemType = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const ActiveBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 4px;
`;

const ActiveBadgeText = styled.Text`
  color: #fff;
  font-size: 10px;
  font-weight: 600;
`;

const SetActiveButton = styled.TouchableOpacity`
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.border : theme.colors.primary};
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
  align-items: center;
`;

const SetActiveButtonText = styled.Text`
  color: ${({ isActive }) => isActive ? '#666' : '#fff'};
  font-size: 12px;
  font-weight: 600;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: 16px;
`;

const getItemTypeText = (itemType) => {
  switch (itemType) {
    case 'banner': return 'Бенер';
    case 'profile_picture': return 'Аватар';
    case 'avatar_overlay': return 'Оверлей';
    default: return itemType;
  }
};

const UserInventoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [activeItems, setActiveItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!userData?.reference) return;

    try {
      const [purchasesData, activeItemsData] = await Promise.all([
        getUserPurchases(userData.reference),
        getUserActiveItems(userData.reference),
      ]);

      setPurchases(purchasesData);
      setActiveItems(activeItemsData);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [userData?.reference]);

  const handleSetActive = async (purchase) => {
    if (!userData?.reference) {
      Alert.alert('Помилка', 'Спочатку увійдіть в систему');
      return;
    }

    const item = purchase.shop_items;
    if (!item) {
      Alert.alert('Помилка', 'Дані товару не знайдено');
      return;
    }

    const isCurrentlyActive = isItemActive(purchase);

    try {
      let success;
      if (isCurrentlyActive) {
        // Деактивуємо предмет
        success = await deactivateItem(userData.reference, item.item_type);
        if (success) {
          Alert.alert('Успішно!', `${item.name} деактивовано!`);
        } else {
          Alert.alert('Помилка', 'Не вдалося деактивувати предмет');
        }
      } else {
        // Активуємо предмет
        success = await setActiveItem(userData.reference, item.id, item.item_type);
        if (success) {
          Alert.alert('Успішно!', `${item.name} встановлено як активний!`);
        } else {
          Alert.alert('Помилка', 'Не вдалося встановити активний предмет');
        }
      }
      
      if (success) {
        await loadData(); // Перезавантажуємо дані
      }
    } catch (error) {
      Alert.alert('Помилка', 'Сталася помилка при зміні активного предмету');
    }
  };

  const isItemActive = (purchase) => {
    const item = purchase.shop_items;
    if (!item) return false;
    const activeItemId = activeItems[`${item.item_type}_id`];
    return activeItemId === item.id;
  };

  const renderItem = (item) => {
    const active = isItemActive(item);
    
    return (
      <ItemCard key={item.id} theme={theme} isActive={active}>
        <ItemImage
          source={
            item.shop_items?.image_url
              ? { uri: item.shop_items.image_url }
              : require('../../assets/image/item-placeholder.jpg')
          }
          resizeMode="cover"
        />
        <ItemName numberOfLines={2}>
          {item.shop_items?.name || 'Невідомий товар'}
        </ItemName>
        <ItemType theme={theme}>
          {getItemTypeText(item.shop_items?.item_type)}
        </ItemType>
        {active && (
          <ActiveBadge theme={theme}>
            <ActiveBadgeText>Активний</ActiveBadgeText>
          </ActiveBadge>
        )}
        <SetActiveButton
          theme={theme}
          isActive={active}
          onPress={() => handleSetActive(item)}
        >
          <SetActiveButtonText isActive={active}>
            {active ? 'Відключити' : 'Встановити активним'}
          </SetActiveButtonText>
        </SetActiveButton>
      </ItemCard>
    );
  };

  const groupItemsByType = () => {
    const grouped = {};
    purchases.forEach(purchase => {
      const itemType = purchase.shop_items?.item_type;
      if (itemType) {
        if (!grouped[itemType]) {
          grouped[itemType] = [];
        }
        grouped[itemType].push(purchase);
      }
    });
    return grouped;
  };

  const renderSection = (itemType, items) => (
    <SectionContainer key={itemType}>
      <SectionTitle theme={theme}>
        {getItemTypeText(itemType)} ({items.length})
      </SectionTitle>
      <ItemsGrid>
        {items.map(renderItem)}
      </ItemsGrid>
    </SectionContainer>
  );

  if (loading) {
    return (
      <Container theme={theme}>
        <EmptyState>
          <Ionicons name="cube" size={48} color={theme.colors.textSecondary} />
          <EmptyText>Завантаження інвентаря...</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  const groupedItems = groupItemsByType();
  const hasItems = Object.keys(groupedItems).length > 0;

  return (
    <Container theme={theme}>
      <Header theme={theme}>
        <HeaderTitle theme={theme}>Інвентар</HeaderTitle>
        <UserCoinsDisplay onPress={() => navigation.navigate('Shop')} />
      </Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {hasItems ? (
          Object.entries(groupedItems).map(([itemType, items]) =>
            renderSection(itemType, items)
          )
        ) : (
          <EmptyState>
            <Ionicons name="cube-outline" size={48} color={theme.colors.textSecondary} />
            <EmptyText theme={theme}>
              У вас поки немає куплених предметів{'\n'}
              Відвідайте магазин, щоб купити щось!
            </EmptyText>
          </EmptyState>
        )}
      </ScrollView>
    </Container>
  );
};

export default UserInventoryScreen;
