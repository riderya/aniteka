import React, { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Text, TouchableOpacity, View, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import ExternalLinkWarningModal from './ExternalLinkWarningModal';
const MarkdownText = ({ 
  children, 
  style = {}, 
  numberOfLines, // @deprecated - Use maxHeight on container instead for better markdown support
  ellipsizeMode, 
  disableLinks = false
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [warningModal, setWarningModal] = useState({
    visible: false,
    url: '',
    linkText: '',
    onConfirm: null
  });
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
  // Обробник посилань: відкриваємо внутрішні екрани для посилань Хікки на персонажів
  const handleLinkPress = async (url, text) => {
    if (!url) return;
    try {
      // Уніфікований розбір URL
      const isAbsolute = /^https?:\/\//i.test(url);
      const normalized = isAbsolute ? url : `https://hikka.io${url.startsWith('/') ? '' : '/'}${url}`;
      // Витягуємо шлях без параметрів
      const path = normalized.replace(/^https?:\/\/(?:www\.)?hikka\.io/i, '');
      // Перевіряємо, чи це внутрішнє посилання Hikka
      const isHikkaLink = /^https?:\/\/(?:www\.)?hikka\.io/i.test(normalized);
      if (isHikkaLink) {
        // Підтримка /characters/ та /character/
        const charMatch = path.match(/^\/char(?:acter|acters)\/([^/?#]+)\/?/i);
        if (charMatch && charMatch[1]) {
          const slug = decodeURIComponent(charMatch[1]);
          navigation.navigate('AnimeCharacterDetailsScreen', { slug, name_ua: text });
          return;
        }
        // Додатково: люди, аніме — відкриваємо відповідні екрани, якщо потрібно
        const peopleMatch = path.match(/^\/(people|person)\/([^/?#]+)\/?/i);
        if (peopleMatch && peopleMatch[2]) {
          const slug = decodeURIComponent(peopleMatch[2]);
          navigation.navigate('AnimePeopleDetailsScreen', { slug });
          return;
        }
        const animeMatch = path.match(/^\/anime\/([^/?#]+)\/?/i);
        if (animeMatch && animeMatch[1]) {
          const slug = decodeURIComponent(animeMatch[1]);
          navigation.navigate('AnimeDetails', { slug });
          return;
        }
      }
    } catch (e) {}
    // Для зовнішніх посилань показуємо модалку попередження
    setWarningModal({
      visible: true,
      url: url,
      linkText: text,
      onConfirm: async () => {
        // Переконуємося, що URL має правильний протокол
        let finalUrl = url;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = 'https://' + finalUrl;
        }
        // Спочатку перевіряємо, чи можемо відкрити через Linking (більш надійний на мобільних)
        try {
          const supported = await Linking.canOpenURL(finalUrl);
          if (supported) {
            await Linking.openURL(finalUrl);
            return;
          }
        } catch (linkingError) {
          // Якщо Linking не спрацював, пробуємо WebBrowser
        }
        // Якщо Linking не спрацював, пробуємо WebBrowser
        try {
          await WebBrowser.openBrowserAsync(finalUrl);
        } catch (webBrowserError) {
          // Останній варіант - спробувати навігацію до WebView екрану
          try {
            navigation.navigate('WebView', { url: finalUrl, title: text });
          } catch (navError) {
            // Всі методи не спрацювали
          }
        }
      }
    });
  };
  // Функція для рендерингу тексту з маркдауном
  const renderMarkdownText = (text) => {
    if (!text) return null;
    // Очищаємо зайві відступи після спойлерів та дублікати порожніх рядків
    let cleanedText = text;
    // Видаляємо зайві переноси рядків та пробіли після спойлерів
    cleanedText = cleanedText.replace(/:::\s*spoiler\s*\n?([\s\S]*?)\n?:::\s*\n+/g, (match, content) => {
      // Видаляємо зайві переноси рядків після закриваючого :::
      return `:::spoiler\n${content.trim()}\n:::`;
    });
    // Нормалізуємо переноси рядків (CRLF -> LF)
    cleanedText = cleanedText.replace(/\r\n/g, '\n');
    // Повністю прибираємо порожні рядки (рядки з одними пробілами/табами)
    cleanedText = cleanedText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('');
    // Обрізаємо краї
    cleanedText = cleanedText.trim();
    const parts = [];
    let currentIndex = 0;
    let textContent = cleanedText;
    // Обробка спойлерів :::spoiler ... :::
    const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
    let spoilerMatch;
    const spoilerMatches = [];
    while ((spoilerMatch = spoilerRegex.exec(cleanedText)) !== null) {
      // Очищаємо вміст спойлера від зайвих відступів
      const spoilerContent = spoilerMatch[1].trim();
      spoilerMatches.push({
        type: 'spoiler',
        text: spoilerContent,
        start: spoilerMatch.index,
        end: spoilerMatch.index + spoilerMatch[0].length
      });
    }
    // Обробка посилань [текст](url "title") — титл необов'язковий
    const linkRegex = /\[([^\]]+)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)/g;
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
    // Обробка жирного тексту **текст** (спочатку обробляємо жирний, щоб уникнути конфліктів)
    const boldRegex = /\*\*([^*]+?)\*\*/g;
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
    // Обробка курсиву *текст* (виключаємо ділянки, які вже є жирним текстом)
    const italicRegex = /(?<!\*)\*([^*]+?)\*(?!\*)/g;
    let italicMatch;
    const italicMatches = [];
    while ((italicMatch = italicRegex.exec(cleanedText)) !== null) {
      // Перевіряємо, чи не перекривається з жирним текстом
      let isInsideBold = false;
      for (const bold of boldMatches) {
        if (italicMatch.index >= bold.start && (italicMatch.index + italicMatch[0].length) <= bold.end) {
          isInsideBold = true;
          break;
        }
      }
      if (!isInsideBold) {
        italicMatches.push({
          type: 'italic',
          text: italicMatch[1],
          start: italicMatch.index,
          end: italicMatch.index + italicMatch[0].length
        });
      }
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
    // Спочатку обробляємо спойлери, щоб виключити їх вміст з подальшої обробки
    const processedText = cleanedText;
    const allMatches = [];
    // Додаємо спойлери першими
    allMatches.push(...spoilerMatches);
    // Для інших матчів перевіряємо, чи вони не знаходяться всередині спойлера
    const otherMatches = [...linkMatches, ...boldMatches, ...italicMatches, ...codeMatches];
    for (const match of otherMatches) {
      let isInsideSpoiler = false;
      for (const spoiler of spoilerMatches) {
        if (match.start >= spoiler.start && match.end <= spoiler.end) {
          isInsideSpoiler = true;
          break;
        }
      }
      if (!isInsideSpoiler) {
        allMatches.push(match);
      }
    }
    // Сортуємо за позицією
    allMatches.sort((a, b) => a.start - b.start);
    // Рендеримо текст частинами
    let lastIndex = 0;
    for (const match of allMatches) {
      // Додаємо текст перед матчем
      if (match.start > lastIndex) {
        const plainText = processedText.slice(lastIndex, match.start);
        if (plainText.trim()) {
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
          parts.push({
            type: 'spoiler',
            element: (
              <InlineSpoiler
                key={`spoiler-${match.start}`}
                text={match.text}
                textStyle={textStyle}
                disableLinks={disableLinks}
                handleLinkPress={handleLinkPress}
              />
            )
          });
          break;
        case 'link':
          if (disableLinks) {
            parts.push(
              <Text
                key={`link-${match.start}`}
                style={textStyle}
              >
                {match.text}
              </Text>
            );
          } else {
            parts.push(
              <Text
                key={`link-${match.start}`}
                style={[textStyle, linkStyle]}
                onPress={() => handleLinkPress(match.url, match.text)}
              >
                {match.text}
              </Text>
            );
          }
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
      if (remainingText.trim()) {
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
  // Якщо це масив елементів (є маркдаун), рендеримо їх у одному Text компоненті
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
    // Розділяємо елементи на групи: інлайн та блочні
    const result = [];
    let currentInlineGroup = [];
    markdownContent.forEach((part, index) => {
      if (part.type === 'spoiler') {
        // Якщо є накопичені інлайн елементи, додаємо їх як групу
        if (currentInlineGroup.length > 0) {
          result.push(
            <Text key={`inline-${index}`} style={textStyle}>
              {currentInlineGroup}
            </Text>
          );
          currentInlineGroup = [];
        }
        // Додаємо спойлер як блочний елемент
        result.push(part.element);
      } else {
        // Додаємо до поточної інлайн групи
        currentInlineGroup.push(part);
      }
    });
    // Додаємо останню групу інлайн елементів, якщо вона є
    if (currentInlineGroup.length > 0) {
      result.push(
        <Text key="inline-last" style={textStyle}>
          {currentInlineGroup}
        </Text>
      );
    }
    return (
      <>
        <View>
          {result}
        </View>
        <ExternalLinkWarningModal
          visible={warningModal.visible}
          url={warningModal.url}
          linkText={warningModal.linkText}
          onClose={() => setWarningModal(prev => ({ ...prev, visible: false }))}
          onConfirm={warningModal.onConfirm}
        />
      </>
    );
  }
  // Інакше повертаємо простий текст в обгортці
  return (
    <>
      <Text 
        style={textStyle}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
      >
        {markdownContent}
      </Text>
      <ExternalLinkWarningModal
        visible={warningModal.visible}
        url={warningModal.url}
        linkText={warningModal.linkText}
        onClose={() => setWarningModal(prev => ({ ...prev, visible: false }))}
        onConfirm={warningModal.onConfirm}
      />
    </>
  );
};
// Inline Spoiler Component to avoid circular dependency
const InlineSpoiler = ({ text, textStyle, disableLinks = false, handleLinkPress }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [revealed, setRevealed] = useState(false);
  const toggleSpoiler = () => {
    setRevealed(prev => !prev);
  };
  // Функція для рендерингу маркдауну в спойлері
  const renderSpoilerMarkdown = (text) => {
    if (!text) return null;
    const parts = [];
    let lastIndex = 0;
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
    // Обробка жирного тексту **текст** (спочатку обробляємо жирний, щоб уникнути конфліктів)
    const boldRegex = /\*\*([^*]+?)\*\*/g;
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
    // Обробка курсиву *текст* (виключаємо ділянки, які вже є жирним текстом)
    const italicRegex = /(?<!\*)\*([^*]+?)\*(?!\*)/g;
    let italicMatch;
    const italicMatches = [];
    while ((italicMatch = italicRegex.exec(text)) !== null) {
      // Перевіряємо, чи не перекривається з жирним текстом
      let isInsideBold = false;
      for (const bold of boldMatches) {
        if (italicMatch.index >= bold.start && (italicMatch.index + italicMatch[0].length) <= bold.end) {
          isInsideBold = true;
          break;
        }
      }
      if (!isInsideBold) {
        italicMatches.push({
          type: 'italic',
          text: italicMatch[1],
          start: italicMatch.index,
          end: italicMatch.index + italicMatch[0].length
        });
      }
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
    for (const match of allMatches) {
      // Додаємо текст перед матчем
      if (match.start > lastIndex) {
        const plainText = text.slice(lastIndex, match.start);
        if (plainText.trim()) {
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
          if (disableLinks) {
            parts.push(
              <Text
                key={`link-${match.start}`}
                style={textStyle}
              >
                {match.text}
              </Text>
            );
          } else {
            parts.push(
              <Text
                key={`link-${match.start}`}
                style={[textStyle, { color: theme.colors.primary, textDecorationLine: 'underline' }]}
                onPress={() => handleLinkPress(match.url, match.text)}
              >
                {match.text}
              </Text>
            );
          }
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
              style={[textStyle, { 
                backgroundColor: theme.colors.card,
                fontFamily: 'monospace',
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
              }]}
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
      if (remainingText.trim()) {
        parts.push(
          <Text key={`text-${lastIndex}`} style={textStyle}>
            {remainingText}
          </Text>
        );
      }
    }
    return parts.length > 0 ? parts : <Text style={textStyle}>{text}</Text>;
  };
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={toggleSpoiler}
      style={{ width: '100%', marginVertical: 4 }}
    >
      {revealed ? (
        <View style={{ 
          backgroundColor: theme.colors.inputBackground, 
          padding: 8, 
          borderRadius: 8,
          width: '100%',
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginVertical: 2
        }}>
          <Text style={textStyle}>
            {renderSpoilerMarkdown(text)}
          </Text>
        </View>
      ) : (
        <View style={{ 
          backgroundColor: theme.colors.inputBackground, 
          padding: 8, 
          borderRadius: 8,
          width: '100%',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderStyle: 'dashed',
          marginVertical: 2
        }}>
          <Text style={[textStyle, { 
            color: theme.colors.gray,
            fontStyle: 'italic',
            fontSize: 14,
            fontWeight: '500'
          }]}>
            👁️ Натисніть, щоб показати спойлер
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
export default MarkdownText;
