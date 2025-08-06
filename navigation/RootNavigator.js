import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AnimeDetailsScreen from '../screens/AnimeDetailsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import AnimeVideosScreen from '../screens/AnimeInfo/AnimeVideosScreen';
import AnimeCharactersScreen from '../screens/AnimeInfo/AnimeCharactersScreen';
import AnimeStaffScreen from '../screens/AnimeInfo/AnimeStaffScreen';
import AnimeCharacterDetailsScreen from '../screens/AnimeCharacterDetailsScreen';
import AnimePeopleDetailsScreen from '../screens/AnimePeopleDetailsScreen';
import AnimeCommentsDetailsScreen from '../screens/AnimeCommentsDetailsScreen';
import CompanyDetailScreen from '../screens/CompanyDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnimeFilterScreen from '../screens/AnimeFilterScreen';
import AnimeScheduleScreen from '../screens/AnimeScheduleScreen';
import AnimeAllLatestCommentsScreen from '../screens/AnimeAllLatestCommentsScreen';
import AnimeCollectionsScreen from '../screens/AnimeCollectionsScreen';
import AnimeAllArticlesScreen from '../screens/AnimeAllArticlesScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

const RootStack = createStackNavigator();

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

export default function RootNavigator() {
  const { isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <LoadingContainer theme={theme}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </LoadingContainer>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Завжди показуємо Tabs як початковий екран */}
      <RootStack.Screen name="Tabs" component={TabNavigator} />
      <RootStack.Screen name="Search" component={SearchScreen} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />
      <RootStack.Screen name="AnimeDetails" component={AnimeDetailsScreen} />
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="AnimeVideosScreen" component={AnimeVideosScreen} />
      <RootStack.Screen name="AnimeCharactersScreen" component={AnimeCharactersScreen} />
      <RootStack.Screen name="AnimeStaffScreen" component={AnimeStaffScreen} />
      <RootStack.Screen name="AnimeCharacterDetailsScreen" component={AnimeCharacterDetailsScreen} />
      <RootStack.Screen name="AnimePeopleDetailsScreen" component={AnimePeopleDetailsScreen} />
      <RootStack.Screen name="AnimeCommentsDetailsScreen" component={AnimeCommentsDetailsScreen} />
      <RootStack.Screen name="CompanyDetailScreen" component={CompanyDetailScreen} />
      <RootStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <RootStack.Screen name="AnimeFilterScreen" component={AnimeFilterScreen} />
      <RootStack.Screen name="AnimeScheduleScreen" component={AnimeScheduleScreen} />
      <RootStack.Screen name="AnimeAllLatestCommentsScreen" component={AnimeAllLatestCommentsScreen} />
      <RootStack.Screen name="AnimeCollectionsScreen" component={AnimeCollectionsScreen} />
      <RootStack.Screen name="AnimeAllArticlesScreen" component={AnimeAllArticlesScreen} />
      <RootStack.Screen name="ArticleDetailScreen" component={ArticleDetailScreen} />
      <RootStack.Screen name="CollectionDetailScreen" component={CollectionDetailScreen} />
      <RootStack.Screen name="UserProfileScreen" component={UserProfileScreen} />
    </RootStack.Navigator>
  );
}
