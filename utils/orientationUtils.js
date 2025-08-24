import { Dimensions } from 'react-native';

// Отримуємо розміри екрану
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Визначаємо чи це планшет
export const isTablet = () => {
  return screenWidth >= 768;
};

// Визначаємо орієнтацію
export const getOrientation = () => {
  return screenWidth > screenHeight ? 'landscape' : 'portrait';
};

// Адаптивні розміри для різних орієнтацій
export const getResponsiveDimensions = () => {
  const orientation = getOrientation();
  const tablet = isTablet();
  
  if (tablet) {
    return {
      // Планшет
      cardWidth: orientation === 'landscape' ? 200 : 180,
      cardHeight: orientation === 'landscape' ? 280 : 320,
      imageHeight: orientation === 'landscape' ? 120 : 140,
      fontSize: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
      },
      spacing: {
        small: 8,
        medium: 12,
        large: 16,
        xlarge: 24,
      }
    };
  } else {
    return {
      // Телефон
      cardWidth: orientation === 'landscape' ? 160 : 140,
      cardHeight: orientation === 'landscape' ? 220 : 260,
      imageHeight: orientation === 'landscape' ? 90 : 110,
      fontSize: {
        small: 10,
        medium: 12,
        large: 14,
        xlarge: 16,
      },
      spacing: {
        small: 6,
        medium: 10,
        large: 14,
        xlarge: 20,
      }
    };
  }
};

// Адаптивні стилі для колонок
export const getColumnStyles = (numColumns = 2) => {
  const orientation = getOrientation();
  const tablet = isTablet();
  
  if (tablet) {
    return {
      numColumns: orientation === 'landscape' ? 4 : 3,
      columnGap: 16,
      rowGap: 20,
    };
  } else {
    return {
      numColumns: orientation === 'landscape' ? 3 : 2,
      columnGap: 12,
      rowGap: 16,
    };
  }
};

// Адаптивні стилі для заголовків
export const getHeaderStyles = () => {
  const orientation = getOrientation();
  const tablet = isTablet();
  
  return {
    height: tablet 
      ? (orientation === 'landscape' ? 60 : 70)
      : (orientation === 'landscape' ? 50 : 60),
    fontSize: tablet 
      ? (orientation === 'landscape' ? 18 : 20)
      : (orientation === 'landscape' ? 16 : 18),
  };
};
