import { CONFIG } from './config';

/**
 * Пошук аніме в TMDB за назвою
 * @param {string} title - Назва аніме
 * @param {string} mediaType - Тип медіа ('tv' або 'movie')
 * @returns {Promise<Array>} - Масив результатів пошуку
 */
export const searchTMDB = async (title, mediaType = 'tv') => {
  try {
    const searchUrl = `${CONFIG.API.TMDB_BASE_URL}/search/${mediaType}?api_key=${CONFIG.API.TMDB_API_KEY}&language=uk-UA&query=${encodeURIComponent(title)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    return data.results || [];
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
};

/**
 * Отримання деталей аніме з TMDB за ID
 * @param {number} tmdbId - TMDB ID
 * @param {string} mediaType - Тип медіа ('tv' або 'movie')
 * @returns {Promise<Object|null>} - Деталі аніме або null
 */
export const getTMDBDetails = async (tmdbId, mediaType = 'tv') => {
  try {
    const detailsUrl = `${CONFIG.API.TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${CONFIG.API.TMDB_API_KEY}&language=uk-UA`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching TMDB details:', error);
    return null;
  }
};

// Нормалізація рядків для порівняння назв
const normalizeTitle = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // діакритика
    .replace(/[^a-z0-9\p{sc=Cyrl}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\s]/giu, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const y = parseInt(String(dateStr).slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
};

const titleMatches = (tmdbItem, titles = []) => {
  const candidates = [
    tmdbItem?.name,
    tmdbItem?.original_name,
    tmdbItem?.title,
    tmdbItem?.original_title,
  ].filter(Boolean);
  if (candidates.length === 0 || titles.length === 0) return false;
  const normCandidates = candidates.map(normalizeTitle);
  const normTitles = titles.map(normalizeTitle).filter(Boolean);
  return normTitles.some((t) => normCandidates.some((c) => c === t || c.includes(t) || t.includes(c)));
};

const yearMatches = (tmdbItem, expectedYear) => {
  if (!expectedYear) return false;
  const year = extractYear(tmdbItem?.first_air_date || tmdbItem?.release_date);
  if (!year) return false;
  return year === expectedYear; // строгий збіг року
};

export const findBestTMDBMatch = async (titles = [], expectedYear = null, mediaType = 'tv') => {
  try {
    const primaryTitle = titles.find(Boolean) || '';
    const results = await searchTMDB(primaryTitle, mediaType);
    if (!Array.isArray(results) || results.length === 0) return null;

    // Оцінка: 2 бали за збіг року + назви, 1 бал за збіг назви, 1 бал за збіг року
    const scored = results.slice(0, 10).map((item) => {
      const matchTitle = titleMatches(item, titles);
      const matchYear = yearMatches(item, expectedYear);
      const score = (matchTitle && matchYear) ? 3 : (matchTitle ? 2 : (matchYear ? 1 : 0));
      return { item, score, matchTitle, matchYear };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best || best.score === 0) return null;
    return best.item;
  } catch (e) {
    console.error('Error finding best TMDB match:', e);
    return null;
  }
};

export const getTMDBBannerValidatedById = async (tmdbId, titles = [], expectedYear = null, mediaType = 'tv') => {
  try {
    const details = await getTMDBDetails(tmdbId, mediaType);
    if (!details) return null;
    const validTitle = titles.length === 0 ? true : titleMatches(details, titles);
    const validYear = expectedYear ? yearMatches(details, expectedYear) : true;
    if (!(validTitle && validYear)) return null;
    if (details?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
    }
    return null;
  } catch (e) {
    console.error('Error validating TMDB by id:', e);
    return null;
  }
};

export const getTMDBBannerByMeta = async (titles = [], expectedYear = null, mediaType = 'tv') => {
  try {
    const match = await findBestTMDBMatch(titles, expectedYear, mediaType);
    if (!match) return null;
    const details = await getTMDBDetails(match.id, mediaType);
    if (details?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
    }
    return null;
  } catch (e) {
    console.error('Error fetching TMDB banner by meta:', e);
    return null;
  }
};

/**
 * Отримання банеру аніме з TMDB
 * @param {number} tmdbId - TMDB ID
 * @param {string} mediaType - Тип медіа ('tv' або 'movie')
 * @returns {Promise<string|null>} - URL банеру або null
 */
export const getTMDBBanner = async (tmdbId, mediaType = 'tv') => {
  try {
    const details = await getTMDBDetails(tmdbId, mediaType);
    
    if (details?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching TMDB banner:', error);
    return null;
  }
};

/**
 * Пошук та отримання TMDB ID для аніме
 * @param {string} title - Назва аніме
 * @param {string} mediaType - Тип медіа ('tv' або 'movie')
 * @returns {Promise<number|null>} - TMDB ID або null
 */
export const findTMDBId = async (title, mediaType = 'tv') => {
  try {
    const results = await searchTMDB(title, mediaType);
    
    if (results.length > 0) {
      // Повертаємо ID першого результату
      return results[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding TMDB ID:', error);
    return null;
  }
};

/**
 * Отримання банеру аніме з TMDB за назвою
 * @param {string} title - Назва аніме
 * @param {string} mediaType - Тип медіа ('tv' або 'movie')
 * @returns {Promise<string|null>} - URL банеру або null
 */
export const getTMDBBannerByTitle = async (title, mediaType = 'tv') => {
  try {
    // Спочатку шукаємо аніме за назвою
    const results = await searchTMDB(title, mediaType);
    
    if (results.length > 0) {
      const firstResult = results[0];
      
      // Отримуємо деталі для першого результату
      const details = await getTMDBDetails(firstResult.id, mediaType);
      
      if (details?.backdrop_path) {
        return `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching TMDB banner by title:', error);
    return null;
  }
};

/**
 * Перевірка чи налаштований TMDB API
 * @returns {boolean} - true якщо API ключ налаштований
 */
export const isTMDBConfigured = () => {
  return CONFIG.API.TMDB_API_KEY && CONFIG.API.TMDB_API_KEY !== 'your-tmdb-api-key-here';
};
