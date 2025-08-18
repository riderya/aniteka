// Utility script to update BlurView to PlatformBlurView
// This is a helper script to identify files that need updating

const filesToUpdate = [
  'components/AnimeFilter/FilterPanel.js',
  'screens/AnimeAllLatestCommentsScreen.js',
  'screens/AnimeAllArticlesScreen.js',
  'screens/AnimeCollectionsScreen.js',
  'screens/AnimeCharacterDetailsScreen.js',
  'screens/AnimeCommentsDetailsScreen.js',
  'screens/AnimeFilterScreen.js',
  'screens/AnimePeopleDetailsScreen.js',
  'screens/AnimeInfo/AnimeCharactersScreen.js',
  'screens/AnimeInfo/AnimeStaffScreen.js',
  'screens/AnimeScheduleScreen.js',
  'screens/AnimeInfo/AnimeVideosScreen.js',
  'screens/ArticleDetailScreen.js',
  'screens/CollectionDetailScreen.js',
  'screens/CompanyDetailScreen.js',
  'screens/SettingsScreen.js',
  'screens/UserProfileScreen.js',
  'screens/WebViewScreen.js'
];

// Manual update steps for each file:
// 1. Replace: import { BlurView } from 'expo-blur';
//    With: import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
//    (adjust path as needed)
//
// 2. Replace: styled(BlurView)
//    With: styled(PlatformBlurView)
//
// 3. Remove: experimentalBlurMethod="dimezisBlurView"
//    (PlatformBlurView handles this automatically)

console.log('Files that need BlurView to PlatformBlurView updates:');
filesToUpdate.forEach(file => console.log(`- ${file}`));
