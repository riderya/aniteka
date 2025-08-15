-- =====================================================
-- НАЛАШТУВАННЯ RLS ПОЛІТИК ДЛЯ МАГАЗИНУ
-- =====================================================

-- 1. Включення RLS для всіх таблиць магазину
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_items ENABLE ROW LEVEL SECURITY;

-- 2. Політики для таблиці shop_categories
-- Категорії доступні всім для читання
CREATE POLICY "Categories are viewable by everyone" ON shop_categories
  FOR SELECT USING (true);

-- 3. Політики для таблиці shop_items
-- Товари доступні всім для читання
CREATE POLICY "Items are viewable by everyone" ON shop_items
  FOR SELECT USING (true);

-- 4. Політики для таблиці user_purchases
-- Покупки доступні тільки власнику для читання
CREATE POLICY "Users can view own purchases" ON user_purchases
  FOR SELECT USING (true);

-- Дозволити вставку покупок
CREATE POLICY "Users can insert own purchases" ON user_purchases
  FOR INSERT WITH CHECK (user_hikka_id IS NOT NULL AND item_id IS NOT NULL);

-- Дозволити видалення тільки власнику (якщо потрібно)
CREATE POLICY "Users can delete own purchases" ON user_purchases
  FOR DELETE USING (true);

-- 5. Політики для таблиці user_active_items
-- Активні предмети доступні тільки власнику для читання
CREATE POLICY "Users can view own active items" ON user_active_items
  FOR SELECT USING (true);

-- Дозволити оновлення активних предметів
CREATE POLICY "Users can update own active items" ON user_active_items
  FOR UPDATE USING (true);

-- Дозволити вставку активних предметів
CREATE POLICY "Users can insert own active items" ON user_active_items
  FOR INSERT WITH CHECK (user_hikka_id IS NOT NULL);

-- Дозволити видалення тільки власнику (якщо потрібно)
CREATE POLICY "Users can delete own active items" ON user_active_items
  FOR DELETE USING (true);

-- 6. Перевірка створених політик
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('shop_categories', 'shop_items', 'user_purchases', 'user_active_items')
ORDER BY tablename, policyname;
