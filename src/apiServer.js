const express = require('express');
const cors = require('cors');
const { getAllTags } = require('./tags');

class APIServer {
  constructor(plcSystem) {
    this.app = express();
    this.plcSystem = plcSystem;
    this.port = process.env.API_PORT || 3001;
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // ========================================================================
    // TAG'LAR
    // ========================================================================
    
    /**
     * GET /api/tags
     * Tüm tag'ları döndür
     */
    this.app.get('/api/tags', (req, res) => {
      try {
        const tags = getAllTags();
        res.json(tags);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ========================================================================
    // SİSTEM DURUMU
    // ========================================================================

    /**
     * GET /api/system/status
     * Sistem durumunu döndür (mod, aktif cycle, vb.)
     */
    this.app.get('/api/system/status', (req, res) => {
      try {
        res.json({
          mode: this.plcSystem.mode || 'manual',
          cycle: this.plcSystem.cycle || 'EVERY_24_HOURS',
          isRunning: this.plcSystem.isRunning || false,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * POST /api/system/mode
     * Sistem modunu değiştir (otomatik/manuel)
     * Body: { mode: 'auto' | 'manual' }
     */
    this.app.post('/api/system/mode', async (req, res) => {
      try {
        const { mode } = req.body;

        if (!['auto', 'manual'].includes(mode)) {
          return res.status(400).json({ error: 'Geçersiz mod: auto veya manual olmalı' });
        }

        this.plcSystem.mode = mode;
        console.log(`✓ Sistem modu değiştirildi: ${mode}`);

        res.json({
          success: true,
          mode: this.plcSystem.mode,
          message: `Mod ${mode === 'auto' ? 'Otomatik' : 'Manuel'} olarak ayarlandı`
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * POST /api/system/cycle
     * Okuma cycle'ını değiştir (otomatik mod için)
     * Body: { cycle: 'EVERY_24_HOURS' | 'EVERY_3_HOURS' | ... }
     */
    this.app.post('/api/system/cycle', async (req, res) => {
      try {
        const { cycle } = req.body;

        const validCycles = [
          'EVERY_24_HOURS',
          'EVERY_3_HOURS',
          'EVERY_HOUR',
          'EVERY_30_MINUTES',
          'DAILY_AT_14_00'
        ];

        if (!validCycles.includes(cycle)) {
          return res.status(400).json({ error: 'Geçersiz cycle' });
        }

        this.plcSystem.cycle = cycle;
        console.log(`✓ Okuma cycle'ı değiştirildi: ${cycle}`);

        res.json({
          success: true,
          cycle: this.plcSystem.cycle,
          message: `Cycle ${cycle} olarak ayarlandı`
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ========================================================================
    // OKUMA İŞLEMLERİ
    // ========================================================================

    /**
     * POST /api/reading/trigger
     * Manuel trigger - Hemen tag'ları oku
     */
    this.app.post('/api/reading/trigger', async (req, res) => {
      try {
        if (!this.plcSystem || !this.plcSystem.performTagReading) {
          return res.status(500).json({ error: 'PLC Sistemi hazırlanmadı' });
        }

        const readingResult = await this.plcSystem.performTagReading('API Trigger');
        
        res.json({
          success: true,
          data: readingResult,
          message: 'Okuma başarıyla tamamlandı'
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    /**
     * GET /api/reading/last
     * Son okuma verilerini döndür
     */
    this.app.get('/api/reading/last', (req, res) => {
      try {
        const readingData = this.plcSystem.getReadingData?.() || [];
        const lastReading = readingData[readingData.length - 1] || null;

        res.json(lastReading || {
          tags: [],
          timestamp: new Date().toISOString(),
          readingType: 'Veri Yok',
          successCount: 0,
          failureCount: 0
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * GET /api/reading/all
     * Tüm okuma verilerini döndür (sayfa numarası ile)
     * Query: ?page=1&limit=10
     */
    this.app.get('/api/reading/all', (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const readingData = this.plcSystem.getReadingData?.() || [];
        const start = (page - 1) * limit;
        const end = start + limit;

        const paginated = readingData.slice(start, end).reverse();

        res.json({
          data: paginated,
          total: readingData.length,
          page,
          limit,
          pages: Math.ceil(readingData.length / limit)
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * GET /api/reading/by-type/:type
     * Belirli okuma türünün verilerini döndür
     */
    this.app.get('/api/reading/by-type/:type', (req, res) => {
      try {
        const { type } = req.params;
        const readingData = this.plcSystem.getReadingsByType?.(type) || [];

        res.json({
          type,
          data: readingData.reverse(),
          count: readingData.length
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ========================================================================
    // HEALTH CHECK
    // ========================================================================

    /**
     * GET /api/health
     * API durumunu kontrol et
     */
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint bulunamadı' });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`\n✓ API Sunucusu başlatıldı: http://localhost:${this.port}`);
      console.log(`  📡 Endpoint'ler:`);
      console.log(`     GET  /api/health - Health check`);
      console.log(`     GET  /api/tags - Tüm tag'ları getir`);
      console.log(`     GET  /api/system/status - Sistem durumu`);
      console.log(`     POST /api/system/mode - Modu değiştir`);
      console.log(`     POST /api/system/cycle - Cycle'ı değiştir`);
      console.log(`     POST /api/reading/trigger - Manuel okuma`);
      console.log(`     GET  /api/reading/last - Son okuma`);
      console.log(`     GET  /api/reading/all - Tüm okumalar`);
      console.log(`     GET  /api/reading/by-type/:type - Türe göre okuma\n`);
    });
  }
}

module.exports = APIServer;
