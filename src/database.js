// src/database.js
const { Pool } = require('pg');
const config = require('./config');

let pool = null;

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

// 🎯 HATA ENGELLEYİCİ EMRE AMADE GETPOOL:
// Eğer havuz o saniye null ise hemen initialize edip canlı bağlantıyı güvenle döner.
function getPool() {
  if (!pool) {
    return initializePool();
  }
  return pool;
}

async function saveTagReading(reading) {
  try {
    const activePool = getPool();
    if (!activePool) {
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

    const result = await activePool.query(query, values);
    return result.rowCount > 0;
  } catch (error) {
    console.error('❌ Tag okuma yazma hatası:', error.message);
    return false;
  }
}

async function saveTagReadings(readings) {
  try {
    const activePool = getPool();
    if (!activePool) {
      console.warn('⚠️  Database pool bağlı değil');
      return 0;
    }

    const client = await activePool.connect();
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
      console.log(`✓ ${savedCount}/${readings.length} tag okuma veritabanına kaydedildi`);
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

async function getLatestReadings(limit = 100) {
  try {
    const activePool = getPool();
    if (!activePool) return [];
    const query = `SELECT * FROM tag_readings ORDER BY reading_timestamp DESC LIMIT $1`;
    const result = await activePool.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('❌ Okuma getirme hatası:', error.message);
    return [];
  }
}

async function getReadingsByTag(tagId, limit = 100) {
  try {
    const activePool = getPool();
    if (!activePool) return [];
    const query = `SELECT * FROM tag_readings WHERE tag_id = $1 ORDER BY reading_timestamp DESC LIMIT $2`;
    const result = await activePool.query(query, [tagId, limit]);
    return result.rows;
  } catch (error) {
    console.error('❌ Tag okuma getirme hatası:', error.message);
    return [];
  }
}

async function getReadingsByDateRange(startDate, endDate) {
  try {
    const activePool = getPool();
    if (!activePool) return [];
    const query = `SELECT * FROM tag_readings WHERE reading_timestamp BETWEEN $1 AND $2 ORDER BY reading_timestamp DESC`;
    const result = await activePool.query(query, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    console.error('❌ Tarih aralığı okuma hatası:', error.message);
    return [];
  }
}

async function logSystemEvent(level, message, details = {}) {
  try {
    const activePool = getPool();
    if (!activePool) return;
    const query = `INSERT INTO system_logs (level, message, details) VALUES ($1, $2, $3)`;
    await activePool.query(query, [level, message, JSON.stringify(details)]);
  } catch (error) {
    console.error('❌ Log yazma hatası:', error.message);
  }
}

async function testConnection() {
  try {
    const activePool = getPool();
    if (!activePool) return false;
    const result = await activePool.query('SELECT NOW()');
    console.log('✓ Database bağlantısı başarılı:', result.rows[0]);
    
    console.log('🛠️ Üretim Çevrim tablosu kontrol ediliyor...');
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS production_cycles (
        id SERIAL PRIMARY KEY,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Aktif'
      );
    `);
    console.log('✓ Üretim takip tablosu (production_cycles) aktif ve hazır.');
    
    return true;
  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error.message);
    return false;
  }
}

async function checkLicenseExpiry() {
  const cfg = require('./config');
  const maxDays = cfg.license.maxDays;
  try {
    const activePool = getPool();
    if (!activePool) return { isExpired: false };

    const result = await activePool.query(`
      SELECT MIN(start_time) AS first_cycle, MAX(start_time) AS last_cycle
      FROM production_cycles
      WHERE start_time IS NOT NULL
    `);

    const { first_cycle, last_cycle } = result.rows[0];
    if (!first_cycle || !last_cycle) return { isExpired: false };

    const firstDate = new Date(first_cycle);
    const lastDate  = new Date(last_cycle);
    const daysDiff  = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24));

    return { isExpired: daysDiff > maxDays, firstDate, lastDate, daysDiff, maxDays };
  } catch (error) {

    return { isExpired: false };
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✓ Database pool kapatıldı');
  }
}

module.exports = {
  initializePool,
  getPool, // Fonksiyon referansı dışarıya verildi
  saveTagReading,
  saveTagReadings,
  getLatestReadings,
  getReadingsByTag,
  getReadingsByDateRange,
  logSystemEvent,
  testConnection,
  checkLicenseExpiry,
  closePool
};