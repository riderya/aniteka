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
