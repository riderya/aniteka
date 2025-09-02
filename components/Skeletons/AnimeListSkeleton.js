import React from 'react';
import { View } from 'react-native';
import AnimeRowCardSkeleton from './AnimeRowCardSkeleton';

const AnimeListSkeleton = ({ 
  count = 5, 
  skeletonColor = null,
  theme = null,
  ...skeletonProps 
}) => {
  return (
    <View>
      {Array(count).fill(null).map((_, index) => (
        <AnimeRowCardSkeleton 
          key={`skeleton-${index}`} 
          {...skeletonProps}
          skeletonColor={skeletonColor}
          theme={theme}
        />
      ))}
    </View>
  );
};

export default AnimeListSkeleton;
