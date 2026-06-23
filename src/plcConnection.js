const config = require('./config');
const nodes7 = require('nodes7');

class PLCConnection {
  constructor() {
    // nodes7 client oluştur
    this.client = new nodes7();
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 saniye
    this.realPLC = true; // Gerçek PLC kullanıyoruz
  }

  /**
   * PLC'ye bağlan (nodes7 - S7-1200)
   */
  async connect() {
    try {
      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error('🔴 Bağlantı zaman aşımı (5 saniye)'));
        }, config.plc.connectTimeout);

        // nodes7 bağlantı
        this.client.initiateConnection({
          host: config.plc.host,
          port: 102, // Standard S7 port
          rack: config.plc.rack,
          slot: config.plc.slot
        }, (err) => {
          clearTimeout(connectionTimeout);

          if (err) {
            this.isConnected = false;
            console.error(`❌ PLC Bağlantı Hatası: ${err.message}`);
            reject(err);
          } else {
            this.isConnected = true;
            this.connectionAttempts = 0;
            console.log(`🟢 S7-1200 PLC'ye başarıyla bağlandı!`);
            console.log(`   Host: ${config.plc.host}`);
            console.log(`   Rack: ${config.plc.rack}, Slot: ${config.plc.slot}`);
            console.log(`   Port: 102`);
            resolve(true);
          }
        });
      });
    } catch (error) {
      this.isConnected = false;
      console.error(`❌ Bağlantı hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * PLC'yle bağlantıyı kapat
   */
  disconnect() {
    try {
      if (this.isConnected) {
        this.client.dropConnection(() => {
          this.isConnected = false;
          console.log('✓ PLC bağlantısı kapatıldı');
        });
      }
    } catch (error) {
      console.error('❌ Bağlantı kapatılırken hata:', error.message);
    }
  }

  /**
   * Bağlantı kontrol et, gerekirse yeniden bağlan
   */
  async ensureConnected() {
    if (!this.isConnected) {
      if (this.connectionAttempts < this.maxRetries) {
        this.connectionAttempts++;
        console.log(`Yeniden bağlanma deneniyor... (${this.connectionAttempts}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        await this.connect();
      } else {
        throw new Error('PLC bağlantısı kurulamadı. Maksimum deneme sayısına ulaşıldı.');
      }
    }
  }

  /**
   * S7-1200 Hata Mesajlarını Çevir
   */
  getErrorMessage(errorCode) {
    const errors = {
      0: 'İşlem başarılı',
      1: 'Genel hata',
      2: 'CPU veya ağ hatası',
      3: 'Bellek erişim hatası',
      4: 'Zaman aşımı',
      5: 'Bağlantı reddedildi',
      6: 'Komut desteklenmiyor',
      7: 'Parametreler geçersiz',
    };
    return errors[errorCode] || `Bilinmeyen hata (Kod: ${errorCode})`;
  }

  /**
   * nodes7 client nesnesini döndür
   */
  getClient() {
    return this.client;
  }

  /**
   * Bağlantı detaylarını döndür
   */
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      host: config.plc.host,
      rack: config.plc.rack,
      slot: config.plc.slot,
      port: 102,
      clientType: 'nodes7 (S7-1200)',
      realPLC: this.realPLC,
      connectionAttempts: this.connectionAttempts
    };
  }
}

module.exports = PLCConnection;
