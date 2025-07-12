import React, { createContext, useContext, useState } from 'react';

const WatchStatusContext = createContext();

export const WatchStatusProvider = ({ children }) => {
  const [status, setStatus] = useState('Не дивлюсь');
  const [score, setScore] = useState(0);
  const [episodes, setEpisodes] = useState(null);

  return (
    <WatchStatusContext.Provider
      value={{ status, setStatus, score, setScore, episodes, setEpisodes }}
    >
      {children}
    </WatchStatusContext.Provider>
  );
};

export const useWatchStatus = () => useContext(WatchStatusContext);
