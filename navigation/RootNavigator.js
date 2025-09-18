import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Image, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import CustomizationScreen from '../screens/CustomizationScreen';
import ListImportScreen from '../screens/ListImportScreen';
import NotificationsSettingsScreen from '../screens/NotificationsSettingsScreen';
import LoginHistoryScreen from '../screens/LoginHistoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AnimeDetailsScreen from '../screens/AnimeDetailsScreen';
import AnimeVideosScreen from '../screens/AnimeInfo/AnimeVideosScreen';
import AnimeCharactersScreen from '../screens/AnimeInfo/AnimeCharactersScreen';
import AnimeStaffScreen from '../screens/AnimeInfo/AnimeStaffScreen';
import AnimeCharacterDetailsScreen from '../screens/AnimeCharacterDetailsScreen';
import AnimePeopleDetailsScreen from '../screens/AnimePeopleDetailsScreen';
import CommentsDetailsScreen from '../screens/CommentsDetailsScreen';
import CompanyDetailScreen from '../screens/CompanyDetailScreen';
import AnimeFilterScreen from '../screens/AnimeFilterScreen';
import AnimeScheduleScreen from '../screens/AnimeScheduleScreen';
import AnimeAllLatestCommentsScreen from '../screens/AnimeAllLatestCommentsScreen';
import AnimeCollectionsScreen from '../screens/AnimeCollectionsScreen';
import AnimeAllArticlesScreen from '../screens/AnimeAllArticlesScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import CopyrightHoldersScreen from '../screens/CopyrightHoldersScreen';
import CommunityRulesScreen from '../screens/CommunityRulesScreen';
import HelpScreen from '../screens/HelpScreen';
import CheckUpdatesScreen from '../screens/CheckUpdatesScreen';


import CommentRepliesScreen from '../screens/CommentRepliesScreen';
import AnimeFranchiseScreen from '../screens/AnimeFranchiseScreen';
import PopularAnimeScreen from '../screens/PopularAnimeScreen';


const RootStack = createStackNavigator();

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LogoImage = styled(Animated.Image)`
  width: 80px;
  height: 80px;
`;

export default function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) {
      const scale = () => {
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => scale());
      };
      scale();
    }
  }, [isLoading, scaleValue]);

  if (isLoading) {
    return (
      <LoadingContainer theme={theme}>
        <LogoImage
          source={require('../assets/logo-loader.png')}
          style={{ transform: [{ scale: scaleValue }] }}
          resizeMode="contain"
        />
      </LoadingContainer>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Завжди показуємо Tabs як початковий екран */}
      <RootStack.Screen name="Tabs" component={TabNavigator} />
      <RootStack.Screen name="Search" component={SearchScreen} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
      <RootStack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <RootStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <RootStack.Screen name="Customization" component={CustomizationScreen} />
      <RootStack.Screen name="ListImport" component={ListImportScreen} />
      <RootStack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
      <RootStack.Screen name="LoginHistory" component={LoginHistoryScreen} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />
      <RootStack.Screen name="AnimeDetails" component={AnimeDetailsScreen} />
      <RootStack.Screen name="AnimeVideosScreen" component={AnimeVideosScreen} />
      <RootStack.Screen name="AnimeCharactersScreen" component={AnimeCharactersScreen} />
      <RootStack.Screen name="AnimeStaffScreen" component={AnimeStaffScreen} />
      <RootStack.Screen name="AnimeCharacterDetailsScreen" component={AnimeCharacterDetailsScreen} />
      <RootStack.Screen name="AnimePeopleDetailsScreen" component={AnimePeopleDetailsScreen} />
      <RootStack.Screen name="CommentsDetailsScreen" component={CommentsDetailsScreen} />
      <RootStack.Screen name="CompanyDetailScreen" component={CompanyDetailScreen} />
      <RootStack.Screen name="AnimeFilterScreen" component={AnimeFilterScreen} />
      <RootStack.Screen name="AnimeScheduleScreen" component={AnimeScheduleScreen} />
      <RootStack.Screen name="AnimeAllLatestCommentsScreen" component={AnimeAllLatestCommentsScreen} />
      <RootStack.Screen name="AnimeCollectionsScreen" component={AnimeCollectionsScreen} />
      <RootStack.Screen name="AnimeAllArticlesScreen" component={AnimeAllArticlesScreen} />
      <RootStack.Screen name="ArticleDetailScreen" component={ArticleDetailScreen} />
      <RootStack.Screen name="CollectionDetailScreen" component={CollectionDetailScreen} />
      <RootStack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <RootStack.Screen name="CopyrightHolders" component={CopyrightHoldersScreen} />
      <RootStack.Screen name="CommunityRules" component={CommunityRulesScreen} />
      <RootStack.Screen name="Help" component={HelpScreen} />
      <RootStack.Screen name="CheckUpdates" component={CheckUpdatesScreen} />


       <RootStack.Screen name="CommentRepliesScreen" component={CommentRepliesScreen} />
       <RootStack.Screen name="AnimeFranchise" component={AnimeFranchiseScreen} />
       <RootStack.Screen name="PopularAnimeScreen" component={PopularAnimeScreen} />

    </RootStack.Navigator>
  );
}
