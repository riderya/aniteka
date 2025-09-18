import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { saveUserToSupabaseWithFallback, getUserFromSupabase, updateLastLogin, updateHikkaUpdatedAt, testSupabaseConnection, getUserCoins } from '../utils/supabase';
import { initLoginHistoryDB, addLoginRecord } from '../utils/loginHistoryDB';

const AuthContext = createContext();

const TOKEN_KEY = 'hikka_token';
const USER_REFERENCE_KEY = 'hikka_user_reference';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    // Ініціалізуємо Supabase при запуску
    testSupabaseConnection();
    // Ініціалізуємо базу даних для історії входів
    initLoginHistoryDB().catch(console.error);
  }, []); // Видаляємо checkAuthStatus з залежностей

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Тимчасова затримка для демонстрації лоадингу (3 секунди)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      
      if (savedToken) {
        // Перевіряємо, чи токен ще дійсний
        const isValid = await validateToken(savedToken);
        if (isValid) {
          setToken(savedToken);
          setIsAuthenticated(true);
          await fetchUserData(savedToken);
        } else {
          // Токен недійсний, видаляємо його
          await logout();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Видаляємо всі залежності, оскільки функції стабільні

  const validateToken = useCallback(async (token) => {
    try {
      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: token },
      });
      const isValid = response.ok;
      return isValid;
    } catch (error) {
      return false;
    }
  }, []);

  const fetchUserData = useCallback(async (accessToken) => {
    try {
      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: accessToken },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.username) {
          return null;
        }
        
        setUserData(data);
        
        if (data.reference) {
          await SecureStore.setItemAsync(USER_REFERENCE_KEY, data.reference);
          
          // Зберігаємо дані користувача в Supabase
          const saved = await saveUserToSupabaseWithFallback(data);
          if (saved.success) {
            if (saved.isNewUser) {
            } else {
            }
            
            // Оновлюємо час оновлення в Hikka, якщо він є в даних
            if (data.updated_at) {
              await updateLastLogin(data.reference);
            }
          }
        }
        
        // Повертаємо дані користувача
        return data;
      } else {
        const errorText = await response.text();
        return null;
      }
    } catch (error) {
      console.error('AuthContext: fetchUserData error:', error);
      return null;
    }
  }, []);

  const login = async (newToken) => {
    try {
      
      // Prevent multiple login calls
      if (isAuthenticated && token === newToken) {
        return;
      }
      
      setIsLoading(true);
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      
      const userDataResult = await fetchUserData(newToken);
      
      // Оновлюємо час останнього входу в Supabase
      if (userDataResult?.reference) {
        await updateLastLogin(userDataResult.reference);
      }

      // Записуємо подію входу в SQLite базу даних
      try {
        await addLoginRecord({
          timestamp: new Date().toISOString(),
          userId: userDataResult?.reference || null,
          username: userDataResult?.username || null,
          platform: Platform?.OS || 'unknown',
        });
      } catch (e) {
        // ignore history write errors
        console.error('Failed to record login history:', e);
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_REFERENCE_KEY);
      setToken(null);
      setUserData(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Обробка помилки виходу
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (token) {
      return await fetchUserData(token);
    }
    return null;
  }, [token, fetchUserData]);

  const value = {
    isAuthenticated,
    isLoading,
    userData,
    token,
    login,
    logout,
    checkAuthStatus,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth повинен використовуватися всередині AuthProvider');
  }
  return context;
} 