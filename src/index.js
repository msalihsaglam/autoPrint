const PLCConnection = require('./plcConnection');
const TagReader = require('./tagReader');
const Scheduler = require('./scheduler');
const APIServer = require('./apiServer');
const { getAllTags, getMainTags, getControlTag, printTagInfo } = require('./tags');
const config = require('./config');
const database = require('./database');
const { initializePool, testConnection, logSystemEvent, saveTagReadings } = database;

// ============================================================================
// OKUMA KONTROL AYARLARI
// ============================================================================
const READING_INTERVALS = {
  START_MEM_CHECK: 20 * 1000,       // Start_MEM tag'ını 20 saniyede bir oku
  MAIN_TAGS_READ: 60 * 1000,        // Main tags'ı (Start_MEM true iken) 1 dakikada bir oku
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
    
    // Sistem durumu
    this.startMemState = false;        // Son okunan Start_MEM durumu
    this.isMainReadingActive = false;  // Ana tag okuma durumu
    this.mainReadingIntervalId = null; // Main tags okuma interval ID
  }

  /**
   * Sistemi başlat
   */
  async start() {
    try {
      console.log('🚀 PLC Veri Okuma Sistemi başlatılıyor...');
      console.log(`🔴 GERÇEK S7-1200 PLC BAĞLANTISI (Mock Yok)`);
      console.log(`   Host: ${config.plc.host}`);
      console.log(`   Rack: ${config.plc.rack}, Slot: ${config.plc.slot}`);
      console.log(`   Port: 102`);
      console.log('');

      // Database pool'ı başlat
      initializePool();
      const dbConnected = await testConnection();
      if (!dbConnected) {
        console.warn('⚠️  Database bağlantı hatası - veri kayıt olmayacak');
        await logSystemEvent('WARNING', 'Database connection failed');
      } else {
        await logSystemEvent('INFO', 'System started - REAL PLC', { 
          host: config.plc.host,
          rack: config.plc.rack,
          slot: config.plc.slot
        });
      }
      console.log('');

      // PLC'ye bağlan (GERÇEK)
      console.log('🔌 S7-1200 PLC bağlantısı kuruluyor...');
      await this.connection.connect();
      this.isRunning = true;
      
      // Debug: Bağlantı durumunu kontrol et
      const connInfo = this.connection.getConnectionInfo();
      console.log(`✅ Bağlantı Durumu - isConnected: ${connInfo.isConnected}`);
      console.log(`📡 PLC Durumu: ${connInfo.isConnected ? '🟢 BAĞLI (GERÇEK)' : '🔴 BAĞLI DEĞİL'}`);

      // Tag bilgilerini göster
      printTagInfo();

      // Okuma görevlerini başlat (örnek veri yazması için devre dışı)
      // await this.setupReadingTasks();

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

    // GÖREV 1: Start_MEM tag'ını 20 saniyede bir kontrol et
    this.scheduler.addPeriodicTask(
      'start-mem-monitor',
      () => this.checkStartMemTag(),
      READING_INTERVALS.START_MEM_CHECK
    );

    console.log('\n✓ Okuma görevleri başarıyla ayarlandı');
    console.log('   - Start_MEM tag\'ı 20 saniyede bir kontrol edilecek');
    console.log('   - TRUE olduğunda: Main tags 1 dakikada bir okunacak');
    console.log('   - FALSE olduğunda: Okuma durdurulacak\n');
  }

  /**
   * Start_MEM tag'ını kontrol et ve ana okuma işlemini başlat/durdur
   */
  async checkStartMemTag() {
    try {
      const controlTag = getControlTag();
      
      // Mock data: Start_MEM tag'ını oku
      const result = {
        id: controlTag.id,
        name: controlTag.name,
        value: Math.random() > 0.5, // Mock boolean value
        type: controlTag.type,
        timestamp: new Date().toISOString(),
        success: true
      };

      console.log(`\n⚙️  Start_MEM Kontrol [${new Date().toLocaleTimeString('tr-TR')}]: ${result.value ? '✓ TRUE' : '✗ FALSE'}`);

      // Durum değişti mi?
      if (result.value && !this.startMemState) {
        // FALSE -> TRUE: Ana okumayı başlat
        console.log('🟢 Start_MEM TRUE oldu - Ana tag okuma başlıyor...');
        this.startMainReading();
      } else if (!result.value && this.startMemState) {
        // TRUE -> FALSE: Ana okumayı durdur
        console.log('🔴 Start_MEM FALSE oldu - Ana tag okuma durduruldu');
        this.stopMainReading();
      }

      // Durumu güncelle
      this.startMemState = result.value;
    } catch (error) {
      console.error('❌ Start_MEM kontrol hatası:', error.message);
    }
  }

  /**
   * Ana tag okuma işlemini başlat
   */
  startMainReading() {
    if (this.isMainReadingActive) {
      console.log('ℹ️  Ana okuma zaten aktif');
      return;
    }

    console.log('🟢 Main tags okuma başlatılıyor...');
    this.isMainReadingActive = true;

    // Hemen ilk okumayı yap
    this.performMainTagsReading('İlk Okuma (Start_MEM TRUE)');

    // Sonra 1 dakikada bir tekrarla
    this.mainReadingIntervalId = setInterval(() => {
      if (this.isMainReadingActive) {
        this.performMainTagsReading('Periyodik Okuma (Start_MEM TRUE)');
      }
    }, READING_INTERVALS.MAIN_TAGS_READ);
  }

  /**
   * Ana tag okuma işlemini durdur
   */
  stopMainReading() {
    if (!this.isMainReadingActive) {
      console.log('ℹ️  Ana okuma zaten durmuş');
      return;
    }

    console.log('🔴 Main tags okuma durdurulıyor...');
    this.isMainReadingActive = false;

    if (this.mainReadingIntervalId) {
      clearInterval(this.mainReadingIntervalId);
      this.mainReadingIntervalId = null;
    }
  }

  /**
   * Ana tag'ları oku ve database'ye kaydet
   */
  async performMainTagsReading(readingType = 'Düzenli') {
    const startTime = Date.now();
    
    try {
      console.log(`\n📖 Ana Tag Okuma Başladı [${readingType}] - ${new Date().toLocaleTimeString('tr-TR')}`);
      console.log('─'.repeat(60));

      // Ana 5 tag'ı oku
      const mainTags = getMainTags();
      const results = await this.tagReader.readConfiguredTags(mainTags);

      // Sonuçları işle
      const readingRecord = {
        timestamp: new Date().toISOString(),
        readingType: readingType,
        duration: Date.now() - startTime,
        tags: results,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      };

      // Verileri sakla
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

      // Database'ye kaydet
      const savedCount = await saveTagReadings(results);
      if (savedCount > 0) {
        console.log(`\n💾 Database'ye kaydedildi: ${savedCount} tag`);
      }

      return readingRecord;

    } catch (error) {
      console.error(`❌ Ana tag okuma hatası [${readingType}]:`, error.message);
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
  async stop() {
    if (this.isRunning) {
      // Main reading interval'ı durdur
      if (this.mainReadingIntervalId) {
        clearInterval(this.mainReadingIntervalId);
      }
      
      this.scheduler.clearAll();
      this.connection.disconnect();
      this.isRunning = false;
      
      // Database pool'u kapat
      const { closePool } = require('./database');
      await closePool();
      
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
