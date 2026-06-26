// backend/src/index.js
const PLCConnection = require('./plcConnection');
const TagReader = require('./tagReader');
const Scheduler = require('./scheduler');
const APIServer = require('./apiServer');
const config = require('./config');
const database = require('./database');
const { initializePool, testConnection, saveTagReadings, getPool } = database;

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ptp = require('pdf-to-printer'); 

const READING_INTERVALS = {
  START_MEM_CHECK: 20 * 1000,       
  MAIN_TAGS_READ: 60 * 1000,        
};

class PLCSystem {
  constructor() {
    this.connection = new PLCConnection();
    this.tagReader = new TagReader(this.connection);
    this.scheduler = new Scheduler(this.tagReader);
    this.apiServer = null;
    this.database = database;
    
    this.isRunning = false;
    this.readingData = [];
    
    this.startMemState = false;        
    this.isMainReadingActive = false;  
    this.mainReadingIntervalId = null; 
    this.currentPLCTags = []; 
    this.currentCycleStartTime = null; 
    this.currentCycleDbId = null; 
  }

  async start() {
    try {
      console.log('🚀 PLC Veri Okuma Sistemi başlatılıyor...');
      initializePool();
      await testConnection();

      // API sunucusunu hemen başlat (PLC bağlantısından bağımsız)
      this.startAPIServer();

      console.log('🔌 S7-1200 PLC bağlantısı kuruluyor...');
      try {
        await this.connection.connect();
        this.isRunning = true;
        this.initClientItems();
        this.setupReadingTasks();
      } catch (error) {
        console.error('❌ İlk PLC bağlantısı başarısız:', error.message);
        this.connection.startAutoReconnect(() => this.onPLCReconnected());
      }
    } catch (error) {
      console.error('❌ Hata:', error.message);
      this.stop();
    }
  }

  onPLCReconnected() {
    this.isRunning = true;
    this.initClientItems();
    // Scheduler görevi yoksa ekle (ilk bağlantıda eklenmemiş olabilir)
    if (!this.scheduler.intervals.has('db2-block-monitor')) {
      this.setupReadingTasks();
    }
  }

  initClientItems() {
    const client = this.connection.getClient();
    client.addItems(['START_MEM', 'TANK_SICAKLIGI', 'TANK_BASINCI', 'TANK_SIVI_SEVIYESI', 'ILETKENLIK_DEGERI', 'WFI_SICAKLIGI']);

    client.setTranslationCB((tag) => {
      const addressMap = {
        'START_MEM': 'DB2,X0.0',
        'TANK_SICAKLIGI': 'DB2,REAL2',
        'TANK_BASINCI': 'DB2,REAL6',
        'TANK_SIVI_SEVIYESI': 'DB2,INT10',
        'ILETKENLIK_DEGERI': 'DB2,REAL12',
        'WFI_SICAKLIGI': 'DB2,INT16'
      };
      return addressMap[tag];
    });
  }

  startAPIServer() {
    this.apiServer = new APIServer(this);
    this.apiServer.start();
  }

  setupReadingTasks() {
    this.scheduler.addPeriodicTask('db2-block-monitor', () => this.scanPLCDataBlock(), READING_INTERVALS.START_MEM_CHECK);
  }

  async scanPLCDataBlock() {
    if (!this.connection.isConnected) {
      if (!this.connection.isReconnecting) {
        console.log('🔴 PLC bağlantısı yok. Yeniden bağlanma başlatılıyor...');
        this.connection.startAutoReconnect(() => this.onPLCReconnected());
      }
      return;
    }
    const client = this.connection.getClient();

    client.readAllItems(async (err, values) => {
      if (err) {
        console.error('❌ PLC okuma hatası:', err.message);
        this.connection.isConnected = false;
        if (!this.connection.isReconnecting) {
          console.log('🔴 Bağlantı koptu. Yeniden bağlanma başlatılıyor...');
          this.connection.startAutoReconnect(() => this.onPLCReconnected());
        }
        return;
      }

      try {
        const plcPayload = this.tagReader.processPLCVals(values);
        const currentM05 = plcPayload.startMem;
        this.currentPLCTags = plcPayload.tags; 

        // 🎯 1. YÜKSELEN KENAR: START_MEM TRUE OLDUĞUNDA
        if (currentM05 && !this.startMemState) {
          console.log('📈 [YÜKSELEN KENAR DETECTED] Çevrim Başlatılıyor...');
          this.currentCycleStartTime = new Date();
          
          try {
            // 🛠️ HATA DÜZELTMESİ: Orijinal getPool() fonksiyonu çağrılıyor
            const activePool = getPool();
            if (activePool) {
              const res = await activePool.query(
                `INSERT INTO production_cycles (start_time, status) VALUES ($1, 'Aktif') RETURNING id`,
                [this.currentCycleStartTime]
              );
              this.currentCycleDbId = res.rows[0].id;
              console.log(`✅ production_cycles tablosuna yeni çevrim eklendi. Satır ID: ${this.currentCycleDbId}`);
            }
          } catch (dbErr) {
            console.error('❌ production_cycles tablosuna başlama kaydı atılamadı:', dbErr.message);
          }

          this.startMainReading();
        } 
        
        // 🎯 2. DÜŞEN KENAR: START_MEM FALSE OLDUĞU AN
        else if (!currentM05 && this.startMemState) {
          console.log('📉 [DÜŞEN KENAR DETECTED] Çevrim Kapatılıyor...');
          const cycleEndTime = new Date();
          
          if (this.currentCycleDbId) {
            try {
              // 🛠️ HATA DÜZELTMESİ: Orijinal getPool() fonksiyonu çağrılıyor
              const activePool = getPool();
              if (activePool) {
                await activePool.query(
                  `UPDATE production_cycles SET end_time = $1, status = 'Tamamlandı' WHERE id = $2`,
                  [cycleEndTime, this.currentCycleDbId]
                );
                console.log(`🔒 production_cycles tablosundaki Çevrim (#${this.currentCycleDbId}) başarıyla mühürlendi.`);
              }
            } catch (dbErr) {
              console.error('❌ production_cycles tablosu end_time güncellenemedi:', dbErr.message);
            }
          }

          await this.stopMainReading();
        }

        this.startMemState = currentM05;
      } catch (parseError) {
        console.error('❌ Veri işleme hatası:', parseError.message);
      }
    });
  }

  startMainReading() {
    if (this.isMainReadingActive) return;
    this.isMainReadingActive = true;
    this.performMainTagsReading('İlk Tetikleme Çıktısı');
    this.mainReadingIntervalId = setInterval(() => {
      if (this.isMainReadingActive) this.performMainTagsReading('Periyodik Çevrim Kaydı');
    }, READING_INTERVALS.MAIN_TAGS_READ);
  }

  async stopMainReading() {
    if (!this.isMainReadingActive) return;
    this.isMainReadingActive = false;
    if (this.mainReadingIntervalId) {
      clearInterval(this.mainReadingIntervalId);
      this.mainReadingIntervalId = null;
    }
    await this.generateAndPrintReport();
  }

  async performMainTagsReading(readingType) {
    try {
      if (this.currentPLCTags.length === 0) return;
      await saveTagReadings(this.currentPLCTags);
    } catch (error) {
      console.error('❌ DB tag yazma hatası:', error.message);
    }
  }

  async generateAndPrintReport(forcedStart = null, forcedEnd = null) {
    try {
      // 🛠️ HATA DÜZELTMESİ: Orijinal getPool() entegrasyonu
      const activePool = getPool();
      if (!activePool) return;

      let result;
      const startTimeFilter = forcedStart || this.currentCycleStartTime || new Date(Date.now() - 60 * 60 * 1000);
      const endTimeFilter = forcedEnd || new Date();

      const queryText = `
        SELECT reading_timestamp, tag_id, value 
        FROM tag_readings 
        WHERE reading_timestamp >= $1 AND reading_timestamp <= $2 AND tag_id != 'START_MEM'
        ORDER BY reading_timestamp ASC
      `;
      result = await activePool.query(queryText, [startTimeFilter, endTimeFilter]);

      if (!result || !result.rows || result.rows.length === 0) {
        console.log('⚠️ Belirtilen zaman aralığında basılacak veri bulunamadı.');
        return;
      }

      const rowsByTime = {};
      result.rows.forEach(row => {
        const dateObj = new Date(row.reading_timestamp);
        const dateStr = dateObj.toLocaleDateString('tr-TR');
        const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const timeGroupKey = `${dateStr} ${timeStr}`;
        
        if (!rowsByTime[timeGroupKey]) {
          rowsByTime[timeGroupKey] = { time: timeGroupKey, rawTime: dateObj.getTime(), TANK_SICAKLIGI: '-', TANK_BASINCI: '-', TANK_SIVI_SEVIYESI: '-', ILETKENLIK_DEGERI: '-', WFI_SICAKLIGI: '-' };
        }
        
        let val = parseFloat(row.value);
        if (row.tag_id === 'TANK_SIVI_SEVIYESI' || row.tag_id === 'WFI_SICAKLIGI') {
          rowsByTime[timeGroupKey][row.tag_id] = isNaN(val) ? '-' : parseInt(val);
        } else {
          rowsByTime[timeGroupKey][row.tag_id] = isNaN(val) ? '-' : val.toFixed(2);
        }
      });

      const tableRows = Object.values(rowsByTime).sort((a, b) => a.rawTime - b.rawTime);

      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const outputsDir = path.join(__dirname, 'outputs');
      if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);

      const filePath = path.join(outputsDir, `Rapor_${Date.now()}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827');
      doc.text('PROSES VERI KAYIT RAPORU (DATA LOGGER)', { align: 'center' });
      doc.moveDown(1);

      const startX = 30;
      const colX = { time: startX, temp: startX + 105, press: startX + 191, level: startX + 277, cond: startX + 363, wfi: startX + 449 };
      let currentY = doc.y;

      doc.rect(startX, currentY, 535, 22).fill('#2563eb'); 
      doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
      doc.text('KAYIT ZAMANI', colX.time + 5, currentY + 7);
      doc.text('TANK SICAKLIK', colX.temp + 5, currentY + 7);
      doc.text('TANK BASINC', colX.press + 5, currentY + 7);
      doc.text('SIVI SEVIYESI', colX.level + 5, currentY + 7);
      doc.text('ILETKENLIK', colX.cond + 5, currentY + 7);
      doc.text('WFI SICAKLIK', colX.wfi + 5, currentY + 7);
      currentY += 22;

      doc.fillColor('#111827').font('Helvetica').fontSize(8.5);
      tableRows.forEach((row, index) => {
        if (currentY > 780) {
          doc.addPage();
          currentY = 30;
          doc.rect(startX, currentY, 535, 22).fill('#2563eb');
          doc.fillColor('#ffffff').font('Helvetica-Bold');
          doc.text('KAYIT ZAMANI', colX.time + 5, currentY + 7);
          currentY += 22;
          doc.fillColor('#111827').font('Helvetica');
        }

        if (index % 2 === 1) doc.rect(startX, currentY, 535, 18).fill('#f9fafb');
        doc.fillColor('#111827');
        doc.text(String(row.time), colX.time + 5, currentY + 5);
        doc.text(String(row.TANK_SICAKLIGI), colX.temp + 5, currentY + 5);
        doc.text(String(row.TANK_BASINCI), colX.press + 5, currentY + 5);
        doc.text(String(row.TANK_SIVI_SEVIYESI), colX.level + 5, currentY + 5);
        doc.text(String(row.ILETKENLIK_DEGERI), colX.cond + 5, currentY + 5);
        doc.text(String(row.WFI_SICAKLIGI), colX.wfi + 5, currentY + 5);

        doc.moveTo(startX, currentY + 18).lineTo(startX + 535, currentY + 18).stroke('#e5e7eb');
        currentY += 18; 
      });

      doc.end();
      writeStream.on('finish', async () => {
        try { await ptp.print(filePath); } catch (e) { console.error('Yazıcı hatası:', e.message); }
      });
    } catch (err) {
      console.error('Rapor basım hatası:', err.message);
    }
  }

  async stop() {
    if (this.isRunning) {
      if (this.mainReadingIntervalId) clearInterval(this.mainReadingIntervalId);
      this.scheduler.clearAll();
      this.connection.disconnect();
      this.isRunning = false;
      await require('./database').closePool();
    }
    process.exit(0);
  }
}

const system = new PLCSystem();
process.on('SIGINT', () => system.stop());
system.start().catch(console.error);

module.exports = PLCSystem;