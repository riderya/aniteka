import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useWatchStatus } from '../../context/WatchStatusContext';

const PerformanceTest = ({ slug }) => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  
  const { 
    getAnimeStatus, 
    getAnimeFavourite, 
    fetchAnimeStatus, 
    fetchAnimeFavourite,
    authToken,
    isAuthChecked 
  } = useWatchStatus();

  const runPerformanceTest = async () => {
    setIsRunning(true);
    const results = {};

    // Тест 1: Час отримання з кешу
    const cacheStart = performance.now();
    const cachedStatus = getAnimeStatus(slug);
    const cachedFavourite = getAnimeFavourite(slug);
    const cacheTime = performance.now() - cacheStart;
    
    results.cacheTime = cacheTime;
    results.cachedStatus = cachedStatus;
    results.cachedFavourite = cachedFavourite;

    // Тест 2: Час завантаження з API (якщо не в кеші)
    if (!authToken || !isAuthChecked) {
      results.apiTime = 'N/A - Not authenticated';
    } else {
      const apiStart = performance.now();
      try {
        await Promise.all([
          fetchAnimeStatus(slug),
          fetchAnimeFavourite(slug)
        ]);
        const apiTime = performance.now() - apiStart;
        results.apiTime = apiTime;
      } catch (error) {
        results.apiTime = `Error: ${error.message}`;
      }
    }

    // Тест 3: Кількість запитів (приблизно)
    results.estimatedRequests = cachedStatus !== null ? 0 : 2;

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <Container>
      <Title>Тест продуктивності</Title>
      
      <TouchableOpacity 
        onPress={runPerformanceTest} 
        disabled={isRunning}
        style={{ 
          backgroundColor: '#007AFF', 
          padding: 10, 
          borderRadius: 8,
          marginBottom: 10 
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {isRunning ? 'Тестування...' : 'Запустити тест'}
        </Text>
      </TouchableOpacity>

      {Object.keys(testResults).length > 0 && (
        <ResultsContainer>
          <ResultRow>
            <ResultLabel>Час кешу:</ResultLabel>
            <ResultValue>{testResults.cacheTime?.toFixed(2)}ms</ResultValue>
          </ResultRow>
          
          <ResultRow>
            <ResultLabel>Час API:</ResultLabel>
            <ResultValue>
              {typeof testResults.apiTime === 'number' 
                ? `${testResults.apiTime.toFixed(2)}ms` 
                : testResults.apiTime}
            </ResultValue>
          </ResultRow>
          
          <ResultRow>
            <ResultLabel>Запитів:</ResultLabel>
            <ResultValue>{testResults.estimatedRequests}</ResultValue>
          </ResultRow>
          
          <ResultRow>
            <ResultLabel>Статус з кешу:</ResultLabel>
            <ResultValue>{testResults.cachedStatus || 'null'}</ResultValue>
          </ResultRow>
          
          <ResultRow>
            <ResultLabel>Вподобане з кешу:</ResultLabel>
            <ResultValue>{testResults.cachedFavourite ? 'true' : 'false'}</ResultValue>
          </ResultRow>
        </ResultsContainer>
      )}
    </Container>
  );
};

const Container = styled.View`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  margin: 8px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const ResultsContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 12px;
  border-radius: 8px;
`;

const ResultRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ResultLabel = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
`;

const ResultValue = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export default PerformanceTest;
