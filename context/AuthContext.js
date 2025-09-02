import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { saveUserToSupabaseWithFallback, getUserFromSupabase, updateLastLogin, updateHikkaUpdatedAt, testSupabaseConnection, getUserCoins } from '../utils/supabase';

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
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
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
  };

  const validateToken = async (token) => {
    try {
      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: token },
      });
      const isValid = response.ok;
      return isValid;
    } catch (error) {
      return false;
    }
  };

  const fetchUserData = async (accessToken) => {
    try {
      const response = await fetch('https://api.hikka.io/user/me', {
        headers: { auth: accessToken },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        if (data.reference) {
          await SecureStore.setItemAsync(USER_REFERENCE_KEY, data.reference);
          
          // Зберігаємо дані користувача в Supabase
          const saved = await saveUserToSupabaseWithFallback(data);
          if (saved.success) {
            if (saved.isNewUser) {
              // Новий користувач створений в Supabase
            } else {
              // Існуючий користувач оновлений в Supabase
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
        return null;
      }
    } catch (error) {
      return null;
    }
  };

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
      
      // Отримуємо дані користувача
      const userDataResult = await fetchUserData(newToken);
      
      // Оновлюємо час останнього входу в Supabase
      if (userDataResult?.reference) {
        await updateLastLogin(userDataResult.reference);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_REFERENCE_KEY);
      setToken(null);
      setUserData(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Обробка помилки виходу
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    userData,
    token,
    login,
    logout,
    checkAuthStatus,
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