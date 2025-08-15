import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext({
  unseenCount: 0,
  loadUnseenCount: () => {},
  setUnseenCount: () => {},
  decrementUnseenCount: () => {},
});

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [unseenCount, setUnseenCount] = useState(0);
  const { token, isAuthenticated } = useAuth();

  const loadUnseenCount = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setUnseenCount(0);
      return;
    }

    try {
      const res = await fetch('https://api.hikka.io/notifications/count', { 
        headers: { auth: token } 
      });
      if (!res.ok) return;
      
      const data = await res.json();
      if (typeof data.unseen === 'number') {
        setUnseenCount(data.unseen);
      }
    } catch (e) {
      // Silent error handling
      
    }
  }, [token, isAuthenticated]);

  const decrementUnseenCount = useCallback(() => {
    setUnseenCount(prev => Math.max(0, prev - 1));
  }, []);

  // Load unseen count when user authenticates or token changes
  useEffect(() => {
    if (isAuthenticated && token) {
      loadUnseenCount();
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(loadUnseenCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnseenCount(0);
    }
  }, [isAuthenticated, token, loadUnseenCount]);

  const value = {
    unseenCount,
    loadUnseenCount,
    setUnseenCount,
    decrementUnseenCount,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
