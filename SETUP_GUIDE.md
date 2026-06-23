# Full Stack Kurulum Rehberi

PLC Tag Okuma Sistemi'nin tüm bileşenleri (Backend + Frontend) kurma adımları.

## 📋 Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend (Port 3000)                  │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐    │
│  │  Dashboard   │  │   Settings     │  │  Navigation      │    │
│  └──────────────┘  └────────────────┘  └──────────────────┘    │
│         │                 │                       │              │
│         └─────────────────┼───────────────────────┘              │
│                           │ Axios HTTP                           │
│                           ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│              Express API Server (Port 3001)                      │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐    │
│  │  GET /tags   │  │ POST /trigger  │  │  GET /reading    │    │
│  └──────────────┘  └────────────────┘  └──────────────────┘    │
│         ↓                 ↓                       ↓              │
├─────────────────────────────────────────────────────────────────┤
│              Node.js Backend (Main Process)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PLC Connection → Tag Reader → Scheduler → Data Storage │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  S7-1200 PLC (via Snap7)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Adım 1: Backend Kurulumu

### 1.1 Backend Bağımlılıkları Yükle

```bash
cd d:\prj\SAS_GEM\autoPrint
npm install
```

Bu şunları kuracak:
- `snap7` - PLC iletişimi
- `express` - HTTP API
- `cors` - Cross-Origin requests
- `dotenv` - Environment variables

### 1.2 .env Dosyasını Oluştur

```bash
copy .env.example .env
```

`.env` dosyasını düzenle:

```env
PLC_HOST=192.168.1.100      # PLC IP adresini gir
PLC_RACK=0
PLC_SLOT=1
PLC_TIMEOUT=5000
PLC_CONNECT_TIMEOUT=3000
API_PORT=3001              # API port (değiştiriysen burada da değiştir)
NODE_ENV=development
LOG_LEVEL=info
```

### 1.3 Backend'i Başlat

```bash
npm start
```

Beklenen çıktı:
```
✓ PLC'ye başarıyla bağlandı: 192.168.1.100
✓ Okuma görevleri başarıyla ayarlandı
✓ API Sunucusu başlatıldı: http://localhost:3001
```

## 🎨 Adım 2: Frontend Kurulumu

### 2.1 Frontend Bağımlılıkları Yükle

**Yeni Terminal Penceresi Aç** (backend çalışırken)

```bash
cd d:\prj\SAS_GEM\autoPrint\frontend
npm install
```

Bu şunları kuracak:
- `react` - UI Framework
- `react-dom` - DOM binding
- `axios` - HTTP client
- `vite` - Build tool

### 2.2 Frontend'i Başlat

```bash
npm run dev
```

Beklenen çıktı:
```
  VITE v4.3.9  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

## 🌐 Adım 3: Tarayıcıda Aç

Tarayıcısında aç:

```
http://localhost:3000
```

## 📊 İlk Başlatma Kontrol Listesi

- [ ] Backend başlatıldı (http://localhost:3001)
- [ ] Frontend başlatıldı (http://localhost:3000)
- [ ] PLC IP adresi .env'de doğru
- [ ] PLC'de PUT/GET hizmeti etkinleştirildi
- [ ] Dashboard'da tag değerleri gösteriliyor

## 🚀 Kullanım Senaryoları

### Senaryo 1: Otomatik Okuma (Günde 1 Kere)

1. Settings sayfasına git
2. "Otomatik Mod" seç
3. "Günde Bir Kere (24 saat)" seç
4. Sistem otomatik olarak tag okuyacak
5. Dashboard'da son okumayı görebilirsin

### Senaryo 2: Manuel Okuma (Anlık)

1. Settings sayfasına git
2. "Manuel Mod" seç
3. "▶ Trigger - Şimdi Oku" butonuna tıkla
4. Tag'ların anlık değerleri Dashboard'da gösterilecek

### Senaryo 3: 3 Saatte Bir Otomatik Okuma

1. Settings sayfasına git
2. "Otomatik Mod" seç
3. "3 Saatte Bir" seç
4. Sistem 3 saatte bir veri okuyacak

## 🔍 Hata Ayıklama

### Frontend görmüyor (404 hatası)

```bash
# Frontend portunu kontrol et
netstat -ano | findstr :3000

# Varsa, farklı port kullan
npm run dev -- --port 3001
```

### API Bağlantı Hatası

```bash
# Backend API çalışıyor mu kontrol et
curl http://localhost:3001/api/health

# Yanıt:
# {"status":"ok","timestamp":"...","uptime":123.45}
```

### PLC Bağlantı Hatası

```bash
# PLC'nin IP adresini ping et
ping 192.168.1.100

# Bağlantı var mı kontrol et
netstat -an | findstr 102
```

### CORS Hatası

Backend'te CORS otomatik olarak etkindir. Eğer yine hata alırsan:

1. Vite proxy ayarını kontrol et: `frontend/vite.config.js`
2. Backend Express CORS config'ini kontrol et: `src/apiServer.js`

## 📝 Environment Değişkenleri

| Değişken | Default | Açıklama |
|----------|---------|----------|
| PLC_HOST | 192.168.0.1 | PLC IP adresi |
| PLC_RACK | 0 | CPU Rack numarası |
| PLC_SLOT | 1 | CPU Slot numarası |
| PLC_TIMEOUT | 5000 | Okuma zaman aşımı (ms) |
| PLC_CONNECT_TIMEOUT | 3000 | Bağlantı zaman aşımı (ms) |
| API_PORT | 3001 | Backend API port |
| NODE_ENV | development | development/production |

## 🔐 Production Deployment

### Backend Production'u

```bash
NODE_ENV=production npm start
```

### Frontend Production Build

```bash
cd frontend
npm run build

# dist/ klasöründe static dosyalar oluşacak
```

## 📚 Dosya Yapısı Özeti

```
autoPrint/
├── backend (Node.js)
│   ├── src/
│   │   ├── index.js          # Ana giriş
│   │   ├── apiServer.js      # REST API
│   │   ├── plcConnection.js  # PLC bağlantısı
│   │   ├── tagReader.js      # Tag okuma
│   │   ├── scheduler.js      # Periyodik görevler
│   │   ├── tags.js           # Tag tanımları
│   │   └── config.js         # Yapılandırma
│   ├── package.json
│   ├── .env                  # Gizli (git'e commit etme!)
│   └── .env.example          # Örnek (git'e commit et)
│
├── frontend (React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
│
└── .gitignore               # Proje-level .gitignore
```

## 🎯 Sonraki Adımlar

1. **Veritabanı Entegrasyonu** - MongoDB/PostgreSQL bağlantısı
2. **Grafik Gösterimi** - Chart.js ile trend grafikleri
3. **Kullanıcı Yönetimi** - Login/Permission sistemi
4. **Uyarı Sistemi** - Değer eşik aşımı uyarıları
5. **Export Fonksiyonu** - Verileri CSV/Excel'e aktar

## ✅ Test

Backend ve Frontend'in beraber çalıştığını doğrulamak:

```javascript
// Browser Console (F12 -> Console)
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ API OK', d))
  .catch(e => console.error('✗ API Hata', e))
```

Eğer `✓ API OK` görürsen, sistem hazır!
