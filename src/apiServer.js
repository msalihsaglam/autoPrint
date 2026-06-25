// backend/src/apiServer.js
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { Pool } = require('pg'); // 🎯 Docker/PostgreSQL havuzunu bağımsız yönetmek için içeri aldık

class APIServer {
  constructor(plcSystem) {
    this.plcSystem = plcSystem;
    this.app = express();
    this.port = (config && config.server && config.server.port) ? config.server.port : 3001;
    
    // 🎯 DOCKER DB BAĞLANTI HAVUZU: Dış referansların çakışmasını engellemek için lokal havuz oluşturuldu
    this.localPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'plc_readings',
      user: process.env.DB_USER || 'plcuser',
      password: process.env.DB_PASSWORD || 'plcpass123',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.localPool.on('error', (err) => {
      console.error('❌ API Server Lokal DB Pool Hatası:', err.message);
    });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    const app = this.app;
    const system = this.plcSystem;

    // Sistem genel durumunu ön yüze paslar
    app.get('/api/system/status', (req, res) => {
      res.json({
        isRunning: system.isRunning,
        startMemState: system.startMemState,
        isMainReadingActive: system.isMainReadingActive
      });
    });

    // Tag listesi
    app.get('/api/tags', (req, res) => {
      res.json(system.currentPLCTags);
    });

    // En son kaydedilen okumayı döner
    app.get('/api/reading/last', async (req, res) => {
      try {
        const timestamp = new Date().toISOString();
        res.json({
          timestamp: timestamp,
          readingType: system.isMainReadingActive ? 'Periyodik Çevrim Kaydı' : 'Beklemede',
          successCount: system.currentPLCTags.filter(t => t.success).length,
          tags: system.currentPLCTags
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // 🎯 DOĞRUDAN ÜRETİM ÇEVRİMLERİ TABLOSUNU SORGULAYAN YENİ ARŞİV MOTORU
    app.get('/api/reports/history', async (req, res) => {
      try {
        // Yükselen ve düşen kenar anında mühürlenen gerçek çevrim kayıtlarını çekiyoruz
        const result = await this.localPool.query(`
          SELECT id, start_time, end_time, status 
          FROM production_cycles 
          ORDER BY start_time DESC 
          LIMIT 20
        `);
        
        const history = result.rows.map(row => ({
          id: row.id,
          startTime: row.start_time,
          endTime: row.end_time || new Date().toISOString(),
          status: row.status
        }));

        return res.json({ success: true, data: history });

      } catch (err) {
        console.error('❌ Geçmiş arşiv API hatası:', err.message);
        return res.json({ success: false, error: err.message, data: [] });
      }
    });

    // 🎯 GEÇMİŞ BİR RAPORU YENİDEN YAZDIR
    app.post('/api/reports/reprint', async (req, res) => {
      const { startTime, endTime } = req.body;
      if (!startTime || !endTime) {
        return res.status(400).json({ success: false, message: "Başlangıç ve bitiş zamanları zorunludur." });
      }

      try {
        console.log(`🌐 Geçmiş rapor yeniden yazdırma isteği alındı: Aralık [${startTime} - ${endTime}]`);
        
        const originalStartTime = system.currentCycleStartTime;
        system.currentCycleStartTime = new Date(startTime);
        
        // Bu iki tarih parametresi index.js içindeki generateAndPrintReport fonksiyonuna akarak tag_readings'i filtreler
        await system.generateAndPrintReport(new Date(startTime), new Date(endTime));
        
        system.currentCycleStartTime = originalStartTime;
        res.json({ success: true, message: "Geçmiş rapor başarıyla yazıcı kuyruğuna gönderildi." });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // 🟢 FRONTEND MANUEL START ENDPOINT'I (Mühür Desteği ile)
    app.post('/api/system/start-manual', async (req, res) => {
      if (!system.startMemState) {
        console.log('🌐 Frontend üzerinden MANUEL START tetiklendi.');
        system.currentCycleStartTime = new Date();
        
        try {
          // Manuel döngü başlatıldığında da üretim çevrim tablosuna mühür satırını açıyoruz
          const resDb = await this.localPool.query(
            `INSERT INTO production_cycles (start_time, status) VALUES ($1, 'Manuel Aktif') RETURNING id`,
            [system.currentCycleStartTime]
          );
          system.currentCycleDbId = resDb.rows[0].id;
          console.log(`✅ [Manuel Başlangıç] production_cycles Kaydı Açıldı. ID: ${system.currentCycleDbId}`);
        } catch (e) {
          console.error('Manuel start çevrim tablosu yazma hatası:', e.message);
        }

        system.startMainReading();
        system.startMemState = true; 
        return res.json({ success: true, message: "Manuel tarama periyodu başlatıldı." });
      }
      res.status(400).json({ success: false, message: "Sistem zaten aktif çalışıyor." });
    });

    // 🔴 FRONTEND MANUEL STOP VE YAZICI ENDPOINT'I (Mühür Kapatma Desteği ile)
    app.post('/api/system/stop-manual', async (req, res) => {
      if (system.startMemState) {
        console.log('🌐 Frontend üzerinden MANUEL STOP tetiklendi. Çıktı hazırlanıyor...');
        const cycleEndTime = new Date();

        if (system.currentCycleDbId) {
          try {
            // Açık olan manuel çevrim kaydının bitiş zamanını mühürleyip kapatıyoruz
            await this.localPool.query(
              `UPDATE production_cycles SET end_time = $1, status = 'Tamamlandı' WHERE id = $2`,
              [cycleEndTime, system.currentCycleDbId]
            );
            console.log(`🔒 [Manuel Bitiş] production_cycles Kaydı Kapatıldı. ID: ${system.currentCycleDbId}`);
          } catch (e) {
            console.error('Manuel stop çevrim tablosu güncelleme hatası:', e.message);
          }
        }

        await system.stopMainReading();
        system.startMemState = false; 
        return res.json({ success: true, message: "Manuel periyot durduruldu ve çıktı alındı." });
      }
      res.status(400).json({ success: false, message: "Sistem zaten durdurulmuş durumda." });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🌐 API Sunucu http://localhost:${this.port} adresinde aktif.`);
    });
  }
}

// Havuzun sistem kapanırken temiz kapatılması için emniyet adımı
process.on('SIGINT', async () => {
  if (global.localPool) {
    await global.localPool.end();
  }
});

module.exports = APIServer;