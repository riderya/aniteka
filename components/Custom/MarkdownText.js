import React from 'react';
import { Text, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const MarkdownText = ({ children, style = {}, numberOfLines, ellipsizeMode }) => {
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

    const parts = [];
    let currentIndex = 0;
    let textContent = text;

    // Обробка посилань [текст](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    const linkMatches = [];
    
    while ((linkMatch = linkRegex.exec(text)) !== null) {
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
    
    while ((boldMatch = boldRegex.exec(text)) !== null) {
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
    
    while ((italicMatch = italicRegex.exec(text)) !== null) {
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
    
    while ((codeMatch = codeRegex.exec(text)) !== null) {
      codeMatches.push({
        type: 'code',
        text: codeMatch[1],
        start: codeMatch.index,
        end: codeMatch.index + codeMatch[0].length
      });
    }

    // Об'єднуємо всі матчі та сортуємо за позицією
    const allMatches = [...linkMatches, ...boldMatches, ...italicMatches, ...codeMatches]
      .sort((a, b) => a.start - b.start);

    // Рендеримо текст частинами
    let lastIndex = 0;
    
    for (const match of allMatches) {
      // Додаємо текст перед матчем
      if (match.start > lastIndex) {
        const plainText = text.slice(lastIndex, match.start);
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
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
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
  
  // Якщо це масив елементів (є маркдаун), рендеримо їх без обгортки
  if (Array.isArray(markdownContent)) {
    return (
      <Text 
        style={textStyle}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
      >
        {markdownContent}
      </Text>
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

export default MarkdownText;
