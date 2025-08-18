import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { FlatList, ActivityIndicator, Alert, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import toastConfig from '../components/CustomToast';

import Header from '../components/Header/Header';
import UserAvatar from '../components/UserComponents/UserAvatar';
import FollowStatsBlock from '../components/UserComponents/FollowStatsBlock';
import UserActivityBlock from '../components/UserComponents/UserActivityBlock';
import StatsDonutBlock from '../components/UserComponents/StatsDonutBlock';
import UserWatchList from '../components/UserComponents/UserWatchList';
import UserCollectionsBlock from '../components/UserComponents/UserCollectionsBlock';
import AnimeHistoryBlock from '../components/UserComponents/AnimeHistoryBlock';
import FavoritesBlock from '../components/UserComponents/FavoritesBlock';
import LoginComponent from '../components/Auth/LoginComponent';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';



const HeaderContainer = styled.View`
  position: relative;
  height: 220px;
  overflow: hidden;
`;

const CoverImage = styled.Image`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const CoverOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background-color: rgba(0, 0, 0, 0.4); */
`;

const FollowButton = styled.TouchableOpacity`
  padding: 14px 24px;
  border-radius: 999px;
  background-color: ${({ isFollowed, theme, disabled }) => 
    disabled ? theme.colors.card : 
    isFollowed ? theme.colors.card : theme.colors.primary};
  border: 1px solid ${({ isFollowed, theme, disabled }) => 
    disabled ? 'rgba(128, 128, 128, 0.3)' :
    isFollowed ? theme.colors.border : 'transparent'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const FollowButtonText = styled.Text`
  color: ${({ isFollowed, theme, disabled }) => 
    disabled ? theme.colors.gray : 
    isFollowed ? theme.colors.text : '#ffffff'};
  font-weight: 600;
  font-size: 16px;
`;

const FollowButtonIconWrapper = styled.View`
  margin-right: 8px;
`;

const UserInfoContainer = styled.View`
  margin-top: -80px;
  padding: 0px 12px;
  align-items: center;
`;



const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  text-align: center;
  margin-bottom: 20px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 12px 24px;
  border-radius: 8px;
`;

const RetryButtonText = styled.Text`
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
`;

const RoleBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 4px 12px;
  border-radius: 12px;
  margin-top: 8px;
`;

const RoleText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const ProfileInfoContainer = styled.View`
  margin-top: 16px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  gap: 8px;
`;

const ProfileInfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ProfileInfoLabel = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const ProfileInfoValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

const ProfileActionButtonsContainer = styled.View`
  margin-top: 20px;
  padding: 0px;
`;

const ActionButtonsScrollView = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingLeft: 12,
  },
})``;

const ActionButton = styled.TouchableOpacity`
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.card};
  padding: 12px 20px;
  border-radius: 25px;
  margin-right: 12px;
  border: 1px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.border};
  min-width: 100px;
  align-items: center;
  flex-direction: row;
  gap: 8px;
`;

const ActionButtonText = styled.Text`
  color: ${({ theme, isActive }) => 
    isActive ? '#ffffff' : theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Невідомо';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);
  
  if (years > 0) {
    return `${years} ${years === 1 ? 'рік' : years < 5 ? 'роки' : 'років'} тому`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? 'місяць' : months < 5 ? 'місяці' : 'місяців'} тому`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дні' : 'днів'} тому`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'годину' : hours < 5 ? 'години' : 'годин'} тому`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'хвилину' : minutes < 5 ? 'хвилини' : 'хвилин'} тому`;
  } else {
    return 'Щойно';
  }
};

const UserProfile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { isAuthenticated: authIsAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [animeHours, setAnimeHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [watchStats, setWatchStats] = useState({ 
    duration: 0, 
    completed: 0, 
    watching: 0, 
    planned: 0, 
    dropped: 0, 
    on_hold: 0 
  });
  const [isFollowed, setIsFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('statistics');

  const username = route.params?.username || 'hikka';
  
  // Перевіряємо чи це профіль поточного користувача
  const isOwnProfile = currentUser?.username === username;

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  // Оновлюємо renderData коли змінюється activeTab
  useEffect(() => {
    // Це забезпечить перерендер FlatList при зміні табу
  }, [activeTab]);

  // Prepare data for FlatList
  const renderData = [
    { type: 'header', id: 'header' },
    { type: 'followStats', id: 'followStats' },
    { type: 'followButton', id: 'followButton' },
    { type: 'actionButtons', id: 'actionButtons' },
    // Показуємо блоки в залежності від активного табу
    ...(activeTab === 'statistics' ? [{ type: 'watchStats', id: 'watchStats' }] : []),
    ...(activeTab === 'animeList' ? [{ type: 'watchList', id: 'watchList' }] : []),
    ...(activeTab === 'favorites' ? [{ type: 'favorites', id: 'favorites' }] : []),
    ...(activeTab === 'collections' ? [{ type: 'collections', id: 'collections' }] : []),
    ...(activeTab === 'history' ? [{ type: 'history', id: 'history' }] : []),
    ...(activeTab === 'statistics' && activityData.length > 0 ? [{ type: 'activity', id: 'activity' }] : [])
  ];

  // Get auth token
  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('hikka_token');
    } catch (err) {
      
      return null;
    }
  };

  // API functions
  const checkFollowStatus = async () => {
    try {
      const token = await getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['Cookie'] = `auth=${token}`;
      }

      const response = await fetch(`https://api.hikka.io/follow/${username}`, {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.follow;
      }
      return false;
    } catch (err) {
      
      return false;
    }
  };

  const followUser = async () => {
    try {
      const token = await getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['Cookie'] = `auth=${token}`;
      }

      const response = await fetch(`https://api.hikka.io/follow/${username}`, {
        method: 'PUT',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.follow;
      }
      return false;
    } catch (err) {
      
      return false;
    }
  };

  const unfollowUser = async () => {
    try {
      const token = await getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['Cookie'] = `auth=${token}`;
      }

      const response = await fetch(`https://api.hikka.io/follow/${username}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return !data.follow;
      }
      return false;
    } catch (err) {
      
      return false;
    }
  };

  const fetchFollowStats = async () => {
    try {
      const response = await fetch(`https://api.hikka.io/follow/${username}/stats`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      return { followers: 0, following: 0 };
    } catch (err) {
      
      return { followers: 0, following: 0 };
    }
  };

  const fetchWatchStats = async () => {
    try {
      const response = await fetch(`https://api.hikka.io/watch/${username}/stats`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return { 
        duration: 0, 
        completed: 0, 
        watching: 0, 
        planned: 0, 
        dropped: 0, 
        on_hold: 0 
      };
    } catch (err) {
      
      return { 
        duration: 0, 
        completed: 0, 
        watching: 0, 
        planned: 0, 
        dropped: 0, 
        on_hold: 0 
      };
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (err) {
      
    }
  };

  const fetchUserProfile = async () => {
    try {
      setError(null);
      const response = await fetch(`https://api.hikka.io/user/${username}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      
      setError('Не вдалося завантажити профіль користувача');
    }
  };

  const fetchUserActivity = async () => {
    try {
      const response = await fetch(`https://api.hikka.io/user/${username}/activity`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setActivityData(data);
      
      // Try to get actual watch duration from watch stats first
      try {
        const watchResponse = await fetch(`https://api.hikka.io/watch/${username}/stats`);
        if (watchResponse.ok) {
          const watchData = await watchResponse.json();
          if (watchData.duration && watchData.duration > 0) {
            // Convert duration to hours (assuming duration is in minutes)
            const hours = Math.round(watchData.duration / 60);
            setAnimeHours(hours);
            return;
          }
        }
      } catch (watchErr) {
        
      }
      
      // Fallback: Calculate total anime hours from activity data
      // The actions field might represent episodes watched or time spent
      const totalActions = data.reduce((sum, item) => sum + (item.actions || 0), 0);
      // Assuming each action represents about 20 minutes of anime watching
      const estimatedMinutesPerAction = 20;
      const totalMinutes = totalActions * estimatedMinutesPerAction;
      const totalHours = Math.round(totalMinutes / 60);
      setAnimeHours(totalHours);
    } catch (err) {
      
      // Don't set error for activity, just log it
      setAnimeHours(0);
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    // Check authentication first
    const token = await getAuthToken();
    setIsAuthenticated(!!token);
    
    const promises = [
      fetchUserProfile(), 
      fetchUserActivity(),
      fetchWatchStats().then(stats => setWatchStats(stats)),
      fetchFollowStats().then(stats => setFollowStats(stats))
    ];
    
    // Load current user data if authenticated
    if (token) {
      promises.push(fetchCurrentUser());
      promises.push(
        checkFollowStatus().then(status => setIsFollowed(status))
      );
    }
    
    await Promise.all(promises);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <>
            <HeaderContainer>
              {userData?.cover && (
                <>
                  <CoverImage
                    source={{ uri: userData.cover }}
                    resizeMode="cover"
                  />
                  <CoverOverlay />
                </>
              )}
            </HeaderContainer>
            <UserInfoContainer>
              <UserAvatar userData={userData} showEmailButton={false} showUserBadge={true} />
            </UserInfoContainer>
          </>
        );
      
             case 'actionButtons':
         return (
           <ProfileActionButtonsContainer>
             <ActionButtonsScrollView>
               <ActionButton 
                 isActive={activeTab === 'statistics'} 
                 onPress={() => handleTabPress('statistics')}
               >
                 <Ionicons 
                   name="stats-chart" 
                   size={16} 
                   color={activeTab === 'statistics' ? '#ffffff' : theme.colors.text} 
                 />
                 <ActionButtonText isActive={activeTab === 'statistics'}>
                   Статистика
                 </ActionButtonText>
               </ActionButton>
               
               <ActionButton 
                 isActive={activeTab === 'animeList'} 
                 onPress={() => handleTabPress('animeList')}
               >
                 <Ionicons 
                   name="list" 
                   size={16} 
                   color={activeTab === 'animeList' ? '#ffffff' : theme.colors.text} 
                 />
                 <ActionButtonText isActive={activeTab === 'animeList'}>
                   Список аніме
                 </ActionButtonText>
               </ActionButton>
               
               <ActionButton 
                 isActive={activeTab === 'favorites'} 
                 onPress={() => handleTabPress('favorites')}
               >
                 <Ionicons 
                   name="heart" 
                   size={16} 
                   color={activeTab === 'favorites' ? '#ffffff' : theme.colors.text} 
                 />
                 <ActionButtonText isActive={activeTab === 'favorites'}>
                   Улюблені
                 </ActionButtonText>
               </ActionButton>
               
               <ActionButton 
                 isActive={activeTab === 'collections'} 
                 onPress={() => handleTabPress('collections')}
               >
                 <Ionicons 
                   name="folder" 
                   size={16} 
                   color={activeTab === 'collections' ? '#ffffff' : theme.colors.text} 
                 />
                 <ActionButtonText isActive={activeTab === 'collections'}>
                   Колекції
                 </ActionButtonText>
               </ActionButton>
               
               <ActionButton 
                 isActive={activeTab === 'history'} 
                 onPress={() => handleTabPress('history')}
               >
                 <Ionicons 
                   name="time" 
                   size={16} 
                   color={activeTab === 'history' ? '#ffffff' : theme.colors.text} 
                 />
                 <ActionButtonText isActive={activeTab === 'history'}>
                   Історія
                 </ActionButtonText>
               </ActionButton>
             </ActionButtonsScrollView>
           </ProfileActionButtonsContainer>
         );
      
             case 'followStats':
         return (
           <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
             <FollowStatsBlock stats={followStats} username={username} />
           </View>
         );
       
       case 'followButton':
         return (
           <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
             <FollowButton 
               isFollowed={isFollowed}
               onPress={handleFollowToggle}
               disabled={followLoading || isOwnProfile}
             >
               {followLoading ? (
                 <ActivityIndicator color={theme.colors.text} />
               ) : (
                 <>
                   <FollowButtonIconWrapper>
                     {isOwnProfile ? (
                       <Ionicons name="person" size={20} color={theme.colors.gray} />
                     ) : !isFollowed ? (
                       <Ionicons name="person-add-outline" size={20} color="#ffffff"  />
                     ) : (
                       <Ionicons name="person-remove-outline" size={20} color={theme.colors.text} />
                     )}
                   </FollowButtonIconWrapper>
                   <FollowButtonText isFollowed={isFollowed} disabled={isOwnProfile}>
                     {isOwnProfile ? 'Це мій профіль' : (isFollowed ? 'Не стежити' : 'Відстежувати')}
                   </FollowButtonText>
                 </>
               )}
             </FollowButton>
           </View>
         );
       
       case 'watchStats':
         return (
           <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
             <StatsDonutBlock stats={watchStats} />
           </View>
         );
       
       case 'activity':
         return (
           <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
             <UserActivityBlock 
               activity={activityData}
               animeHours={animeHours}
             />
           </View>
         );
       
              case 'watchList':
          return (
            <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
              <UserWatchList 
                username={username}
                watchStatus="completed"
                limit={21}
              />
            </View>
          );
        
                case 'favorites':
           return (
             <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
               <FavoritesBlock username={username} />
             </View>
           );
        
        case 'collections':
          return (
            <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
              <UserCollectionsBlock username={username} reference={userData?.reference} />
            </View>
          );
        
        case 'history':
          return (
            <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
              <AnimeHistoryBlock username={username} limit={21} />
            </View>
          );
       
       default:
         return null;
    }
  };

  const handleFollowToggle = async () => {
    if (followLoading || isOwnProfile) return;
    
         // Check if user is authenticated
     if (!isAuthenticated) {
       Toast.show({
         type: 'info',
         text1: 'Потрібна авторизація',
         text2: 'Щоб підписатися на користувача, потрібно увійти в акаунт.',
         position: 'bottom',
         visibilityTime: 3000,
       });
       return;
     }
    
    // Check if user is trying to follow themselves
    // This would need to be implemented based on current user data
    // For now, we'll just proceed with the API call
    
    setFollowLoading(true);
    
    try {
      let success = false;
      
      if (isFollowed) {
        success = await unfollowUser();
      } else {
        success = await followUser();
      }
      
      if (success) {
        setIsFollowed(!isFollowed);
        // Refresh follow stats
        const newStats = await fetchFollowStats();
        setFollowStats(newStats);
        
                 Toast.show({
           type: isFollowed ? 'success' : 'success',
           text1: isFollowed ? 'Відписано' : 'Підписано',
           text2: isFollowed 
             ? 'Ви більше не стежите за цим користувачем' 
             : 'Тепер ви стежите за цим користувачем',
           position: 'bottom',
           visibilityTime: 3000,
         });
             } else {
         Toast.show({
           type: 'error',
           text1: 'Помилка',
           text2: 'Не вдалося виконати дію. Спробуйте ще раз.',
           position: 'bottom',
           visibilityTime: 3000,
         });
       }
         } catch (err) {
       
       Toast.show({
         type: 'error',
         text1: 'Помилка',
         text2: 'Сталася помилка. Спробуйте ще раз.',
         position: 'bottom',
         visibilityTime: 3000,
       });
     } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [username]);

  // Перевіряємо чи користувач авторизований
  if (!authIsAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Header />
        <LoginComponent onLoginSuccess={loadData} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </LoadingContainer>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onPress={loadData}>
            <RetryButtonText>Спробувати знову</RetryButtonText>
          </RetryButton>
        </ErrorContainer>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ErrorContainer>
          <ErrorText>Користувача не знайдено</ErrorText>
          <RetryButton onPress={() => navigation.goBack()}>
            <RetryButtonText>Назад</RetryButtonText>
          </RetryButton>
        </ErrorContainer>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header />
      
      <FlatList
        data={renderData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      />
      <Toast config={toastConfig} position="bottom" />
    </View>
  );
};

export default UserProfile;