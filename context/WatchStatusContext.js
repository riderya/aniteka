import React, { createContext, useContext, useState } from 'react';

const WatchStatusContext = createContext();

export const WatchStatusProvider = ({ children }) => {
  const [status, setStatus] = useState('Не дивлюсь');
  const [score, setScore] = useState(0);
  const [episodes, setEpisodes] = useState(null);
  
  // Глобальний стан для статусів всіх аніме
  const [animeStatuses, setAnimeStatuses] = useState({});

  // Функція для оновлення статусу конкретного аніме
  const updateAnimeStatus = (slug, newStatus) => {
    setAnimeStatuses(prev => ({
      ...prev,
      [slug]: newStatus
    }));
  };

  // Функція для отримання статусу конкретного аніме
  const getAnimeStatus = (slug) => {
    return animeStatuses[slug] || null;
  };

  return (
    <WatchStatusContext.Provider
      value={{ 
        status, 
        setStatus, 
        score, 
        setScore, 
        episodes, 
        setEpisodes,
        animeStatuses,
        updateAnimeStatus,
        getAnimeStatus
      }}
    >
      {children}
    </WatchStatusContext.Provider>
  );
};

export const useWatchStatus = () => useContext(WatchStatusContext);
