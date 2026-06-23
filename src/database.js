const { Pool } = require('pg');
const config = require('./config');

let pool = null;

/**
 * Database connection pool oluştur
 */
function initializePool() {
  if (pool) return pool;

  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'plc_readings',
    user: process.env.DB_USER || 'plcuser',
    password: process.env.DB_PASSWORD || 'plcpass123',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('❌ Beklenmeyen hata DB pool:', err);
  });

  console.log('✓ Database pool oluşturuldu');
  return pool;
}

/**
 * Tag okuma verisini database'ye yaz
 * @param {Object} reading - Tag reading data
 * @returns {Promise<boolean>}
 */
async function saveTagReading(reading) {
  try {
    if (!pool) {
      console.warn('⚠️  Database pool bağlı değil');
      return false;
    }

    const query = `
      INSERT INTO tag_readings 
      (tag_id, tag_name, tag_type, tag_unit, value, success, error_message, reading_timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      reading.id,
      reading.name,
      reading.type || 'unknown',
      reading.unit || '',
      reading.value || 0,
      reading.success !== false,
      reading.error || null,
      reading.timestamp || new Date()
    ];

    const result = await pool.query(query, values);
    return result.rowCount > 0;
  } catch (error) {
    console.error('❌ Tag okuma yazma hatası:', error.message);
    return false;
  }
}

/**
 * Birden fazla tag okuma verisini database'ye yaz
 * @param {Array} readings - Array of reading data
 * @returns {Promise<number>} - Yazılan satır sayısı
 */
async function saveTagReadings(readings) {
  try {
    if (!pool) {
      console.warn('⚠️  Database pool bağlı değil');
      return 0;
    }

    const client = await pool.connect();
    let savedCount = 0;

    try {
      await client.query('BEGIN');

      for (const reading of readings) {
        const query = `
          INSERT INTO tag_readings 
          (tag_id, tag_name, tag_type, tag_unit, value, success, error_message, reading_timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        const values = [
          reading.id,
          reading.name,
          reading.type || 'unknown',
          reading.unit || '',
          reading.value !== undefined ? reading.value : 0,
          reading.success !== false,
          reading.error || null,
          reading.timestamp || new Date()
        ];

        const result = await client.query(query, values);
        if (result.rowCount > 0) savedCount++;
      }

      await client.query('COMMIT');
      console.log(`✓ ${savedCount}/${readings.length} tag okuma kaydedildi`);
      return savedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Batch tag okuma yazma hatası:', error.message);
    return 0;
  }
}

/**
 * Son N okumayı getir
 * @param {number} limit - Kaç okuma döndüreceği
 * @returns {Promise<Array>}
 */
async function getLatestReadings(limit = 100) {
  try {
    if (!pool) return [];

    const query = `
      SELECT * FROM tag_readings 
      ORDER BY reading_timestamp DESC 
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('❌ Okuma getirme hatası:', error.message);
    return [];
  }
}

/**
 * Belirli tag'ın okumalarını getir
 * @param {string} tagId - Tag ID
 * @param {number} limit - Kaç okuma döndüreceği
 * @returns {Promise<Array>}
 */
async function getReadingsByTag(tagId, limit = 100) {
  try {
    if (!pool) return [];

    const query = `
      SELECT * FROM tag_readings 
      WHERE tag_id = $1
      ORDER BY reading_timestamp DESC 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [tagId, limit]);
    return result.rows;
  } catch (error) {
    console.error('❌ Tag okuma getirme hatası:', error.message);
    return [];
  }
}

/**
 * Tarih aralığında okumalar getir
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Date} endDate - Bitiş tarihi
 * @returns {Promise<Array>}
 */
async function getReadingsByDateRange(startDate, endDate) {
  try {
    if (!pool) return [];

    const query = `
      SELECT * FROM tag_readings 
      WHERE reading_timestamp BETWEEN $1 AND $2
      ORDER BY reading_timestamp DESC
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    console.error('❌ Tarih aralığı okuma hatası:', error.message);
    return [];
  }
}

/**
 * System log yazma
 * @param {string} level - Log level (INFO, WARNING, ERROR)
 * @param {string} message - Log mesajı
 * @param {Object} details - Detaylı bilgi
 */
async function logSystemEvent(level, message, details = {}) {
  try {
    if (!pool) return;

    const query = `
      INSERT INTO system_logs (level, message, details)
      VALUES ($1, $2, $3)
    `;

    await pool.query(query, [level, message, JSON.stringify(details)]);
  } catch (error) {
    console.error('❌ Log yazma hatası:', error.message);
  }
}

/**
 * Database connection'u test et
 */
async function testConnection() {
  try {
    if (!pool) {
      console.log('⚠️  Pool henüz oluşturulmadı');
      return false;
    }

    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database bağlantısı başarılı:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error.message);
    return false;
  }
}

/**
 * Connection pool'u kapat
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✓ Database pool kapatıldı');
  }
}

module.exports = {
  initializePool,
  getPool: () => pool,
  saveTagReading,
  saveTagReadings,
  getLatestReadings,
  getReadingsByTag,
  getReadingsByDateRange,
  logSystemEvent,
  testConnection,
  closePool
};
