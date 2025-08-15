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
  getShopCategories,
  getShopItems,
  getFeaturedItems,
  purchaseItem,
  getUserCoins,
  getPurchasedItemIds,
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

const CategoryContainer = styled.View`
  margin: 16px;
`;

const CategoryTitle = styled.Text`
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
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
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

const ItemPrice = styled.Text`
  font-size: 12px;
  color: #FFD700;
  font-weight: 600;
`;

const ItemRarity = styled.Text`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`;

const BuyButton = styled.TouchableOpacity`
  background-color: ${({ theme, disabled }) => 
    disabled ? theme.colors.border : theme.colors.primary};
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
  align-items: center;
`;

const BuyButtonText = styled.Text`
  color: ${({ disabled }) => disabled ? '#666' : '#fff'};
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

const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'rare': return '#3B82F6';
    case 'epic': return '#8B5CF6';
    case 'legendary': return '#F59E0B';
    default: return '#9CA3AF';
  }
};

const getRarityText = (rarity) => {
  switch (rarity) {
    case 'common': return 'Звичайний';
    case 'rare': return 'Рідкісний';
    case 'epic': return 'Епічний';
    case 'legendary': return 'Легендарний';
    default: return 'Звичайний';
  }
};

const ShopScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryItems, setCategoryItems] = useState({});
  const [categoryLoading, setCategoryLoading] = useState({});
  const [purchasedItemIds, setPurchasedItemIds] = useState([]);

  const loadData = async () => {
    try {
      const [categoriesData, featuredData, coins, purchasedIds] = await Promise.all([
        getShopCategories(),
        getFeaturedItems(),
        userData?.reference ? getUserCoins(userData.reference) : 0,
        userData?.reference ? getPurchasedItemIds(userData.reference) : [],
      ]);
      
      setCategories(categoriesData);
      setFeaturedItems(featuredData);
      setUserCoins(coins);
      setPurchasedItemIds(purchasedIds);
      
      // Завантажуємо товари для кожної категорії
      if (categoriesData.length > 0) {
        const itemsPromises = categoriesData.map(async (category) => {
          try {
            const items = await getShopItems(category.id);
            return { categoryId: category.id, items };
          } catch (error) {
  
            return { categoryId: category.id, items: [] };
          }
        });
        
        const itemsResults = await Promise.all(itemsPromises);
        const itemsMap = {};
        itemsResults.forEach(({ categoryId, items }) => {
          itemsMap[categoryId] = items;
        });
        setCategoryItems(itemsMap);
      }
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

  const handlePurchase = async (item) => {
    if (!userData?.reference) {
      Alert.alert('Помилка', 'Спочатку увійдіть в систему');
      return;
    }

    if (userCoins < item.price) {
      Alert.alert('Недостатньо монет', 'У вас недостатньо монет для покупки цього товару');
      return;
    }

    Alert.alert(
      'Підтвердження покупки',
      `Ви хочете купити "${item.name}" за ${item.price} монет?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Купити',
          onPress: async () => {
            try {
              const result = await purchaseItem(userData.reference, item.id);
              if (result.success) {
                Alert.alert('Успішно!', 'Товар куплено!');
                setUserCoins(result.remainingCoins);
                // Оновлюємо список куплених товарів
                setPurchasedItemIds(prev => [...prev, item.id]);
              } else {
                Alert.alert('Помилка', result.error || 'Не вдалося купити товар');
              }
            } catch (error) {
              Alert.alert('Помилка', 'Сталася помилка при покупці');
            }
          },
        },
      ]
    );
  };

  const renderItem = (item) => {
    const isPurchased = purchasedItemIds.includes(item.id);
    const canAfford = userCoins >= item.price;
    const isDisabled = isPurchased || !canAfford;

    return (
      <ItemCard key={item.id} onPress={() => !isPurchased && handlePurchase(item)}>
        <ItemImage
          source={
            item.image_url
              ? { uri: item.image_url }
              : require('../../assets/image/item-placeholder.jpg')
          }
          resizeMode="cover"
        />
        <ItemName numberOfLines={2}>{item.name}</ItemName>
        <ItemPrice>{item.price} монет</ItemPrice>
        <ItemRarity style={{ color: getRarityColor(item.rarity) }}>
          {getRarityText(item.rarity)}
        </ItemRarity>
        <BuyButton
          disabled={isDisabled}
          onPress={() => !isPurchased && handlePurchase(item)}
        >
          <BuyButtonText disabled={isDisabled}>
            {isPurchased ? 'Ви вже купили' : !canAfford ? 'Недостатньо монет' : 'Купити'}
          </BuyButtonText>
        </BuyButton>
      </ItemCard>
    );
  };

  const renderCategory = (category) => {
    const items = categoryItems[category.id] || [];
    const isLoading = categoryLoading[category.id];

    if (isLoading) {
      return (
        <CategoryContainer key={category.id}>
          <CategoryTitle theme={theme}>{category.name}</CategoryTitle>
          <EmptyText theme={theme}>Завантаження...</EmptyText>
        </CategoryContainer>
      );
    }

    if (items.length === 0) {
      return null;
    }

    return (
      <CategoryContainer key={category.id}>
        <CategoryTitle theme={theme}>{category.name}</CategoryTitle>
        <ItemsGrid>
          {items.map(renderItem)}
        </ItemsGrid>
      </CategoryContainer>
    );
  };

  if (loading) {
    return (
      <Container theme={theme}>
        <EmptyState>
          <Ionicons name="storefront" size={48} color={theme.colors.textSecondary} />
          <EmptyText>Завантаження магазину...</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
      <Header theme={theme}>
        <HeaderTitle theme={theme}>Магазин</HeaderTitle>
        <UserCoinsDisplay onPress={() => navigation.navigate('Inventory')} />
      </Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {featuredItems.length > 0 && (
          <CategoryContainer>
            <CategoryTitle theme={theme}>Рекомендовані</CategoryTitle>
            <ItemsGrid>
              {featuredItems.map(renderItem)}
            </ItemsGrid>
          </CategoryContainer>
        )}

        {categories.map(renderCategory)}
      </ScrollView>
    </Container>
  );
};

export default ShopScreen;
