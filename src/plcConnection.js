const snap7 = require('snap7');
const config = require('./config');

class PLCConnection {
  constructor() {
    this.client = new snap7.S7Client();
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 saniye
  }

  /**
   * PLC'ye bağlan
   */
  async connect() {
    try {
      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error('Bağlantı zaman aşımı'));
        }, config.plc.connectTimeout);

        const result = this.client.ConnectTo(
          config.plc.host,
          config.plc.rack,
          config.plc.slot
        );

        clearTimeout(connectionTimeout);

        if (result === 0) {
          this.isConnected = true;
          this.connectionAttempts = 0;
          console.log(
            `✓ PLC'ye başarıyla bağlandı: ${config.plc.host} (Rack: ${config.plc.rack}, Slot: ${config.plc.slot})`
          );
          resolve(true);
        } else {
          const errorMsg = this.getErrorMessage(result);
          reject(new Error(`Bağlantı hatası: ${errorMsg}`));
        }
      });
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * PLC'yle bağlantıyı kapat
   */
  disconnect() {
    try {
      if (this.isConnected) {
        this.client.Disconnect();
        this.isConnected = false;
        console.log('✓ PLC bağlantısı kapatıldı');
      }
    } catch (error) {
      console.error('Bağlantı kapatılırken hata:', error.message);
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
   * Snap7 hata kodunu insan tarafından okunur açıklamaya çevir
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
   * Snap7 client nesnesini döndür (ileri kullanım için)
   */
  getClient() {
    return this.client;
  }
}

module.exports = PLCConnection;
