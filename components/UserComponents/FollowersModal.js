import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Modal, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 32px;
  width: 90%;
  max-height: 70%;
  overflow: hidden;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.TouchableOpacity`
  padding: 4px;
`;

const UserItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const UserItemTouchable = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const FollowButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => `${theme.colors.primary}20`};
  padding: 6px 12px;
  border-radius: 16px;
  margin-left: 8px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const FollowButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
`;

const UserAvatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-right: 12px;
`;

const UserInfo = styled.View`
  flex: 1;
`;

const Username = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const UserStatus = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
  margin-top: 2px;
`;

const EmptyState = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
  margin-top: 12px;
`;

const LoadingContainer = styled.View`
  padding: 40px;
  align-items: center;
`;

const ErrorContainer = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const ErrorText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
  margin-top: 12px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 12px;
`;

const RetryButtonText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
`;

export default function FollowersModal({ 
  visible, 
  onClose, 
  username, 
  type = 'followers' // 'followers' або 'following'
}) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, page: 1 });
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUsers = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const endpoint = type === 'followers' 
        ? `https://api.hikka.io/follow/${username}/followers?page=${page}&size=20`
        : `https://api.hikka.io/follow/${username}/following?page=${page}&size=20`;
      
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        
        // API повертає об'єкт з pagination та list
        if (data && data.list) {
          if (append) {
            setUsers(prevUsers => [...prevUsers, ...data.list]);
          } else {
            setUsers(data.list);
          }
          setPagination(data.pagination || { total: 0, pages: 0, page: 1 });
        } else {
          if (!append) {
            setUsers([]);
            setPagination({ total: 0, pages: 0, page: 1 });
          }
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      
      setError(`Не вдалося завантажити ${type === 'followers' ? 'підписників' : 'підписки'}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (visible && username) {
      fetchUsers();
    }
  }, [visible, username, type]);

  const handleUserPress = (user) => {
    onClose(); // Закриваємо модальне вікно
    navigation.navigate('UserProfileScreen', { username: user.username });
  };

  const loadMoreUsers = () => {
    if (loadingMore || pagination.page >= pagination.pages) return;
    setLoadingMore(true); // Встановлюємо лоадер одразу
    fetchUsers(pagination.page + 1, true);
  };

  // Функція для створення масиву з лоадером або повідомленням про завершення
  const getDataWithLoader = () => {
    const hasMore = pagination.page < pagination.pages;
    if (hasMore && users.length > 0) {
      return [...users, { isLoader: true, username: 'loader' }];
    } else if (!hasMore && users.length > 0) {
      return [...users, { isEndMessage: true, username: 'end-message' }];
    }
    return users;
  };



  const renderUser = ({ item }) => {
    // Якщо це лоадер-елемент
    if (item.isLoader) {
      return (
        <LoadingContainer>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </LoadingContainer>
      );
    }

    // Якщо це повідомлення про завершення
    if (item.isEndMessage) {
      return (
        <LoadingContainer>
          <EmptyText>Всі {type === 'followers' ? 'підписники' : 'підписки'} завантажені</EmptyText>
        </LoadingContainer>
      );
    }

    return (
      <UserItem>
        <UserItemTouchable onPress={() => handleUserPress(item)}>
          <UserAvatar 
            source={
              item.avatar 
                ? { uri: item.avatar }
                : require('../../assets/image/image404.png')
            }
          />
          <UserInfo>
            <Username>{item.username}</Username>
            {item.description && <UserStatus numberOfLines={1}>{item.description}</UserStatus>}
          </UserInfo>
        </UserItemTouchable>
               <FollowButton onPress={() => handleUserPress(item)}>
           <FollowButtonText>Профіль</FollowButtonText>
         </FollowButton>
      </UserItem>
    );
  };

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
        <ErrorContainer>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.gray} />
          <ErrorText>{error}</ErrorText>
          <RetryButton onPress={fetchUsers}>
            <RetryButtonText>Спробувати знову</RetryButtonText>
          </RetryButton>
        </ErrorContainer>
      );
    }

    if (users.length === 0) {
      return (
        <EmptyState>
          <Ionicons 
            name={type === 'followers' ? 'people-outline' : 'person-add-outline'} 
            size={48} 
            color={theme.colors.gray} 
          />
          <EmptyText>
            {type === 'followers' 
              ? 'Поки що немає підписників' 
              : 'Поки що немає підписок'
            }
          </EmptyText>
        </EmptyState>
      );
    }

    return (
      <FlatList
        data={getDataWithLoader()}
        keyExtractor={(item) => item.isLoader ? 'loader' : item.isEndMessage ? 'end-message' : item.username}
        renderItem={renderUser}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreUsers}
        onEndReachedThreshold={0.1}
      />
    );
  };

  const getTitle = () => {
    const baseTitle = type === 'followers' ? 'Стежать' : 'Відстежують';
    if (pagination.total > 0) {
      return `${baseTitle} (${pagination.total})`;
    }
    return baseTitle;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{getTitle()}</ModalTitle>
            <CloseButton onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </CloseButton>
          </ModalHeader>
          {renderContent()}
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
} 