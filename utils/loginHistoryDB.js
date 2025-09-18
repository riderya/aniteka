import * as SQLite from 'expo-sqlite';

const DB_NAME = 'login_history.db';
const TABLE_NAME = 'login_history';

let dbPromise = null;
const getDB = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
};

// Ініціалізація бази даних (одноразово)
export const initLoginHistoryDB = async () => {
  try {
    const db = await getDB();

    // Оптимізація журналювання
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // Створюємо таблицю якщо її немає
    await db.execAsync(`
CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  user_id TEXT,
  username TEXT,
  platform TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

    // Спрощений індекс (без DESC, для сумісності)
    await db.execAsync(`
CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_timestamp ON ${TABLE_NAME}(timestamp);
`);

    return db;
  } catch (error) {
    console.error('Error initializing login history database:', error);
    throw error;
  }
};

// Додати запис про вхід
export const addLoginRecord = async (loginData) => {
  try {
    const db = await getDB();

    const { timestamp, userId, username, platform } = loginData;

    await db.runAsync(
      `INSERT INTO ${TABLE_NAME} (timestamp, user_id, username, platform) VALUES (?, ?, ?, ?)`,
      timestamp,
      userId || null,
      username || null,
      platform || 'unknown'
    );

    // Видаляємо старі записи (залишаємо тільки останні 50 по id)
    await db.runAsync(`
DELETE FROM ${TABLE_NAME}
WHERE id NOT IN (
  SELECT id FROM ${TABLE_NAME}
  ORDER BY id DESC
  LIMIT 50
);
`);

    return true;
  } catch (error) {
    console.error('Error adding login record:', error);
    return false;
  }
};

// Отримати всі записи історії входів
export const getLoginHistory = async (limit = 50) => {
  try {
    const db = await getDB();

    // Кладемо безпечне число (щоб уникнути проблем з біндингом в LIMIT)
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 200));

    const result = await db.getAllAsync(
      `SELECT * FROM ${TABLE_NAME}
       ORDER BY timestamp DESC
       LIMIT ${safeLimit}`
    );

    return result || [];
  } catch (error) {
    console.error('Error getting login history:', error);
    return [];
  }
};

// Очистити всю історію входів
export const clearLoginHistory = async () => {
  try {
    const db = await getDB();

    await db.runAsync(`DELETE FROM ${TABLE_NAME}`);

    return true;
  } catch (error) {
    console.error('Error clearing login history:', error);
    return false;
  }
};

// Отримати кількість записів
export const getLoginHistoryCount = async () => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`);

    return result?.count || 0;
  } catch (error) {
    console.error('Error getting login history count:', error);
    return 0;
  }
};
