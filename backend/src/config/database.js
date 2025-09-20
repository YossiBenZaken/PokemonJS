import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// קונפיגורציה לחיבור MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pokemon',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// יצירת pool חיבורים
const pool = mysql.createPool(dbConfig);

// פונקציה לבדיקת החיבור
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ חיבור ל-MySQL הצליח!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ שגיאה בחיבור ל-MySQL:', error.message);
    return false;
  }
};

// פונקציה לביצוע שאילתות
export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ שגיאה בביצוע שאילתה:', error.message);
    throw error;
  }
};

// פונקציה לביצוע שאילתות עם transaction
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;
