import React, { useState } from 'react';
import { Text, Linking, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { processCommentText } from '../../utils/textUtils';

const MarkdownText = ({ 
  children, 
  style = {}, 
  numberOfLines, // @deprecated - Use maxHeight on container instead for better markdown support
  ellipsizeMode 
}) => {
  const { theme } = useTheme();
  const textStyle = {
    color: style.body?.color || theme.colors.text,
    fontSize: style.body?.fontSize || 16,
    lineHeight: style.body?.lineHeight || 22,
    fontWeight: style.body?.fontWeight || 'normal',
    fontStyle: style.body?.fontStyle || 'normal',
    ...style.text
  };

  // Стиль для посилань
  const linkStyle = {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    ...style.link
  };

  // Стиль для коду
  const codeStyle = {
    backgroundColor: theme.colors.inputBackground,
    fontFamily: 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    ...style.code
  };

  // Функція для рендерингу тексту з маркдауном
  const renderMarkdownText = (text) => {
    if (!text) return null;

    // Очищуємо текст перед обробкою
    const cleanedText = processCommentText(text);

    const parts = [];
    let currentIndex = 0;
    let textContent = cleanedText;

    // Обробка спойлерів :::spoiler ... :::
    const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
    let spoilerMatch;
    const spoilerMatches = [];
    
    while ((spoilerMatch = spoilerRegex.exec(cleanedText)) !== null) {
      spoilerMatches.push({
        type: 'spoiler',
        text: spoilerMatch[1].trim(),
        start: spoilerMatch.index,
        end: spoilerMatch.index + spoilerMatch[0].length
      });
    }

    // Обробка посилань [текст](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    const linkMatches = [];
    
    while ((linkMatch = linkRegex.exec(cleanedText)) !== null) {
      linkMatches.push({
        type: 'link',
        text: linkMatch[1],
        url: linkMatch[2],
        start: linkMatch.index,
        end: linkMatch.index + linkMatch[0].length
      });
    }

    // Обробка жирного тексту **текст**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let boldMatch;
    const boldMatches = [];
    
    while ((boldMatch = boldRegex.exec(cleanedText)) !== null) {
      boldMatches.push({
        type: 'bold',
        text: boldMatch[1],
        start: boldMatch.index,
        end: boldMatch.index + boldMatch[0].length
      });
    }

    // Обробка курсиву *текст*
    const italicRegex = /\*([^*]+)\*/g;
    let italicMatch;
    const italicMatches = [];
    
    while ((italicMatch = italicRegex.exec(cleanedText)) !== null) {
      italicMatches.push({
        type: 'italic',
        text: italicMatch[1],
        start: italicMatch.index,
        end: italicMatch.index + italicMatch[0].length
      });
    }

    // Обробка коду `код`
    const codeRegex = /`([^`]+)`/g;
    let codeMatch;
    const codeMatches = [];
    
    while ((codeMatch = codeRegex.exec(cleanedText)) !== null) {
      codeMatches.push({
        type: 'code',
        text: codeMatch[1],
        start: codeMatch.index,
        end: codeMatch.index + codeMatch[0].length
      });
    }

    // Об'єднуємо всі матчі та сортуємо за позицією
    const allMatches = [...spoilerMatches, ...linkMatches, ...boldMatches, ...italicMatches, ...codeMatches]
      .sort((a, b) => a.start - b.start);

    // Рендеримо текст частинами
    let lastIndex = 0;
    
    for (const match of allMatches) {
      // Додаємо текст перед матчем
      if (match.start > lastIndex) {
        const plainText = cleanedText.slice(lastIndex, match.start);
        if (plainText) {
          parts.push(
            <Text key={`text-${lastIndex}`} style={textStyle}>
              {plainText}
            </Text>
          );
        }
      }

      // Рендеримо матч
      switch (match.type) {
        case 'spoiler':
          parts.push(
            <InlineSpoiler
              key={`spoiler-${match.start}`}
              text={match.text}
              textStyle={textStyle}
            />
          );
          break;
        case 'link':
          parts.push(
            <Text
              key={`link-${match.start}`}
              style={[textStyle, linkStyle]}
              onPress={() => Linking.openURL(match.url)}
            >
              {match.text}
            </Text>
          );
          break;
        case 'bold':
          parts.push(
            <Text
              key={`bold-${match.start}`}
              style={[textStyle, { fontWeight: 'bold' }]}
            >
              {match.text}
            </Text>
          );
          break;
        case 'italic':
          parts.push(
            <Text
              key={`italic-${match.start}`}
              style={[textStyle, { fontStyle: 'italic' }]}
            >
              {match.text}
            </Text>
          );
          break;
        case 'code':
          parts.push(
            <Text
              key={`code-${match.start}`}
              style={[textStyle, codeStyle]}
            >
              {match.text}
            </Text>
          );
          break;
      }

      lastIndex = match.end;
    }

    // Додаємо залишок тексту
    if (lastIndex < cleanedText.length) {
      const remainingText = cleanedText.slice(lastIndex);
      if (remainingText) {
        parts.push(
          <Text key={`text-${lastIndex}`} style={textStyle}>
            {remainingText}
          </Text>
        );
      }
    }

    return parts.length > 0 ? parts : text;
  };

  const markdownContent = renderMarkdownText(children);
  
  // Якщо це масив елементів (є маркдаун), рендеримо їх у View
  if (Array.isArray(markdownContent)) {
    // Якщо потрібно обрізати текст, рендеримо простий текст без маркдауну
    if (numberOfLines !== undefined) {
      return (
        <Text 
          style={textStyle}
          numberOfLines={numberOfLines}
          ellipsizeMode={ellipsizeMode}
        >
          {children}
        </Text>
      );
    }
    
    return (
      <View style={{ flexDirection: 'column' }}>
        {markdownContent}
      </View>
    );
  }
  
  // Інакше повертаємо простий текст в обгортці
  return (
    <Text 
      style={textStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {markdownContent}
    </Text>
  );
};

// Inline Spoiler Component to avoid circular dependency
const InlineSpoiler = ({ text, textStyle }) => {
  const { theme } = useTheme();
  const [revealed, setRevealed] = useState(false);

  const toggleSpoiler = () => {
    setRevealed(prev => !prev);
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggleSpoiler}>
      {revealed ? (
        <Text style={[textStyle, { backgroundColor: theme.colors.inputBackground, padding: 4, borderRadius: 4 }]}>
          {text}
        </Text>
      ) : (
        <Text style={[textStyle, { 
          backgroundColor: theme.colors.inputBackground, 
          padding: 4, 
          borderRadius: 4,
          color: theme.colors.gray,
          fontStyle: 'italic'
        }]}>
          [спойлер]
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default MarkdownText;
