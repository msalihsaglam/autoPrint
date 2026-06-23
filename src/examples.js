/**
 * KULLANIM ÖRNEKLERİ - PLC Snap7 Backend
 * 
 * Bu dosya, PLC'den tag okuma için API'nin nasıl kullanılacağını gösterir.
 */

const PLCConnection = require('./plcConnection');
const TagReader = require('./tagReader');
const config = require('./config');

// ============================================================================
// ÖRNEK 1: Basit Bağlantı ve Tag Okuma
// ============================================================================
async function example1_BasicTagReading() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);

  try {
    // PLC'ye bağlan
    await connection.connect();

    // DB1'den 0. byte'tan INT oku
    const temperature = await tagReader.readInt(1, 0);
    console.log(`Sıcaklık: ${temperature}°C`);

    // DB1'den 10. byte'tan REAL oku
    const pressure = await tagReader.readReal(1, 10);
    console.log(`Basınç: ${pressure} bar`);

    // Bağlantıyı kapat
    connection.disconnect();
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ============================================================================
// ÖRNEK 2: Çoklu Tag Okuma (Verimli)
// ============================================================================
async function example2_MultipleTagReading() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);

  try {
    await connection.connect();

    // Aynı anda birden fazla tag oku
    const tags = [
      { type: 'int', db: 1, offset: 0, name: 'Sıcaklık' },
      { type: 'int', db: 1, offset: 2, name: 'Nemlik' },
      { type: 'real', db: 1, offset: 10, name: 'Basınç' },
      { type: 'dint', db: 1, offset: 20, name: 'Üretim_Sayısı' },
      { type: 'bool', db: 1, offset: 30, bit: 0, name: 'Pompa_Açık' },
      { type: 'bool', db: 1, offset: 30, bit: 1, name: 'Isıtıcı_Açık' },
    ];

    const results = await tagReader.readMultipleTags(tags);
    
    results.forEach(result => {
      console.log(`${result.name}: ${result.value}`);
    });

    connection.disconnect();
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ============================================================================
// ÖRNEK 3: Belirtilen Aralıkta Veri Okuma (Raw)
// ============================================================================
async function example3_RawDataReading() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);

  try {
    await connection.connect();

    // DB1'den 0-20 byte'ları oku
    const buffer = await tagReader.readBytes(1, 0, 20);
    
    console.log('Hex Format:', buffer.toString('hex'));
    console.log('Dizi Format:', Array.from(buffer));
    
    // Buffer'dan elle veri çıkart
    const int1 = buffer.readInt16BE(0);      // 0-1. byte
    const int2 = buffer.readInt16BE(2);      // 2-3. byte
    const real = buffer.readFloatBE(10);     // 10-13. byte
    
    console.log(`INT1: ${int1}, INT2: ${int2}, REAL: ${real}`);

    connection.disconnect();
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ============================================================================
// ÖRNEK 4: Periyodik Veri Okuma (Polling)
// ============================================================================
async function example4_PeriodicReading() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);
  let readCount = 0;

  try {
    await connection.connect();

    // Her 2 saniyede bir tag oku
    const interval = setInterval(async () => {
      try {
        const temperature = await tagReader.readInt(1, 0);
        const timestamp = new Date().toLocaleTimeString('tr-TR');
        
        console.log(`[${timestamp}] Sıcaklık: ${temperature}°C (Okuma #${++readCount})`);

        // 10 okumadan sonra durdur
        if (readCount >= 10) {
          clearInterval(interval);
          connection.disconnect();
        }
      } catch (error) {
        console.error('Okuma hatası:', error.message);
      }
    }, 2000);

  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ============================================================================
// ÖRNEK 5: STRING Veri Okuma
// ============================================================================
async function example5_StringReading() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);

  try {
    await connection.connect();

    // DB2'den offset 0'dan STRING oku
    // Not: S7-1200'de STRING tipi 1 byte max uzunluk + 1 byte gerçek uzunluk + data
    const deviceName = await tagReader.readString(2, 0, 256);
    console.log(`Cihaz Adı: ${deviceName}`);

    connection.disconnect();
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ============================================================================
// ÖRNEK 6: Hata Yönetimi ve Yeniden Bağlanma
// ============================================================================
async function example6_ErrorHandling() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);

  try {
    await connection.connect();

    // Tag okuma ile hata yönetimi
    for (let i = 0; i < 5; i++) {
      try {
        const value = await tagReader.readInt(1, 0);
        console.log(`Deneme ${i + 1}: ${value}`);
      } catch (error) {
        console.error(`Deneme ${i + 1} başarısız:`, error.message);
        
        // Bağlantı kesilmişse yeniden bağlan
        if (!connection.isConnected) {
          console.log('Yeniden bağlanılıyor...');
          await connection.connect();
        }
      }
    }

    connection.disconnect();
  } catch (error) {
    console.error('Genel hata:', error.message);
  }
}

// ============================================================================
// ÖRNEK 7: Özel Tag Yapısı (Struct İle Benzer)
// ============================================================================
async function example7_StructLikeData() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);

  try {
    await connection.connect();

    // DB1'de şu yapıda veri olduğunu varsayalım:
    // +0 (2 byte): INT - Sıcaklık
    // +2 (2 byte): INT - Nemlik
    // +4 (4 byte): REAL - Basınç
    // +8 (1 byte): BOOL - Sistem Açık (bit 0)
    // +8 (1 byte): BOOL - Uyarı (bit 1)

    const sensorData = {
      temperature: await tagReader.readInt(1, 0),
      humidity: await tagReader.readInt(1, 2),
      pressure: await tagReader.readReal(1, 4),
      systemOn: await tagReader.readBool(1, 8, 0),
      warning: await tagReader.readBool(1, 8, 1),
      timestamp: new Date().toISOString()
    };

    console.log('Sensör Verisi:', JSON.stringify(sensorData, null, 2));

    connection.disconnect();
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ============================================================================
// ÖRNEK 8: Input/Output Alanından Okuma
// ============================================================================
async function example8_IOAreaReading() {
  const connection = new PLCConnection();
  const tagReader = new TagReader(connection);

  try {
    await connection.connect();

    // Giriş (Input - I) alanından oku
    try {
      const inputValue = await tagReader.readInputInt(0);
      console.log(`Input I0: ${inputValue}`);
    } catch (error) {
      console.log('Not: Input okuma örneği başarısız olabilir');
    }

    // Çıkış (Output - Q) alanından oku
    try {
      const outputValue = await tagReader.readOutputInt(0);
      console.log(`Output Q0: ${outputValue}`);
    } catch (error) {
      console.log('Not: Output okuma örneği başarısız olabilir');
    }

    // Bellek (M) alanından oku
    try {
      const memoryValue = await tagReader.readMemoryInt(0);
      console.log(`Memory M0: ${memoryValue}`);
    } catch (error) {
      console.log('Not: Memory okuma örneği başarısız olabilir');
    }

    connection.disconnect();
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ============================================================================
// ÖNEMLİ NOTLAR VE İPUÇLARI
// ============================================================================

/*
PLC VERİ TIPLERI ve BAYT UZUNLUKLARI:
- BOOL: 1 bit (8 bit = 1 byte)
- BYTE: 1 byte
- INT: 2 byte (16-bit işaretli tamsayı)
- DINT: 4 byte (32-bit işaretli tamsayı)
- REAL: 4 byte (IEEE 754 kayan nokta)
- STRING: 2 + uzunluk byte (1. byte max, 2. byte gerçek, geri data)
- DATE_TIME: 8 byte

MEMORY ALANLARI (Snap7 Constantları):
- S7AreaDB: Data Block (DB)
- S7AreaMK: Bellek (M)
- S7AreaPE: Giriş (I)
- S7AreaPA: Çıkış (Q)
- S7AreaCT: Sayaç (C)
- S7AreaTM: Zamanlayıcı (T)

OFFSET (Byte Kaydırması):
- S7-1200'de veri adresleri byte cinsinden belirtilir
- DB1:DBW0 = DB1 offset 0 (2 byte INT)
- DB1:DBW2 = DB1 offset 2 (sonraki 2 byte INT)
- DB1:DBD4 = DB1 offset 4 (4 byte DINT/REAL)

BIT ADRESLEME:
- Bool okumada: byteOffset ve bitOffset kullan
- Örn: DB1:DBX10.3 = readBool(1, 10, 3)
- bit 0 = LSB (en az anlamlı bit)
- bit 7 = MSB (en çok anlamlı bit)

PERFORMANS İPUÇLARI:
1. readMultipleTags() kullan, tekil okuma yerine
2. Polling interval'ini dikkatli ayarla (çok sık = ağ yükü)
3. Hata durumunda bağlantıyı kontrol et
4. Buffer'ları yeniden kullan, maliyetli değildir

HATA AYIKLAMA:
- Connection timeout: PLC IP adresini kontrol et
- "Permission denied": PLC'de "Put/Get" sağlığını kontrol et
- "Timeout" okuma sırasında: Veri tipini veya offset'i kontrol et
*/

// Çalıştır: npm install, sonra node örnek seç
if (require.main === module) {
  // İstediğiniz örneği çalıştırmak için yorum kaldırın:
  
  // example1_BasicTagReading();
  // example2_MultipleTagReading();
  // example3_RawDataReading();
  // example4_PeriodicReading();
  // example5_StringReading();
  // example6_ErrorHandling();
  // example7_StructLikeData();
  // example8_IOAreaReading();
  
  console.log('Örnek kodunu examples.js dosyasında bulabilirsiniz.');
  console.log('Ana uygulamayı çalıştırmak için: npm start');
}

module.exports = {
  example1_BasicTagReading,
  example2_MultipleTagReading,
  example3_RawDataReading,
  example4_PeriodicReading,
  example5_StringReading,
  example6_ErrorHandling,
  example7_StructLikeData,
  example8_IOAreaReading,
};
