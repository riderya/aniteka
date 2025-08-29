import React from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import RootNavigator from './navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import toastConfig from './components/CustomToast';
import { WatchStatusProvider } from './context/WatchStatusContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <WatchStatusProvider>
              <NavigationContainer>
                <AppWithStatusBar />
              </NavigationContainer>
              <Toast config={toastConfig} position="bottom" />
            </WatchStatusProvider>
          </NotificationsProvider>
        </AuthProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function AppWithStatusBar() {
  const { theme } = useTheme();
  const { isLoading } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <RootNavigator />
    </View>
  );
}
