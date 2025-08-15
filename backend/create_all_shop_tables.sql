-- =====================================================
-- ПОВНИЙ СКРИПТ ДЛЯ СТВОРЕННЯ ВСІХ ТАБЛИЦЬ МАГАЗИНУ
-- =====================================================

-- 1. Створення таблиці категорій магазину
CREATE TABLE IF NOT EXISTS shop_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Створення таблиці товарів магазину
CREATE TABLE IF NOT EXISTS shop_items (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES shop_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  preview_url TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('banner', 'profile_picture', 'avatar_overlay')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Створення таблиці покупок користувачів
CREATE TABLE IF NOT EXISTS user_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_hikka_id TEXT NOT NULL,
  item_id BIGINT REFERENCES shop_items(id),
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Створення таблиці активних предметів користувачів
CREATE TABLE IF NOT EXISTS user_active_items (
  id BIGSERIAL PRIMARY KEY,
  user_hikka_id TEXT UNIQUE NOT NULL,
  banner_id BIGINT REFERENCES shop_items(id),
  profile_picture_id BIGINT REFERENCES shop_items(id),
  avatar_overlay_id BIGINT REFERENCES shop_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Створення індексів для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON shop_items(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_type ON shop_items(item_type);
CREATE INDEX IF NOT EXISTS idx_shop_items_active ON shop_items(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_items_featured ON shop_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_hikka_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item ON user_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_user_active_items_user ON user_active_items(user_hikka_id);

-- 6. Створення функції для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Створення тригерів для автоматичного оновлення updated_at
CREATE TRIGGER update_shop_items_updated_at 
    BEFORE UPDATE ON shop_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_active_items_updated_at 
    BEFORE UPDATE ON user_active_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Вставка початкових категорій
INSERT INTO shop_categories (name, description, icon) VALUES
  ('Бенери', 'Красиві бенери для вашого профілю', '🎨'),
  ('Картинки профілю', 'Унікальні аватари', '🖼️'),
  ('Оверлеї аватарів', 'Спеціальні ефекти для аватара', '✨')
ON CONFLICT DO NOTHING;

-- 9. Вставка початкових товарів
INSERT INTO shop_items (category_id, name, description, price, image_url, preview_url, item_type, rarity, is_featured) VALUES
  (1, 'Класичний бенер', 'Елегантний бенер у темних тонах', 50, 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Класичний+Бенер', 'https://via.placeholder.com/150x100/4A90E2/FFFFFF?text=Класичний+Бенер', 'banner', 'common', false),
  (1, 'Аніме бенер', 'Яскравий бенер з аніме мотивами', 100, 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Аніме+Бенер', 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=Аніме+Бенер', 'banner', 'rare', true),
  (1, 'Легендарний бенер', 'Унікальний бенер з анімацією', 500, 'https://via.placeholder.com/300x200/FFD93D/000000?text=Легендарний+Бенер', 'https://via.placeholder.com/150x100/FFD93D/000000?text=Легендарний+Бенер', 'banner', 'legendary', false),
  (2, 'Класичний аватар', 'Простий але стильний аватар', 30, 'https://via.placeholder.com/200x200/9B59B6/FFFFFF?text=Класичний+Аватар', 'https://via.placeholder.com/100x100/9B59B6/FFFFFF?text=Класичний+Аватар', 'profile_picture', 'common', false),
  (2, 'Аніме аватар', 'Красивий аватар з аніме персонажем', 75, 'https://via.placeholder.com/200x200/E74C3C/FFFFFF?text=Аніме+Аватар', 'https://via.placeholder.com/100x100/E74C3C/FFFFFF?text=Аніме+Аватар', 'profile_picture', 'rare', true),
  (2, 'Епічний аватар', 'Унікальний аватар з ефектами', 200, 'https://via.placeholder.com/200x200/F39C12/FFFFFF?text=Епічний+Аватар', 'https://via.placeholder.com/100x100/F39C12/FFFFFF?text=Епічний+Аватар', 'profile_picture', 'epic', false),
  (3, 'Зоряний оверлей', 'Містичний оверлей зі зірками', 80, 'https://shared.akamai.steamstatic.com/community_assets/images/items/1232580/7e41e2a48ea057e0f6267ff736815cd1354e04d3.png', 'https://via.placeholder.com/100x100/3498DB/FFFFFF?text=Зоряний+Оверлей', 'avatar_overlay', 'rare', true),
  (3, 'Вогняний оверлей', 'Драматичний оверлей з вогнем', 150, 'https://via.placeholder.com/200x200/3498DB/FFFFFF?text=Вогняний+Оверлей', 'https://via.placeholder.com/100x100/3498DB/FFFFFF?text=Вогняний+Оверлей', 'avatar_overlay', 'epic', false),
  (3, 'Легендарний оверлей', 'Унікальний оверлей з анімацією', 300, 'https://via.placeholder.com/200x200/2ECC71/FFFFFF?text=Легендарний+Оверлей', 'https://via.placeholder.com/100x100/2ECC71/FFFFFF?text=Легендарний+Оверлей', 'avatar_overlay', 'legendary', false)
ON CONFLICT DO NOTHING;

-- 10. Перевірка створених даних
SELECT 'shop_categories' as table_name, COUNT(*) as count FROM shop_categories
UNION ALL
SELECT 'shop_items' as table_name, COUNT(*) as count FROM shop_items
UNION ALL
SELECT 'user_purchases' as table_name, COUNT(*) as count FROM user_purchases
UNION ALL
SELECT 'user_active_items' as table_name, COUNT(*) as count FROM user_active_items;

-- 11. Показати всі категорії
SELECT * FROM shop_categories ORDER BY id;

-- 12. Показати всі товари з інформацією про категорії
SELECT 
  si.id,
  si.name,
  si.description,
  si.price,
  si.item_type,
  si.rarity,
  si.is_active,
  si.is_featured,
  sc.name as category_name,
  si.image_url
FROM shop_items si
LEFT JOIN shop_categories sc ON si.category_id = sc.id
ORDER BY si.category_id, si.id;

-- 13. Показати рекомендовані товари
SELECT 
  id,
  name,
  item_type,
  rarity,
  price,
  image_url
FROM shop_items 
WHERE is_featured = true
ORDER BY price;
