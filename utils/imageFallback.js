// Утиліта для пошуку зображень в контенті
export const findFirstImageFromContent = (content) => {
  if (!content) return null;
  
  // Якщо контент - це рядок, шукаємо URL зображень
  if (typeof content === 'string') {
    // Спочатку шукаємо в HTML тегах img
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const imgMatches = content.match(imgTagRegex);
    if (imgMatches && imgMatches.length > 0) {
      const srcMatch = imgMatches[0].match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }
    
    // Потім шукаємо звичайні URL зображень
    const imageRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s<>"{}|\\^`\[\]]*)?/gi;
    const matches = content.match(imageRegex);
    
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  
  // Якщо контент - це об'єкт з полем image
  if (typeof content === 'object' && content !== null) {
    if (content.image) {
      return content.image;
    }
    
    // Шукаємо в різних можливих полях
    const possibleImageFields = ['image', 'img', 'photo', 'picture', 'banner', 'cover'];
    
    for (const field of possibleImageFields) {
      if (content[field]) {
        return content[field];
      }
    }
    
    // Якщо є поле content, рекурсивно шукаємо в ньому
    if (content.content) {
      return findFirstImageFromContent(content.content);
    }
    
    // Якщо є поле text або description, шукаємо в них
    if (content.text) {
      return findFirstImageFromContent(content.text);
    }
    
    if (content.description) {
      return findFirstImageFromContent(content.description);
    }
  }
  
  return null;
};

// Функція для пошуку зображень в document структурі
const findImageInDocument = (document) => {
  if (!document || !Array.isArray(document)) return null;
  
  for (const block of document) {
    if (block.type === 'image_group' && block.children) {
      for (const child of block.children) {
        if (child.type === 'image' && child.url) {
          return child.url;
        }
      }
    }
    
    // Рекурсивно шукаємо в дочірніх елементах
    if (block.children && Array.isArray(block.children)) {
      const childImage = findImageInDocument(block.children);
      if (childImage) return childImage;
    }
  }
  
  return null;
};

// Функція для отримання fallback зображення
export const getArticleImage = (article) => {
  // Спочатку перевіряємо основне зображення
  if (article.content?.image) {
    return article.content.image;
  }
  
  // Якщо основного зображення немає, шукаємо в document
  const documentImage = findImageInDocument(article.document);
  if (documentImage) {
    return documentImage;
  }
  
  // Якщо основного зображення немає, шукаємо в контенті
  const contentImage = findFirstImageFromContent(article.content);
  if (contentImage) {
    return contentImage;
  }
  
  // Шукаємо в інших можливих полях статті
  const possibleFields = ['text', 'description', 'synopsis', 'body', 'content_text'];
  for (const field of possibleFields) {
    if (article[field]) {
      const fieldImage = findFirstImageFromContent(article[field]);
      if (fieldImage) {
        return fieldImage;
      }
    }
  }
  
  // Якщо немає зображень в контенті, повертаємо null
  return null;
}; 