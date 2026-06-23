# PLC Bağlantı Yapılandırması Rehberi

## .env Dosyası Ayarlaması

Projeyi çalıştırmadan önce, proje root'unda `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

## Yapılandırma Parametreleri

### PLC Bağlantı Ayarları

#### PLC_HOST
PLC'nin IP adresi (varsayılan: `192.168.0.1`)

**Örnek:**
```
PLC_HOST=192.168.1.100
```

#### PLC_RACK
CPU'nun Rack numarası (varsayılan: `0`)

S7-1200/1500 için genellikle `0` olur.

**Örnek:**
```
PLC_RACK=0
```

#### PLC_SLOT
CPU'nun Slot numarası (varsayılan: `1`)

S7-1200 için genellikle `1` olur.

**Örnek:**
```
PLC_SLOT=1
```

#### PLC_TIMEOUT
Operasyon zaman aşımı (ms, varsayılan: `5000`)

Tag okuma işleminin maksimum bekleme süresi.

**Örnek:**
```
PLC_TIMEOUT=5000
```

#### PLC_CONNECT_TIMEOUT
Bağlantı zaman aşımı (ms, varsayılan: `3000`)

PLC'ye bağlanma girişiminin maksimum süresi.

**Örnek:**
```
PLC_CONNECT_TIMEOUT=3000
```

### Uygulama Ayarları

#### PORT
Backend sunucusunun çalışacağı port (varsayılan: `3000`)

```
PORT=3000
```

#### NODE_ENV
Node.js ortamı (`development` veya `production`)

```
NODE_ENV=development
```

#### LOG_LEVEL
Log seviyeleri: `error`, `warn`, `info`, `debug` (varsayılan: `info`)

```
LOG_LEVEL=info
```

## Snap7 ve S7-1200 Hakkında

### Snap7 Nedir?

Snap7 (Sharp7), Siemens PLC'lerle iletişim kurmak için açık kaynaklı bir kütüphanedir. S7-200, S7-300, S7-400, S7-1200, S7-1500 gibi PLC'leri destekler.

### S7-1200 Hakkında

S7-1200, Siemens'in kompakt otomasyon denetleyicisidir. Snap7 ile Node.js'den veri okuyabilirsiniz.

## PLC Bağlantısı Sorun Giderme

### Sorun: "Bağlantı reddedildi" hatası

**Çözüm:**
1. PLC IP adresini kontrol edin
2. Ağ bağlantısını kontrol edin
3. PLC'de "Put/Get" hizmetinin etkinleştirildiğini kontrol edin

### Sorun: Operasyon zaman aşımı

**Çözüm:**
1. PLC_TIMEOUT değerini artırmayı deneyin
2. Ağ latensi problemlerini kontrol edin
3. PLC'de yanıt vermesi gereken Data Block'ların doğru olduğunu kontrol edin

### Sorun: Geçersiz tag adı

**Çözül:**
1. DB numarası doğru mu? (readInt(dbNumber, ...))
2. Offset değeri PLC'deki veri yapısıyla eşleşiyor mu?
3. Veri tipi doğru mu? (INT, DINT, REAL, vb.)

## S7 Veri Adreslemesi

### Data Block (DB) Adresleme

```
DB1.DBW0     → 16-bit INT
DB1.DBD0     → 32-bit DINT/REAL
DB1.DBX0.0   → Bit (0. byte, 0. bit)
DB1.DBB0     → 8-bit BYTE
```

### Code Örnekleri

```javascript
// INT oku (DB1:DBW0)
const temp = await tagReader.readInt(1, 0);

// REAL oku (DB1:DBD10)
const pressure = await tagReader.readReal(1, 10);

// BOOL oku (DB1:DBX20.3)
const status = await tagReader.readBool(1, 20, 3);

// STRING oku (DB1:DBB30)
const name = await tagReader.readString(1, 30);
```

## S7-1200 PLC'de Hazırlık

### Snap7 Bağlantısı için Gerekli Ayarlar

1. **Hardware Configuration'da PUT/GET Hizmetini Etkinleştir:**
   - TIA Portal açın
   - CPU seçin → Properties → General → Communication
   - "PUT/GET Communication (BETA)" ✓

2. **IP Adres Ayarlaması:**
   - CPU → Properties → General → Ethernet
   - IP adresini girin (örn: 192.168.1.100)
   - Subnet mask girin

3. **Firewall/Network:**
   - PLC'nin ağda erişilebilir olduğunu kontrol edin
   - Güvenlik duvarı port 102'yi engellemiyorsa kontrol edin (snap7 varsayılan port)

## Performans Optimizasyonu

### İpucu 1: Batch Okuma
```javascript
// Kötü (5 ayrı okuma)
const v1 = await tagReader.readInt(1, 0);
const v2 = await tagReader.readInt(1, 2);
const v3 = await tagReader.readInt(1, 4);
const v4 = await tagReader.readInt(1, 6);
const v5 = await tagReader.readInt(1, 8);

// İyi (1 okuma)
const results = await tagReader.readMultipleTags([
  { type: 'int', db: 1, offset: 0 },
  { type: 'int', db: 1, offset: 2 },
  { type: 'int', db: 1, offset: 4 },
  { type: 'int', db: 1, offset: 6 },
  { type: 'int', db: 1, offset: 8 },
]);
```

### İpucu 2: Polling Interval
```javascript
// Polling interval'ini özelleştirin
setInterval(async () => {
  // Her 500ms'de okuma (çok sık)
}, 500);

// Daha iyi
setInterval(async () => {
  // Her 2000ms'de okuma
}, 2000);
```

### İpucu 3: Bağlantı Havuzu
İlerde, aynı bağlantıyı birden fazla tag okuma işleminde yeniden kullanın.

## Güvenlik Notları

⚠️ **Önemli:**
- PLC IP adresini ve kritik bilgileri `.env` dosyasında tutun
- `.env` dosyasını git'e commit etmeyin (`.gitignore` kontrolü yapın)
- Üretim ortamında SSL/TLS kullanmayı düşünün
- PLC'ye erişim izinlerini sınırlandırın

## Kaynaklar

- Snap7 Resmi: http://snap7.sourceforge.net/
- S7-1200 Teknik Dokümantasyon: https://www.siemens.com/
- Node.js Snap7: https://www.npmjs.com/package/snap7
