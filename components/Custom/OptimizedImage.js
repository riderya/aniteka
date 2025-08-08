import React, { useState, useCallback } from 'react';
import { Image, ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';

const ImageContainer = styled.View`
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const StyledImage = styled.Image`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  border-radius: ${({ borderRadius }) => borderRadius}px;
`;

const OptimizedImage = ({ 
  source, 
  width, 
  height, 
  borderRadius = 0, 
  resizeMode = 'cover',
  style,
  onLoad,
  onError,
  fallbackSource = require('../../assets/image/image404.png')
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    onError?.();
  }, [onError]);

  const imageSource = error ? fallbackSource : source;

  return (
    <ImageContainer style={style}>
      {loading && (
        <ActivityIndicator 
          size="small" 
          color="#666" 
          style={{ position: 'absolute', zIndex: 1 }}
        />
      )}
      <StyledImage
        source={imageSource}
        width={width}
        height={height}
        borderRadius={borderRadius}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        fadeDuration={300}
      />
    </ImageContainer>
  );
};

export default OptimizedImage;

