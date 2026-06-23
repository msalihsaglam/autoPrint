# PLC Snap7 Backend

S7-1200 Siemens PLC'den snap7 kullanarak periyodik veri okuma sistemi.

## Özellikler

✅ **PLC Bağlantısı** - Snap7 kullanarak S7-1200'ye sorunsuz bağlantı
✅ **Otomatik Yeniden Bağlanma** - Bağlantı kesilirse otomatik olarak yeniden bağlan
✅ **Periyodik Okuma** - 24 saat, 3 saat, 1 saat, 30 dakika gibi interval seçenekleri
✅ **Günlük Saat Bazlı Okuma** - Örn: Her gün 14:00'te okuma
✅ **5 Farklı Sensör Verisi** - Sıcaklık, Basınç, Sıvı Seviyesi, İletkenlik, WiFi
✅ **Hata Yönetimi** - Başarısız okumaları takip et ve rapor et
✅ **Zaman Damgası** - Her okumada tarih/saat kaydı

## Kurulum

```bash
# Bağımlılıkları yükle
npm install
```

## Yapılandırma

### 1. .env Dosyası Oluştur

```bash
cp .env.example .env
```

### 2. .env Dosyasını Düzenle

```
PLC_HOST=192.168.1.100        # PLC IP adresi
PLC_RACK=0                    # CPU Rack numarası
PLC_SLOT=1                    # CPU Slot numarası
PLC_TIMEOUT=5000              # Operasyon zaman aşımı (ms)
PLC_CONNECT_TIMEOUT=3000      # Bağlantı zaman aşımı (ms)
PORT=3000                     # Backend port
NODE_ENV=development          # Ortam
LOG_LEVEL=info               # Log seviyeleri
```

## Çalıştırma

```bash
npm start          # Üretim ortamı
npm run dev        # Geliştirme ortamı (nodemon ile - otomatik yeniden yükleme)
```

## Proje Yapısı

```
src/
├── index.js              # Ana uygulama - Sistem başlatma ve okuma görevleri
├── plcConnection.js      # PLC bağlantı yönetimi
├── tagReader.js          # Tag okuma modülü - Veri tipi desteği
├── scheduler.js          # Periyodik ve günlük okuma görevleri
├── tags.js              # Tag tanımları (merkezi konfig)
├── config.js            # Yapılandırma dosyası
└── examples.js          # Kullanım örnekleri
```

## Okunacak Taglar

| No | Tag Adı | Tipi | Adresi | Birim | Açıklama |
|----|---------|------|--------|-------|----------|
| 1 | Tank Sıcaklığı | REAL | %MD14 | °C | Tank içerisindeki sıvının sıcaklığı |
| 2 | Tank Basıncı | REAL | %MD22 | bar | Tank içerisindeki basınç değeri |
| 3 | Tank Sıvı Seviyesi | INT | %MW30 | % | Tank içerisindeki sıvı seviye yüzdesi |
| 4 | İletkenlik Değeri | REAL | %MD44 | µS/cm | Sıvının elektrik iletkenlik değeri |
| 5 | WiFi Sıcaklığı | INT | %IW38 | °C | Dış ortamın WiFi sensöründen ölçülen sıcaklığı |

## Okuma Döngüleri (Cycle)

Sistem aşağıdaki okuma planlarını destekler:

- **24 Saatte Bir** - Günde bir kere tam okuma
- **3 Saatte Bir** - Günde 8 kez okuma
- **Saat 14:00'te** - Her gün 14:00'te okuma
- **Saatlik** - Saatte bir kez okuma
- **30 Dakikada** - 30 dakika arayla okuma
- **Dakikalık** - Test amacı ile dakikada bir kez

Okuma döngüleri `src/index.js` dosyasında `setupReadingTasks()` fonksiyonunda tanımlanır.

## API Fonksiyonları

### TagReader Sınıfı

```javascript
// Memory alanından REAL oku
await tagReader.readMemoryReal(offset);

// Memory alanından INT oku
await tagReader.readMemoryInt(offset);

// Input alanından INT oku
await tagReader.readInputInt(offset);

// Yapılandırılmış tag oku (tags.js tarafından)
await tagReader.readConfiguredTag(tag);

// Birden fazla tag oku
await tagReader.readConfiguredTags(tags);
```

### Scheduler Sınıfı

```javascript
// Periyodik görev ekle
scheduler.addPeriodicTask('id', callback, interval);

// Günlük spesifik saatte görev
scheduler.addDailyTask('id', '14:00', callback);

// Görevleri listele
scheduler.listTasks();

// Belirli görevi durdur
scheduler.stopTask('id');

// Tüm görevleri durdur
scheduler.clearAll();
```

## Veri Depolama

Okunan veriler bellekte saklanır:

```javascript
// Tüm verileri getir
system.getReadingData();

// Belirli türdeki verileri getir
system.getReadingsByType('Günlük');

// Verileri temizle
system.clearReadingData();
```

**Not:** İlerde bu veriler veritabanına yazılacaktır.

## Hata Ayıklama

### PLC'ye Bağlanamıyorum

1. IP adresini kontrol et: `ping 192.168.1.100`
2. PLC'de PUT/GET hizmetinin etkinleştirildiğinden emin ol
3. Ağ kablolarını kontrol et

### Timeout Hatası

1. `PLC_TIMEOUT` değerini artırmayı dene
2. Ağ latensi problemlerini kontrol et
3. Tag offset'lerinin doğru olduğunu kontrol et

### Geçersiz Veri Tipi

1. Tag tanımlarında veri tipinin doğru olduğunu kontrol et
2. PLC'deki veri yapısının uygun olduğunu doğrula

## Test Modunda Çalıştırma

Test amacı ile dakikada bir okuma yapabilirsin. `src/index.js`'de:

```javascript
// Bu satırı uncomment et
this.scheduler.addPeriodicTask(
  'test-every-minute',
  () => this.performTagReading('Test (1 Dakika)'),
  READING_CYCLES.EVERY_MINUTE
);
```

## Kaynaklar

- 📖 [Snap7 Dokümantasyonu](http://snap7.sourceforge.net/)
- 📖 [S7-1200 Teknik Özellikler](https://www.siemens.com/)
- 📖 [Node.js Snap7 NPM](https://www.npmjs.com/package/snap7)
