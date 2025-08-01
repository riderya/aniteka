import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

const TagContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${({ marginTop }) => marginTop || 0}px;
  margin-bottom: ${({ marginBottom }) => marginBottom || 0}px;
`;

const TagWrapper = styled.TouchableOpacity`
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.card;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.inputBackground;
    }
  }};
  border-width: ${({ variant }) => variant === 'outline' ? 1 : 0}px;
  border-color: ${({ theme, variant }) => 
    variant === 'outline' ? theme.colors.primary : 'transparent'};
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return '4px 8px';
      case 'large':
        return '8px 16px';
      default:
        return '6px 12px';
    }
  }};
  border-radius: ${({ size }) => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 20;
      default:
        return 16;
    }
  }}px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

const TagText = styled.Text`
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'outline':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return 11;
      case 'large':
        return 16;
      default:
        return 14;
    }
  }}px;
  font-weight: ${({ weight }) => weight || '500'};
`;

const TagComponent = ({ 
  tags = [], 
  onTagPress, 
  onTagRemove,
  variant = 'default',
  size = 'medium',
  weight = '500',
  marginTop = 0,
  marginBottom = 0,
  maxTags = null,
  showRemoveIcon = false,
  disabled = false
}) => {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags ? tags.length - maxTags : 0;

  const handleTagPress = (tag, index) => {
    if (!disabled && onTagPress) {
      onTagPress(tag, index);
    }
  };

  const handleTagRemove = (tag, index) => {
    if (!disabled && onTagRemove) {
      onTagRemove(tag, index);
    }
  };

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <TagContainer marginTop={marginTop} marginBottom={marginBottom}>
      {displayTags.map((tag, index) => (
        <TagWrapper
          key={`${tag}-${index}`}
          variant={variant}
          size={size}
          disabled={disabled}
          onPress={() => handleTagPress(tag, index)}
          activeOpacity={0.7}
        >
          <TagText variant={variant} size={size} weight={weight}>
            {typeof tag === 'string' ? tag : tag.name || tag}
          </TagText>
          {showRemoveIcon && onTagRemove && (
            <Ionicons 
              name="close-circle" 
              size={size === 'small' ? 12 : size === 'large' ? 18 : 14} 
              color={variant === 'primary' ? '#fff' : '#666'} 
            />
          )}
        </TagWrapper>
      ))}
      {remainingCount > 0 && (
        <TagWrapper
          variant="secondary"
          size={size}
          disabled={disabled}
          onPress={() => onTagPress && onTagPress('showMore', -1)}
          activeOpacity={0.7}
        >
          <TagText variant="secondary" size={size} weight={weight}>
            +{remainingCount}
          </TagText>
        </TagWrapper>
      )}
    </TagContainer>
  );
};

export default TagComponent; 