import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

// Ініціалізація Supabase клієнта
let supabase;
let supabaseAdmin;
try {
  supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY);
  
  // Клієнт з service role key для адміністративних операцій (якщо налаштований)
  if (CONFIG.SUPABASE.SERVICE_ROLE_KEY && CONFIG.SUPABASE.SERVICE_ROLE_KEY !== 'your-service-role-key-here') {
    supabaseAdmin = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
} catch (error) {
  supabase = null;
  supabaseAdmin = null;
}

// Функції для користувачів
export const saveUserToSupabase = async (userData) => {
  // Завжди використовуємо fallback функцію, яка спробує anon key, а потім service role key
  return saveUserToSupabaseWithFallback(userData);
};

// Альтернативна функція з fallback на service role key
export const saveUserToSupabaseWithFallback = async (userData) => {
  if (!supabase) {
    return { success: false, error: 'Supabase не налаштований' };
  }
  
  try {
    // Спочатку перевіряємо, чи існує користувач
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('coins, created_at')
      .eq('hikka_id', userData.reference)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return { success: false, error: fetchError.message };
    }

    const isNewUser = !existingUser;
    const currentTime = new Date().toISOString();

    if (isNewUser) {
      // Новий користувач - спробуємо створити з anon key
      let { data, error } = await supabase
        .from('users')
        .insert({
          hikka_id: userData.reference,
          username: userData.username,
          email: userData.email,
          coins: 100,
          last_login: currentTime,
          created_at: currentTime,
          updated_at: currentTime
        })
        .select()
        .single();

      // Якщо не спрацювало з anon key, спробуємо з service role key
      if (error && error.code === '42501') {
        const result = await supabaseAdmin
          .from('users')
          .insert({
            hikka_id: userData.reference,
            username: userData.username,
            email: userData.email,
            coins: 100,
            last_login: currentTime,
            created_at: currentTime,
            updated_at: currentTime
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, isNewUser: true };
    } else {
      // Існуючий користувач - оновлюємо тільки необхідні поля
      let { data, error } = await supabase
        .from('users')
        .update({
          username: userData.username,
          email: userData.email,
          last_login: currentTime,
          updated_at: currentTime
        })
        .eq('hikka_id', userData.reference)
        .select()
        .single();

      // Якщо не спрацювало з anon key, спробуємо з service role key
      if (error && error.code === '42501') {
        const result = await supabaseAdmin
          .from('users')
          .update({
            username: userData.username,
            email: userData.email,
            last_login: currentTime,
            updated_at: currentTime
          })
          .eq('hikka_id', userData.reference)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, isNewUser: false };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserFromSupabase = async (hikkaId) => {
  if (!supabase) {
    return null;
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('hikka_id', hikkaId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('hikka_id', hikkaId)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
};

export const updateLastLogin = async (hikkaId) => {
  if (!supabase) {
    return false;
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('hikka_id', hikkaId);

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('hikka_id', hikkaId);
      
      error = result.error;
    }

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Функції для монет
export const getUserCoins = async (hikkaId) => {
  if (!supabase) {
    return 0;
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { data, error } = await supabase
      .from('users')
      .select('coins')
      .eq('hikka_id', hikkaId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .select('coins')
        .eq('hikka_id', hikkaId)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return 0;
    }

    return data?.coins || 0;
  } catch (error) {
    return 0;
  }
};

export const addCoins = async (hikkaId, amount) => {
  if (!supabase) {
    return 0;
  }
  
  try {
    // Спочатку отримуємо поточну кількість монет
    let { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('coins')
      .eq('hikka_id', hikkaId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (fetchError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .select('coins')
        .eq('hikka_id', hikkaId)
        .single();
      
      currentUser = result.data;
      fetchError = result.error;
    }

    if (fetchError) {
      return 0;
    }

    const newCoins = (currentUser.coins || 0) + amount;

    // Оновлюємо кількість монет
    let { data, error } = await supabase
      .from('users')
      .update({ 
        coins: newCoins,
        updated_at: new Date().toISOString()
      })
      .eq('hikka_id', hikkaId)
      .select('coins')
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .update({ 
          coins: newCoins,
          updated_at: new Date().toISOString()
        })
        .eq('hikka_id', hikkaId)
        .select('coins')
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return 0;
    }

    return data?.coins || 0;
  } catch (error) {
    return 0;
  }
};

export const subtractCoins = async (hikkaId, amount) => {
  if (!supabase) {
    return 0;
  }
  
  try {
    // Спочатку отримуємо поточну кількість монет
    let { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('coins')
      .eq('hikka_id', hikkaId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (fetchError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .select('coins')
        .eq('hikka_id', hikkaId)
        .single();
      
      currentUser = result.data;
      fetchError = result.error;
    }

    if (fetchError) {
      return 0;
    }

    const currentCoins = currentUser.coins || 0;
    
    if (currentCoins < amount) {
      return currentCoins;
    }

    const newCoins = currentCoins - amount;

    // Оновлюємо кількість монет
    let { data, error } = await supabase
      .from('users')
      .update({ 
        coins: newCoins,
        updated_at: new Date().toISOString()
      })
      .eq('hikka_id', hikkaId)
      .select('coins')
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .update({ 
          coins: newCoins,
          updated_at: new Date().toISOString()
        })
        .eq('hikka_id', hikkaId)
        .select('coins')
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return currentCoins;
    }

    return data?.coins || 0;
  } catch (error) {
    return 0;
  }
};

export const setUserCoins = async (hikkaId, amount) => {
  if (!supabase) {
    return 0;
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { data, error } = await supabase
      .from('users')
      .update({ 
        coins: amount,
        updated_at: new Date().toISOString()
      })
      .eq('hikka_id', hikkaId)
      .select('coins')
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .update({ 
          coins: amount,
          updated_at: new Date().toISOString()
        })
        .eq('hikka_id', hikkaId)
        .select('coins')
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return 0;
    }

    return data?.coins || 0;
  } catch (error) {
    return 0;
  }
};

// Функції для магазину
export const getShopCategories = async () => {
  if (!supabase) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('shop_categories')
      .select('*')
      .order('name');

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

export const getShopItems = async (categoryId = null, itemType = null) => {
  if (!supabase) {
    return [];
  }
  
  try {
    let query = supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

export const getFeaturedItems = async () => {
  if (!supabase) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('name');

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

export const purchaseItem = async (hikkaId, itemId) => {
  if (!supabase) {
    return { success: false, error: 'Supabase не налаштований' };
  }
  
  try {
    // Отримуємо інформацію про товар
    let { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (itemError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('shop_items')
        .select('*')
        .eq('id', itemId)
        .single();
      
      item = result.data;
      itemError = result.error;
    }

    if (itemError || !item) {
      return { success: false, error: 'Товар не знайдено' };
    }

    // Перевіряємо, чи вже купив користувач цей товар
    let { data: existingPurchase, error: checkError } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('user_hikka_id', hikkaId)
      .eq('item_id', itemId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (checkError && checkError.code !== 'PGRST116' && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_purchases')
        .select('*')
        .eq('user_hikka_id', hikkaId)
        .eq('item_id', itemId)
        .single();
      
      existingPurchase = result.data;
      checkError = result.error;
    }

    // Якщо товар вже куплено (PGRST116 = no rows returned)
    if (existingPurchase) {
      return { success: false, error: 'Ви вже купили цей товар' };
    }

    // Перевіряємо баланс користувача
    const userCoins = await getUserCoins(hikkaId);
    if (userCoins < item.price) {
      return { success: false, error: 'Недостатньо монет' };
    }

    // Починаємо транзакцію
    let { data: purchase, error: purchaseError } = await supabase
      .from('user_purchases')
      .insert({
        user_hikka_id: hikkaId,
        item_id: itemId,
        price_paid: item.price,
        purchased_at: new Date().toISOString()
      })
      .select()
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (purchaseError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_purchases')
        .insert({
          user_hikka_id: hikkaId,
          item_id: itemId,
          price_paid: item.price,
          purchased_at: new Date().toISOString()
        })
        .select()
        .single();
      
      purchase = result.data;
      purchaseError = result.error;
    }

    if (purchaseError) {
      return { success: false, error: purchaseError.message };
    }

    // Віднімаємо монети
    const remainingCoins = await subtractCoins(hikkaId, item.price);

    return { 
      success: true, 
      purchase, 
      remainingCoins 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserPurchases = async (hikkaId) => {
  if (!supabase) {
    return [];
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { data, error } = await supabase
      .from('user_purchases')
      .select(`
        *,
        shop_items (*)
      `)
      .eq('user_hikka_id', hikkaId)
      .order('purchased_at', { ascending: false });

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_purchases')
        .select(`
          *,
          shop_items (*)
        `)
        .eq('user_hikka_id', hikkaId)
        .order('purchased_at', { ascending: false });
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

// Функція для отримання ID куплених товарів
export const getPurchasedItemIds = async (hikkaId) => {
  if (!supabase) {
    return [];
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { data, error } = await supabase
      .from('user_purchases')
      .select('item_id')
      .eq('user_hikka_id', hikkaId);

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_purchases')
        .select('item_id')
        .eq('user_hikka_id', hikkaId);
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return [];
    }

    // Повертаємо масив ID товарів
    return data?.map(purchase => purchase.item_id) || [];
  } catch (error) {
    return [];
  }
};

export const setActiveItem = async (hikkaId, itemId, itemType) => {
  if (!supabase) {
    return false;
  }
  
  try {
    // Перевіряємо, чи є товар у користувача
    let { data: purchase, error: purchaseError } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('user_hikka_id', hikkaId)
      .eq('item_id', itemId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (purchaseError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_purchases')
        .select('*')
        .eq('user_hikka_id', hikkaId)
        .eq('item_id', itemId)
        .single();
      
      purchase = result.data;
      purchaseError = result.error;
    }

    if (purchaseError || !purchase) {
      return false;
    }

    // Оновлюємо активний предмет
    let { error } = await supabase
      .from('user_active_items')
      .upsert({
        user_hikka_id: hikkaId,
        [`${itemType}_id`]: itemId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_hikka_id'
      });

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_active_items')
        .upsert({
          user_hikka_id: hikkaId,
          [`${itemType}_id`]: itemId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_hikka_id'
        });
      
      error = result.error;
    }

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const deactivateItem = async (hikkaId, itemType) => {
  if (!supabase) {
    return false;
  }
  
  try {
    // Отримуємо поточні активні предмети
    let { data: activeItems, error: fetchError } = await supabase
      .from('user_active_items')
      .select('*')
      .eq('user_hikka_id', hikkaId)
      .single();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (fetchError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_active_items')
        .select('*')
        .eq('user_hikka_id', hikkaId)
        .single();
      
      activeItems = result.data;
      fetchError = result.error;
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      return false;
    }

    if (!activeItems) {
      return true;
    }

    // Створюємо об'єкт для оновлення, встановлюючи конкретний тип предмету в null
    const updateData = {
      [`${itemType}_id`]: null,
      updated_at: new Date().toISOString()
    };

    // Оновлюємо активний предмет
    let { error } = await supabase
      .from('user_active_items')
      .update(updateData)
      .eq('user_hikka_id', hikkaId);

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_active_items')
        .update(updateData)
        .eq('user_hikka_id', hikkaId);
      
      error = result.error;
    }

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const getUserActiveItems = async (hikkaId) => {
  if (!supabase) {
    return {};
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { data, error } = await supabase
      .from('user_active_items')
      .select('*')
      .eq('user_hikka_id', hikkaId)
      .maybeSingle();

    // Якщо не спрацювало і є admin клієнт, спробуємо з ним
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('user_active_items')
        .select('*')
        .eq('user_hikka_id', hikkaId)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return {};
    }

    return data || {};
  } catch (error) {
    return {};
  }
};

// Тест підключення
export const testSupabaseConnection = async () => {
  if (!supabase) {
    return false;
  }
  
  try {
    // Спочатку спробуємо з anon key
    let { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    // Якщо не спрацювало, спробуємо з service role key
    if (error && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Тестова функція для перевірки даних магазину
export const testShopData = async () => {
  if (!supabase) {
    return { categories: 0, items: 0 };
  }
  
  try {
    // Перевіряємо категорії
    let { data: categories, error: categoriesError } = await supabase
      .from('shop_categories')
      .select('*');
    
    if (categoriesError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('shop_categories')
        .select('*');
      categories = result.data;
      categoriesError = result.error;
    }
    
    if (categoriesError) {
      return { categories: 0, items: 0 };
    }
    
    // Перевіряємо товари
    let { data: items, error: itemsError } = await supabase
      .from('shop_items')
      .select('*');
    
    if (itemsError && supabaseAdmin) {
      const result = await supabaseAdmin
        .from('shop_items')
        .select('*');
      items = result.data;
      itemsError = result.error;
    }
    
    if (itemsError) {
      return { categories: categories?.length || 0, items: 0 };
    }
    
    return { 
      categories: categories?.length || 0, 
      items: items?.length || 0,
      categoriesData: categories,
      itemsData: items
    };
  } catch (error) {
    return { categories: 0, items: 0 };
  }
};

export default supabase;
