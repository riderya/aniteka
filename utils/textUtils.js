/**
 * Утиліти для обробки тексту
 */

/**
 * Очищує текст від зайвих переносів рядків
 * @param {string} text - Вхідний текст
 * @returns {string} - Очищений текст
 */
export const cleanText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  return text
    // Замінюємо множинні переноси рядків на одинарні
    .replace(/\n{3,}/g, '\n\n')
    // Видаляємо пробіли на початку та в кінці рядків
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Видаляємо порожні рядки на початку та в кінці
    .trim();
};

/**
 * Обробляє текст коментаря з урахуванням спойлерів
 * @param {string} text - Вхідний текст
 * @returns {string} - Оброблений текст
 */
export const processCommentText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Спочатку очищуємо текст
  let cleanedText = cleanText(text);
  
  // Обробляємо спойлери окремо, щоб зберегти їх структуру
  const spoilerRegex = /:::spoiler\s*\n?([\s\S]*?)\n?:::/g;
  
  return cleanedText.replace(spoilerRegex, (match, spoilerContent) => {
    // Очищуємо вміст спойлера, але зберігаємо структуру
    const cleanedSpoilerContent = cleanText(spoilerContent);
    return `:::spoiler\n${cleanedSpoilerContent}\n:::`;
  });
};

/**
 * Тримає текст до певної довжини з урахуванням слів
 * @param {string} text - Вхідний текст
 * @param {number} maxLength - Максимальна довжина
 * @returns {string} - Обрізаний текст
 */
export const truncateText = (text, maxLength = 200) => {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};
