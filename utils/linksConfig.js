// Конфігурація посилань для додатку YummyAnimeList

export const LINKS_CONFIG = {
  // Основне посилання для поділення аніме (Vercel - безкоштовно)
  SHARE_BASE_URL: 'https://yummyanimelist.vercel.app',
  
  // Fallback посилання (GitHub Pages - безкоштовно)
  FALLBACK_URL: 'https://yourusername.github.io/yummyanimelist',
  
  // Firebase Dynamic Links (закоментуйте, якщо не налаштовано)
  // FIREBASE_DYNAMIC_LINKS: 'https://yummyanimelist.page.link',
  
  // Альтернативні хостинги (безкоштовно)
  NETLIFY_URL: 'https://yummyanimelist.netlify.app',
  VERCEL_URL: 'https://yummyanimelist.vercel.app',
  
  // Локальні deep links
  DEEP_LINK_SCHEME: 'yummyanimelist://',
};

// Функція для створення посилання на аніме
export const createAnimeLink = (slug, useFallback = false) => {
  if (useFallback) {
    return LINKS_CONFIG.FALLBACK_URL;
  }
  
  return `${LINKS_CONFIG.SHARE_BASE_URL}/anime/${slug}`;
};

// Функція для створення deep link
export const createDeepLink = (slug) => {
  return `${LINKS_CONFIG.DEEP_LINK_SCHEME}anime/${slug}`;
};

// Функція для створення Firebase Dynamic Link (якщо налаштовано)
export const createFirebaseLink = (slug) => {
  // Розкоментуйте, якщо Firebase Dynamic Links налаштовано
  // return `${LINKS_CONFIG.FIREBASE_DYNAMIC_LINKS}/anime-${slug}`;
  
  // Повертаємо звичайне посилання як fallback
  return createAnimeLink(slug);
};
