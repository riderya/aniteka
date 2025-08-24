import { useEffect, useMemo } from 'react';
import { LogBox } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useOrientation, useDimensions } from './useOrientation';

// Custom hook to suppress styled-components warnings
export const useSuppressStyledComponentsWarnings = () => {
  useEffect(() => {
    // Suppress the useInsertionEffect warning from styled-components
    LogBox.ignoreLogs([
      'Warning: useInsertionEffect must not schedule updates.',
    ]);
  }, []);
};

// Custom hook for optimized theme usage
export const useOptimizedTheme = () => {
  const { theme } = useTheme();
  
  // Memoize theme colors to prevent unnecessary recalculations
  const memoizedTheme = useMemo(() => theme, [theme]);
  
  return memoizedTheme;
};

// Export orientation hooks
export { useOrientation, useDimensions }; 