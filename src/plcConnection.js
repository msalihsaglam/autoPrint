// src/plcConnection.js
const config = require('./config');
const nodes7 = require('nodes7');

class PLCConnection {
  constructor() {
    this.client = new nodes7();
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.realPLC = true;
    this.reconnectTimer = null;
    this.isReconnecting = false;
    this.RECONNECT_INTERVAL_MS = 10000;
  }

  async connect() {
    // Her bağlantı denemesinde temiz bir nodes7 instance oluştur
    this.client = new nodes7();
    try {
      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error('🔴 Bağlantı zaman aşımı (5 saniye)'));
        }, config.plc.connectTimeout);

        this.client.initiateConnection({
          host: config.plc.host,
          port: 102,
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

  startAutoReconnect(onReconnected, preCheck = null) {
    if (this.isReconnecting) return;
    this.isReconnecting = true;
    console.log(`🔄 Otomatik yeniden bağlanma başlatıldı. Her ${this.RECONNECT_INTERVAL_MS / 1000} saniyede bir deneniyor...`);

    const attempt = async () => {
      if (!this.isReconnecting) return;

      if (preCheck) {
        const canConnect = await preCheck();
        if (!canConnect) {
          this.isReconnecting = false;
          if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          return;
        }
      }

      console.log('🔌 PLC bağlantısı yeniden kuruluyor...');
      try {
        await this.connect();
        this.isReconnecting = false;
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        console.log('🟢 Yeniden bağlantı başarılı!');
        if (onReconnected) onReconnected();
      } catch (err) {
        console.log(`⏳ Bağlantı başarısız, ${this.RECONNECT_INTERVAL_MS / 1000} saniye sonra tekrar denenecek...`);
      }
    };

    // Hemen bir kez dene, sonra periyodik olarak tekrar et
    attempt();
    this.reconnectTimer = setInterval(attempt, this.RECONNECT_INTERVAL_MS);
  }

  stopAutoReconnect() {
    this.isReconnecting = false;
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  disconnect() {
    try {
      this.stopAutoReconnect();
      if (this.isConnected) {
        this.client.dropConnection();
        this.isConnected = false;
        console.log('✓ PLC bağlantısı kapatıldı');
      }
    } catch (error) {
      console.error('❌ Bağlantı kapatılırken hata:', error.message);
    }
  }

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

  getClient() {
    return this.client;
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      host: config.plc.host,
      rack: config.plc.rack,
      slot: config.plc.slot,
      port: 102,
      clientType: 'nodes7 (S7-1200)',
      realPLC: this.realPLC,
      connectionAttempts: this.connectionAttempts,
      isReconnecting: this.isReconnecting
    };
  }
}

module.exports = PLCConnection;