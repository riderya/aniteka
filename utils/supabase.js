import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

// Ініціалізація Supabase клієнта
let supabase;
let supabaseAdmin;
try {
  supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
  
  // Клієнт з service role key для адміністративних операцій (якщо налаштований)
  if (CONFIG.SUPABASE.SERVICE_ROLE_KEY && CONFIG.SUPABASE.SERVICE_ROLE_KEY !== 'your-service-role-key-here') {
    supabaseAdmin = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
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

export default supabase;
