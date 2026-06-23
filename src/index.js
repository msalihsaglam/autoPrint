const PLCConnection = require('./plcConnection');
const TagReader = require('./tagReader');
const Scheduler = require('./scheduler');
const APIServer = require('./apiServer');
const { getAllTags, printTagInfo } = require('./tags');
const config = require('./config');

// ============================================================================
// OKUMA CYCLE AYARLARI
// ============================================================================
// Arayüzden verilecek cycle türleri ve zamanları
const READING_CYCLES = {
  // Periyodik okuma (ms cinsinden interval)
  EVERY_3_HOURS: 3 * 60 * 60 * 1000,      // 3 saat
  EVERY_6_HOURS: 6 * 60 * 60 * 1000,      // 6 saat
  EVERY_24_HOURS: 24 * 60 * 60 * 1000,    // 24 saat (günde bir kere)
  EVERY_HOUR: 60 * 60 * 1000,             // 1 saat
  EVERY_30_MINUTES: 30 * 60 * 1000,       // 30 dakika
  EVERY_MINUTE: 60 * 1000,                // 1 dakika (test için)
};

class PLCSystem {
  constructor() {
    this.connection = new PLCConnection();
    this.tagReader = new TagReader(this.connection);
    this.scheduler = new Scheduler(this.tagReader);
    this.apiServer = null;
    
    this.isRunning = false;
    this.readingData = [];
    
    // Sistem ayarları
    this.mode = 'manual';           // 'manual' | 'auto'
    this.cycle = 'EVERY_24_HOURS';  // Aktif cycle
  }

  /**
   * Sistemi başlat
   */
  async start() {
    try {
      console.log('🚀 PLC Veri Okuma Sistemi başlatılıyor...');
      console.log(`   Host: ${config.plc.host}`);
      console.log(`   Rack: ${config.plc.rack}, Slot: ${config.plc.slot}`);
      console.log('');

      // PLC'ye bağlan
      await this.connection.connect();
      this.isRunning = true;

      // Tag bilgilerini göster
      printTagInfo();

      // Okuma görevlerini başlat
      await this.setupReadingTasks();

      // API sunucusunu başlat
      this.startAPIServer();

    } catch (error) {
      console.error('❌ Hata:', error.message);
      this.stop();
    }
  }

  /**
   * API sunucusunu başlat
   */
  startAPIServer() {
    this.apiServer = new APIServer(this);
    this.apiServer.start();
  }

  /**
   * Tag okuma görevlerini ayarla
   */
  async setupReadingTasks() {
    console.log('\n⏰ OKUMA GÖREVLERİ AYARLANIYÖR:\n');

    // GÖREV 1: Günde bir kere (24 saat interval)
    this.scheduler.addPeriodicTask(
      'daily-reading',
      () => this.performTagReading('Günlük'),
      READING_CYCLES.EVERY_24_HOURS
    );

    // GÖREV 2: 3 saatte bir
    this.scheduler.addPeriodicTask(
      'every-3-hours-reading',
      () => this.performTagReading('3 Saatlik'),
      READING_CYCLES.EVERY_3_HOURS
    );

    // GÖREV 3: Saat 14:00'te günlük okuma
    this.scheduler.addDailyTask(
      'daily-at-14-00',
      '14:00',
      () => this.performTagReading('14:00 Günlük')
    );

    // TEST: Her 1 dakikada bir (test amacı ile)
    // Comment out et üretimde
    // this.scheduler.addPeriodicTask(
    //   'test-every-minute',
    //   () => this.performTagReading('Test (1 Dakika)'),
    //   READING_CYCLES.EVERY_MINUTE
    // );

    console.log('\n✓ Okuma görevleri başarıyla ayarlandı\n');
    
    // Aktif görevleri listele
    this.scheduler.listTasks();

    // İlk okumayı hemen yap
    console.log('\n🔄 İlk okuma gerçekleştiriliyor...\n');
    await this.performTagReading('İlk Okuma');
  }

  /**
   * Tag okuma işlemi
   */
  async performTagReading(readingType = 'Düzenli') {
    const startTime = Date.now();
    
    try {
      console.log(`\n📖 Tag Okuma Başladı [${readingType}] - ${new Date().toLocaleTimeString('tr-TR')}`);
      console.log('─'.repeat(60));

      // Tüm tag'ları oku
      const tags = getAllTags();
      const results = await this.tagReader.readConfiguredTags(tags);

      // Sonuçları işle
      const readingRecord = {
        timestamp: new Date().toISOString(),
        readingType: readingType,
        duration: Date.now() - startTime,
        tags: results,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      };

      // Verileri sakla (ilerde DB'ye yazılacak)
      this.readingData.push(readingRecord);

      // Sonuçları göster
      console.log('\n📊 Okuma Sonuçları:');
      console.log('─'.repeat(60));
      
      results.forEach((result) => {
        if (result.success) {
          console.log(`✓ ${result.name.padEnd(25)} : ${String(result.value).padEnd(12)} ${result.unit}`);
        } else {
          console.log(`✗ ${result.name.padEnd(25)} : HATA - ${result.error}`);
        }
      });

      console.log('─'.repeat(60));
      console.log(`\nÖzet:`);
      console.log(`  Başarılı: ${readingRecord.successCount}/${results.length}`);
      console.log(`  Başarısız: ${readingRecord.failureCount}/${results.length}`);
      console.log(`  Süre: ${readingRecord.duration}ms`);
      console.log(`  İşlem ID: ${readingRecord.timestamp}`);

      return readingRecord;

    } catch (error) {
      console.error(`❌ Okuma hatası [${readingType}]:`, error.message);
    }
  }

  /**
   * Okunan verileri getir
   */
  getReadingData() {
    return this.readingData;
  }

  /**
   * Okunan verileri temizle
   */
  clearReadingData() {
    this.readingData = [];
    console.log('✓ Okunan veriler temizlendi');
  }

  /**
   * Belirli okuma türünün verilerini getir
   */
  getReadingsByType(readingType) {
    return this.readingData.filter(r => r.readingType === readingType);
  }

  /**
   * Sistemi durdur
   */
  stop() {
    if (this.isRunning) {
      this.scheduler.clearAll();
      this.connection.disconnect();
      this.isRunning = false;
      console.log('🛑 Sistem durduruldu');
    }
    process.exit(0);
  }
}

/**
 * İşletim Sistemi sinyallerine tepki ver
 */
function setupSignalHandlers(system) {
  process.on('SIGINT', () => {
    console.log('\n');
    system.stop();
  });

  process.on('SIGTERM', () => {
    console.log('\n');
    system.stop();
  });

  process.on('uncaughtException', (error) => {
    console.error('Yakalanmayan hata:', error);
    system.stop();
  });
}

/**
 * Ana giriş noktası
 */
async function main() {
  const system = new PLCSystem();
  setupSignalHandlers(system);
  
  // Başlat
  await system.start();

  // Sistem devam ettikçe çalışır...
  // Ctrl+C ile durdur
}

// Başla
if (require.main === module) {
  main().catch(console.error);
}

module.exports = PLCSystem;
