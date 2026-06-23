const PLCConnection = require('./plcConnection');
const TagReader = require('./tagReader');
const config = require('./config');

class PLCSystem {
  constructor() {
    this.connection = new PLCConnection();
    this.tagReader = new TagReader(this.connection);
    this.isRunning = false;
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

      // Örnek: Tag okuma
      await this.demonstrateTagReading();

    } catch (error) {
      console.error('❌ Hata:', error.message);
      this.stop();
    }
  }

  /**
   * Tag okuma örnekleri
   */
  async demonstrateTagReading() {
    try {
      console.log('📖 Tag Okuma Örnekleri:\n');

      // Örnek 1: Tekil tag okuma
      console.log('1️⃣  Tekil Tag Okuma:');
      try {
        // DB1'den offset 0'dan INT oku
        const value = await this.tagReader.readInt(1, 0);
        console.log(`   DB1:DBW0 = ${value}`);
      } catch (error) {
        console.log(`   ⚠️  Örnek tag okuma başarısız: ${error.message}`);
      }

      // Örnek 2: Birden fazla tag okuma
      console.log('\n2️⃣  Birden Fazla Tag Okuma:');
      try {
        const tags = [
          { type: 'int', db: 1, offset: 0, name: 'Sıcaklık' },
          { type: 'real', db: 1, offset: 10, name: 'Basınç' },
          { type: 'dint', db: 1, offset: 20, name: 'Sayaç' },
          { type: 'bool', db: 1, offset: 30, bit: 0, name: 'Başlat' },
        ];

        const results = await this.tagReader.readMultipleTags(tags);
        results.forEach(result => {
          console.log(`   ${result.name}: ${result.value}`);
        });
      } catch (error) {
        console.log(`   ⚠️  Çoklu tag okuma başarısız: ${error.message}`);
      }

      // Örnek 3: Belirtilen aralıkta veri okuma
      console.log('\n3️⃣  Raw Veri Okuma (10 bayt):');
      try {
        const buffer = await this.tagReader.readBytes(1, 0, 10);
        console.log(`   Hex: ${buffer.toString('hex')}`);
        console.log(`   Raw Data: ${JSON.stringify(Array.from(buffer))}`);
      } catch (error) {
        console.log(`   ⚠️  Raw veri okuma başarısız: ${error.message}`);
      }

    } catch (error) {
      console.error('Örnek çalıştırma hatası:', error.message);
    }
  }

  /**
   * Sistemi durdur
   */
  stop() {
    if (this.isRunning) {
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
