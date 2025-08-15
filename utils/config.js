// Конфігурація додатку
// Для продакшену використовуйте змінні середовища

export const CONFIG = {
  // Supabase налаштування
  SUPABASE: {
    URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here',
    SERVICE_ROLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here',
  },
  
  // Hikka налаштування
  HIKKA: {
    CLIENT_ID: 'e31c506b-5841-4ac4-b2ba-ed900a558617',
    CLIENT_SECRET: 'qRDNu2OQw9FrQW_d3ZsSk50INm5ZmPFPB-09mbyVOpuMcUAyDIRchgz9XK69GBFLQIKXbcNSsRACcTTPQYvTJeOZX5BNps5Qn6LmFATtN5Wj8VLOxR2Bx_y5O-T00kdm',
    REDIRECT_URI: 'yummyanimelist://',
  },
  
  // API налаштування
  API: {
    HIKKA_BASE_URL: 'https://api.hikka.io',
    TIMEOUT: 10000, // 10 секунд
  },
  
  // Налаштування додатку
  APP: {
    NAME: 'YummyAnimeList',
    VERSION: '1.0.0',
    DEBUG: __DEV__,
  }
};

// Функція для перевірки конфігурації
export const validateConfig = () => {
  const errors = [];
  
  // Базова перевірка конфігурації
  if (!CONFIG.HIKKA.CLIENT_ID || CONFIG.HIKKA.CLIENT_ID === 'your-hikka-client-id') {
    errors.push('HIKKA_CLIENT_ID не налаштований');
  }
  
  if (CONFIG.SUPABASE.URL === 'https://your-project.supabase.co') {
    errors.push('SUPABASE_URL не налаштований');
  }
  
  if (CONFIG.SUPABASE.ANON_KEY === 'your-anon-key-here') {
    errors.push('SUPABASE_ANON_KEY не налаштований');
  }
  
  if (errors.length > 0) {

    return false;
  }
  
  return true;
};

// Функція для отримання конфігурації з перевіркою
export const getConfig = () => {
  if (!validateConfig()) {

  }
  return CONFIG;
};
