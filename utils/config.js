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
  const requiredFields = [
    'SUPABASE.URL',
    'SUPABASE.ANON_KEY',
    'HIKKA.CLIENT_ID',
    'HIKKA.CLIENT_SECRET',
    'HIKKA.REDIRECT_URI'
  ];

  const missingFields = requiredFields.filter(field => {
    const keys = field.split('.');
    let value = CONFIG;
    for (const key of keys) {
      value = value[key];
    }
    return !value || value === 'your-anon-key-here' || value === 'your-project.supabase.co';
  });

  if (missingFields.length > 0) {
    console.warn('⚠️ Відсутні або неправильні налаштування:', missingFields);
    return false;
  }

  return true;
};
