import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppThemeProvider, useTheme } from './context/ThemeContext';
import RootNavigator from './navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import toastConfig from './components/CustomToast';
import { WatchStatusProvider } from './context/WatchStatusContext';

export default function App() {
  return (
    <AppThemeProvider>
      <WatchStatusProvider>
        <NavigationContainer>
          <AppWithStatusBar />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </WatchStatusProvider>
    </AppThemeProvider>
  );
}

function AppWithStatusBar() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <RootNavigator />
    </>
  );
}
