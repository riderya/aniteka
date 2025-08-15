# Налаштування Supabase для YummyAnimeList

## 1. Створення проекту в Supabase

1. Перейдіть на [supabase.com](https://supabase.com)
2. Створіть новий проект
3. Запишіть URL та ключі проекту

## 2. Налаштування змінних середовища

Створіть файл `.env` в корені проекту з наступними змінними:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Як отримати ключі:

1. **URL**: В налаштуваннях проекту в розділі "Settings" > "API"
2. **ANON_KEY**: В тому ж розділі "Settings" > "API" (Project API keys > anon public)
3. **SERVICE_ROLE_KEY**: В тому ж розділі "Settings" > "API" (Project API keys > service_role secret)

## 3. Створення таблиць

Виконайте SQL скрипти в порядку:

1. `backend/create_table.sql` - створює основні таблиці
2. `backend/create_shop_tables.sql` - створює таблиці для магазину
3. `backend/setup_rls.sql` - налаштовує Row Level Security

### Якщо виникають проблеми з RLS:

Якщо після виконання `setup_rls.sql` виникають помилки з Row Level Security, виконайте:

4. `backend/fix_rls_policies.sql` - виправляє політики RLS

### Як виконати SQL:

1. Перейдіть в Supabase Dashboard
2. Виберіть ваш проект
3. Перейдіть в "SQL Editor"
4. Скопіюйте та виконайте кожен скрипт окремо

## 4. Перевірка налаштувань

Після налаштування перевірте:

1. Таблиці створені в розділі "Table Editor"
2. RLS політики активні в розділі "Authentication" > "Policies"
3. Додаток підключається до Supabase (перевірте логи в консолі)

## 5. Важливі примітки

- **SERVICE_ROLE_KEY** має повні права доступу до бази даних
- **ANON_KEY** має обмежені права, визначені RLS політиками
- Для операцій з користувачами використовується SERVICE_ROLE_KEY
- Для публічних операцій (магазин, категорії) використовується ANON_KEY

### Якщо у вас немає SERVICE_ROLE_KEY:

Якщо ви не можете або не хочете використовувати SERVICE_ROLE_KEY, додаток автоматично спробує використати ANON_KEY з правильними RLS політиками. В цьому випадку просто не додавайте `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` до `.env` файлу.

## 6. Безпека

- Ніколи не комітьте `.env` файл в Git
- Додайте `.env` до `.gitignore`
- Використовуйте різні ключі для розробки та продакшену
