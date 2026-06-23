# PLC Snap7 Backend

S7-1200 Siemens PLC'den snap7 kullanarak veri okuma sistemi

## Kurulum

```bash
npm install
```

## Yapılandırma

`.env` dosyasını oluşturun:

```
PLC_HOST=192.168.0.1
PLC_RACK=0
PLC_SLOT=1
PLC_TIMEOUT=5000
```

## Çalıştırma

```bash
npm start          # Üretim ortamı
npm run dev        # Geliştirme ortamı (nodemon ile)
```

## Proje Yapısı

- `src/` - Kaynak kodları
  - `index.js` - Ana giriş noktası
  - `plcConnection.js` - PLC bağlantı yönetimi
  - `tagReader.js` - Tag okuma modülü
  - `config.js` - Yapılandırma dosyası
