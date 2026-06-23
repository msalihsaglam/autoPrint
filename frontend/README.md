# PLC Frontend - React

S7-1200 PLC veri okuma sistemi için React tabanlı web arayüzü.

## Özellikler

✅ **Dashboard** - Tag değerlerini anlık olarak göster
✅ **Ayarlar Sayfası** - Sistem modu (Otomatik/Manuel) seçimi
✅ **Cycle Seçimi** - Otomatik modda okuma sıklığını belirle
✅ **Manuel Trigger** - Trigger butonu ile anlık okuma
✅ **Auto-Refresh** - Dashboard otomatik yenileme
✅ **Trend Hazırlığı** - İlerde grafik gösterim için yapı
✅ **Responsive Tasarım** - Mobil uyumlu

## Kurulum

```bash
# Bağımlılıkları yükle
npm install
```

## Çalıştırma

```bash
# Geliştirme sunucusu başlat
npm run dev

# Tarayıcıda aç
http://localhost:3000
```

## Proje Yapısı

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx      # Tag değerleri gösterim
│   │   ├── Dashboard.css
│   │   ├── Settings.jsx       # Sistem ayarları
│   │   └── Settings.css
│   ├── components/
│   │   ├── Navigation.jsx     # Navigasyon bar
│   │   └── Navigation.css
│   ├── context/
│   │   └── AppContext.jsx     # Global state management
│   ├── styles/
│   │   └── global.css         # Global stiller
│   ├── App.jsx                # Ana bileşen
│   └── main.jsx               # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Sayfa Açıklaması

### 📊 Dashboard
- Tüm tag'ların anlık değerlerini gösterir
- Son okuma zamanı ve başarı durumu görünür
- Otomatik yenileme (5 saniye)
- İlerde trend grafikleri eklenecek

### ⚙️ Settings
- **Çalışma Modu Seçimi:**
  - Otomatik: Sistem belirtilen cycle'da kendi başına okur
  - Manuel: Trigger butonu ile manuel okuma
  
- **Okuma Döngüsü (Cycle)** (Sadece Otomatik Modda):
  - Günde bir kere (24 saat)
  - 3 saatte bir
  - Saatlik
  - 30 dakikada bir
  - Her gün 14:00'te
  
- **Anlık Okuma** (Sadece Manuel Modda):
  - Trigger butonu ile hemen okuma yap

## API Bağlantısı

Frontend `http://localhost:3001/api` adresine istek gönderir.

**Önemli Endpoint'ler:**

```javascript
// Tag'ları getir
GET /api/tags

// Sistem durumu
GET /api/system/status

// Modu değiştir
POST /api/system/mode
{ mode: 'auto' | 'manual' }

// Cycle değiştir
POST /api/system/cycle
{ cycle: 'EVERY_24_HOURS' | 'EVERY_3_HOURS' | ... }

// Manuel trigger
POST /api/reading/trigger

// Son okuma verisi
GET /api/reading/last
```

## Global CSS Değişkenleri

```css
--color-primary: #2563eb
--color-success: #10b981
--color-danger: #ef4444
--color-text: #111827
--color-border: #e5e7eb
```

Bu değişkenleri değiştirerek tema özelleştirebilirsin.

## Kaynaklar

- 📖 [React Dokümentasyonu](https://react.dev/)
- 📖 [Vite Rehberi](https://vitejs.dev/)
- 📖 [Axios HTTP Client](https://axios-http.com/)
