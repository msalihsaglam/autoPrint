// src/standalone.js
// Standalone mod: Docker / PostgreSQL gerektirmez.
// Backend + Frontend tek bir EXE olarak çalışır.

// ─── pkg TextDecoder Polyfill ────────────────────────────────────────────────
// pkg'in gömülü Node.js 18.5.0 'ascii' / 'latin1' encoding'lerini desteklemiyor.
// fontkit (pdfkit bağımlılığı) bu encoding'leri kullandığından kendi implementasyonumuzu sağlıyoruz.
;(function patchTextDecoder() {
  if (typeof TextDecoder === 'undefined') return;
  const NativeDecoder = global.TextDecoder;

  function fallbackDecode(buffer) {
    if (!buffer) return '';
    let bytes;
    if (buffer instanceof Uint8Array) bytes = buffer;
    else if (ArrayBuffer.isView(buffer)) bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    else if (buffer instanceof ArrayBuffer) bytes = new Uint8Array(buffer);
    else bytes = new Uint8Array(buffer);
    let out = '';
    for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i] & 0xFF);
    return out;
  }

  const UNSUPPORTED = new Set(['ascii', 'latin1', 'binary', 'iso-8859-1', 'iso8859-1', 'windows-1252']);

  global.TextDecoder = function PatchedTextDecoder(label, options) {
    label = (label || 'utf-8').toLowerCase().trim();
    if (UNSUPPORTED.has(label)) {
      // Doğrudan bir nesne döndür — NativeDecoder'a bağımlı değil
      return { encoding: label, fatal: false, ignoreBOM: false, decode: fallbackDecode };
    }
    return new NativeDecoder(label, options);
  };
}());
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const PLCConnection = require('./plcConnection');
const TagReader = require('./tagReader');
const Scheduler = require('./scheduler');
const APIServer = require('./apiServer');
const config = require('./config');
const database = require('./database');
const { initializePool, testConnection, saveTagReadings, getPool, checkLicenseExpiry } = database;

const fs = require('fs');
const path = require('path');

// ─── pkg pdfkit AFM Patch ────────────────────────────────────────────────────
// pkg, dinamik path ile yüklenen pdfkit AFM font dosyalarını snapshot'a
// doğru eşleyemiyor. EXE yanındaki pdfkit-data/ klasörüne yönlendiriyoruz.
if (process.pkg) {
  const _origReadFileSync = fs.readFileSync;
  const _origReadFile     = fs.readFile;
  const pdfkitDataDir     = path.join(path.dirname(process.execPath), 'pdfkit-data');

  fs.readFileSync = function (filePath, options) {
    if (typeof filePath === 'string' && filePath.endsWith('.afm')) {
      return _origReadFileSync(path.join(pdfkitDataDir, path.basename(filePath)), options);
    }
    return _origReadFileSync.apply(this, arguments);
  };

  fs.readFile = function (filePath, options, cb) {
    if (typeof filePath === 'string' && filePath.endsWith('.afm')) {
      return _origReadFile(path.join(pdfkitDataDir, path.basename(filePath)), options, cb);
    }
    return _origReadFile.apply(this, arguments);
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const PDFDocument = require('pdfkit');
const { spawn }   = require('child_process');
const { getPrinterName } = require('./printerConfig');

// ─── pkg SumatraPDF Yazıcı Fonksiyonu ────────────────────────────────────────
// pkg ile paketlendiğinde SumatraPDF snapshot'tan spawn edilemez.
// EXE yanındaki sumatra/ klasöründen çalıştırıyoruz.
function printFile(pdfPath) {
  return new Promise((resolve, reject) => {
    const printerName = getPrinterName();
    let sumatraExe;

    if (process.pkg) {
      // EXE yanındaki sumatra/ klasöründe .exe dosyasını bul
      const sumatraDir = path.join(path.dirname(process.execPath), 'sumatra');
      try {
        const exeFiles = fs.readdirSync(sumatraDir).filter(f => f.toLowerCase().endsWith('.exe'));
        if (exeFiles.length === 0) {
          return reject(new Error(`sumatra/ klasöründe .exe bulunamadı: ${sumatraDir}`));
        }
        sumatraExe = path.join(sumatraDir, exeFiles[0]);
      } catch (e) {
        return reject(new Error(`sumatra/ klasörü okunamadı: ${e.message}`));
      }

      const printArgs = printerName
        ? ['-print-to', printerName, '-silent', pdfPath]
        : ['-print-to-default', '-silent', pdfPath];

      const child = spawn(sumatraExe, printArgs, { detached: true });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0 || code === null) resolve();
        else reject(new Error(`SumatraPDF çıkış kodu: ${code}`));
      });
      return;
    }

    // Normal Node.js modunda pdf-to-printer'ı kullan
    try {
      const ptp = require('pdf-to-printer');
      return ptp.print(pdfPath, printerName ? { printer: printerName } : undefined).then(resolve).catch(reject);
    } catch (e) {
      return reject(new Error('pdf-to-printer yüklenemedi: ' + e.message));
    }
  });
}
// ─────────────────────────────────────────────────────────────────────────────

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
    console.log('🚀 AutoPrint Standalone başlatılıyor...');

    // 1. API sunucusu hemen başlatılır (PLC/DB olmasa da frontend erişilebilir olur)
    this.startAPIServer();

    // 2. Veritabanı bağlantısı opsiyonel - başarısız olsa bile devam et
    try {
      initializePool();
      const dbOk = await testConnection();
      if (dbOk) {
        console.log('✅ Veritabanı bağlantısı başarılı.');
      } else {
        console.warn('⚠️  Veritabanı bağlantısı kurulamadı - DB olmadan devam ediliyor.');
      }
    } catch (error) {
      console.warn('⚠️  Veritabanı hatası:', error.message, '- DB olmadan devam ediliyor.');
    }

    // 3. PLC bağlantısı opsiyonel - başarısız olsa bile API sunucusu çalışmaya devam eder
    const preCheck = this.buildPreCheck();
    const canConnect = await preCheck();
    if (!canConnect) return;

    try {
      console.log('🔌 S7-1200 PLC bağlantısı kuruluyor...');
      await this.connection.connect();
      this.isRunning = true;
      this.initClientItems();
      this.setupReadingTasks();
      console.log('✅ PLC bağlantısı başarılı. Okuma görevleri başlatıldı.');
    } catch (error) {
      console.warn('⚠️  İlk PLC bağlantısı başarısız:', error.message);
      this.connection.startAutoReconnect(() => this.onPLCReconnected(), this.buildPreCheck());
    }
  }

  buildPreCheck() {
    return async () => {
      try {
        const result = await checkLicenseExpiry();
        if (result.isExpired) {
          return false;
        }
        return true;
      } catch (e) {
        return true;
      }
    };
  }

  onPLCReconnected() {
    this.isRunning = true;
    this.initClientItems();
    if (!this.scheduler.intervals.has('db2-block-monitor')) {
      this.setupReadingTasks();
    }
  }

  initClientItems() {
    const client = this.connection.getClient();
    client.addItems(['START_MEM', 'TANK_SICAKLIGI', 'TANK_BASINCI', 'TANK_SIVI_SEVIYESI', 'ILETKENLIK_DEGERI']);

    client.setTranslationCB((tag) => {
      const addressMap = {
        'START_MEM': 'DB2,X0.0',
        'TANK_SICAKLIGI': 'DB2,REAL2',
        'TANK_BASINCI': 'DB2,REAL6',
        'TANK_SIVI_SEVIYESI': 'DB2,INT10',
          'ILETKENLIK_DEGERI': 'DB2,REAL12'
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

        if (currentM05 && !this.startMemState) {
          console.log('📈 [YÜKSELEN KENAR] Çevrim Başlatılıyor...');
          this.currentCycleStartTime = new Date();

          try {
            const activePool = getPool();
            if (activePool) {
              const res = await activePool.query(
                `INSERT INTO production_cycles (start_time, status) VALUES ($1, 'Aktif') RETURNING id`,
                [this.currentCycleStartTime]
              );
              this.currentCycleDbId = res.rows[0].id;
              console.log(`✅ production_cycles kaydı açıldı. ID: ${this.currentCycleDbId}`);
            }
          } catch (dbErr) {
            console.error('❌ production_cycles yazma hatası:', dbErr.message);
          }

          this.startMainReading();
        } else if (!currentM05 && this.startMemState) {
          console.log('📉 [DÜŞEN KENAR] Çevrim Kapatılıyor...');
          const cycleEndTime = new Date();

          if (this.currentCycleDbId) {
            try {
              const activePool = getPool();
              if (activePool) {
                await activePool.query(
                  `UPDATE production_cycles SET end_time = $1, status = 'Tamamlandı' WHERE id = $2`,
                  [cycleEndTime, this.currentCycleDbId]
                );
                console.log(`🔒 Çevrim (#${this.currentCycleDbId}) mühürlendi.`);
              }
            } catch (dbErr) {
              console.error('❌ production_cycles güncelleme hatası:', dbErr.message);
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
    this.performMainTagsReading('İlk Tetikleme');
    this.mainReadingIntervalId = setInterval(() => {
      if (this.isMainReadingActive) this.performMainTagsReading('Periyodik Okuma');
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
      const activePool = getPool();
      if (!activePool) {
        console.warn('⚠️  DB bağlantısı yok, rapor oluşturulamıyor.');
        return;
      }

      const startTimeFilter = forcedStart || this.currentCycleStartTime || new Date(Date.now() - 60 * 60 * 1000);
      const endTimeFilter = forcedEnd || new Date();

      const queryText = `
        SELECT reading_timestamp, tag_id, value 
        FROM tag_readings 
        WHERE reading_timestamp >= $1 AND reading_timestamp <= $2 AND tag_id != 'START_MEM'
        ORDER BY reading_timestamp ASC
      `;
      const result = await activePool.query(queryText, [startTimeFilter, endTimeFilter]);

      if (!result || !result.rows || result.rows.length === 0) {
        console.log('⚠️  Basılacak veri bulunamadı.');
        return;
      }

      const rowsByTime = {};
      result.rows.forEach(row => {
        const dateObj = new Date(row.reading_timestamp);
        const dateStr = dateObj.toLocaleDateString('tr-TR');
        const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const timeGroupKey = `${dateStr} ${timeStr}`;

        if (!rowsByTime[timeGroupKey]) {
          rowsByTime[timeGroupKey] = { time: timeGroupKey, rawTime: dateObj.getTime(), TANK_SICAKLIGI: '-', TANK_BASINCI: '-', TANK_SIVI_SEVIYESI: '-', ILETKENLIK_DEGERI: '-' };
        }

        let val = parseFloat(row.value);
        if (row.tag_id === 'TANK_SIVI_SEVIYESI') {
          rowsByTime[timeGroupKey][row.tag_id] = isNaN(val) ? '-' : parseInt(val);
        } else {
          rowsByTime[timeGroupKey][row.tag_id] = isNaN(val) ? '-' : val.toFixed(2);
        }
      });

      const tableRows = Object.values(rowsByTime).sort((a, b) => a.rawTime - b.rawTime);

      const doc = new PDFDocument({ size: 'A4', margin: 30 });

      // pkg ile paketlendiğinde outputs klasörü exe'nin yanında oluşturulur
      const outputsDir = process.pkg
        ? path.join(path.dirname(process.execPath), 'outputs')
        : path.join(__dirname, 'outputs');

      if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

      const filePath = path.join(outputsDir, `Rapor_${Date.now()}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827');
      doc.text('PROSES VERİ KAYIT RAPORU (DATA LOGGER)', { align: 'center' });
      doc.moveDown(1);

      const startX = 30;
      const colX = { time: startX, temp: startX + 105, press: startX + 212, level: startX + 319, cond: startX + 427 };
      let currentY = doc.y;

      doc.rect(startX, currentY, 535, 22).fill('#2563eb');
      doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
      doc.text('KAYIT ZAMANI', colX.time + 5, currentY + 7);
      doc.text('TANK SICAKLIK', colX.temp + 5, currentY + 7);
      doc.text('TANK BASINÇ', colX.press + 5, currentY + 7);
      doc.text('SIVI SEVİYESİ', colX.level + 5, currentY + 7);
      doc.text('İLETKENLİK', colX.cond + 5, currentY + 7);
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

        doc.moveTo(startX, currentY + 18).lineTo(startX + 535, currentY + 18).stroke('#e5e7eb');
        currentY += 18;
      });

      doc.end();
      writeStream.on('finish', async () => {
        try {
          await printFile(filePath);
          console.log('🖨️  Rapor yazdırıldı:', filePath);
        } catch (e) {
          console.error('❌ Yazıcı hatası:', e.message);
        }
      });
    } catch (err) {
      console.error('❌ Rapor basım hatası:', err.message);
    }
  }

  async stop() {
    if (this.isRunning) {
      if (this.mainReadingIntervalId) clearInterval(this.mainReadingIntervalId);
      this.scheduler.clearAll();
      this.connection.disconnect();
      this.isRunning = false;
    }
    try {
      await database.closePool();
    } catch (e) { /* yoksay */ }
    process.exit(0);
  }
}

const system = new PLCSystem();
process.on('SIGINT', () => system.stop());
system.start().catch(console.error);

module.exports = PLCSystem;
