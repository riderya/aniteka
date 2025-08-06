import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

const TOKEN_KEY = 'hikka_token';
const USER_REFERENCE_KEY = 'hikka_user_reference';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Змінюємо на false, щоб не блокувати завантаження
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
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
      console.error('Помилка перевірки авторизації:', error);
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
      return response.ok;
    } catch (error) {
      console.error('Помилка валідації токена:', error);
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
        }
      }
    } catch (error) {
      console.error('Помилка отримання даних користувача:', error);
    }
  };

  const login = async (newToken) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      await fetchUserData(newToken);
    } catch (error) {
      console.error('Помилка збереження токена:', error);
      throw error;
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
      console.error('Помилка виходу:', error);
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