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
     * Sistem durumunu döndür (Start_MEM durumu, okuma aktif/durmuş, vb.)
     */
    this.app.get('/api/system/status', (req, res) => {
      try {
        res.json({
          isRunning: this.plcSystem.isRunning || false,
          startMemState: this.plcSystem.startMemState || false,
          isMainReadingActive: this.plcSystem.isMainReadingActive || false,
          timestamp: new Date().toISOString(),
          description: {
            startMemState: 'Start_MEM tag durumu (TRUE/FALSE)',
            isMainReadingActive: 'Ana 5 tag okuma durumu'
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * POST /api/system/mode
     * DEPRECATED - Sistem Start_MEM tag'ı ile kontrol edilir
     */
    this.app.post('/api/system/mode', async (req, res) => {
      res.json({
        deprecated: true,
        message: 'Mode seçimi artık Start_MEM tag\'ı ile kontrol edilir'
      });
    });

    /**
     * POST /api/system/cycle
     * DEPRECATED - Sistem Start_MEM tag'ı True iken dakikada bir okur
     */
    this.app.post('/api/system/cycle', async (req, res) => {
      res.json({
        deprecated: true,
        message: 'Cycle seçimi artık kullanılmıyor. Start_MEM True iken 1 dakikada bir okuma yapılır'
      });
    });

    // ========================================================================
    // OKUMA İŞLEMLERİ
    // ========================================================================

    /**
     * POST /api/reading/trigger
     * DEPRECATED - Sistem Start_MEM tag'ı ile kontrol edilir
     */
    this.app.post('/api/reading/trigger', async (req, res) => {
      try {
        res.json({
          deprecated: true,
          message: 'Manuel trigger kaldırıldı. Sistem Start_MEM tag\'ı ile kontrol edilir'
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
     * Tüm okuma verilerini database'den döndür
     * Query: ?limit=100 (default), ?tagId=TANK_SICAKLIGI (opsiyonel filtre)
     */
    this.app.get('/api/reading/all', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 100;
        const tagId = req.query.tagId || null;

        let readings = [];

        if (tagId) {
          // Belirli tag'ın verilerini getir
          readings = await this.plcSystem.database.getReadingsByTag(tagId, limit);
        } else {
          // Tüm son okumalar
          readings = await this.plcSystem.database.getLatestReadings(limit);
        }

        res.json({
          data: readings,
          count: readings.length,
          limit,
          tagId: tagId || 'all'
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

    /**
     * GET /api/debug/plc
     * DEBUG: PLC bağlantı durumunu göster (GERÇEK S7-1200)
     */
    this.app.get('/api/debug/plc', (req, res) => {
      try {
        const connectionInfo = this.plcSystem.connection.getConnectionInfo();
        res.json({
          debug: true,
          type: 'REAL_PLC_S7_1200',
          plc: {
            isConnected: connectionInfo.isConnected,
            connectionAttempts: connectionInfo.connectionAttempts,
            maxRetries: this.plcSystem.connection.maxRetries,
            clientType: connectionInfo.clientType,
            host: connectionInfo.host,
            rack: connectionInfo.rack,
            slot: connectionInfo.slot,
            port: connectionInfo.port,
            realPLC: connectionInfo.realPLC
          },
          system: {
            isRunning: this.plcSystem.isRunning,
            startMemState: this.plcSystem.startMemState,
            isMainReadingActive: this.plcSystem.isMainReadingActive
          },
          timestamp: new Date().toISOString(),
          note: '🟢 GERÇEK S7-1200 PLC BAĞLANTISI (Mock Yok)'
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint bulunamadı' });
    });
  }

  start() {
    this.setupMiddleware();
    this.setupRoutes();
    
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
