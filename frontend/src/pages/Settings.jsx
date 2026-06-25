// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Settings.css';

export const Settings = () => {
  const { systemStatus, lastReading, error } = useApp();
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('tr-TR'));
  }, [systemStatus]);

  const getReadingStatus = () => {
    if (systemStatus.startMemState) {
      return {
        label: 'ÜRETİM AKTİF ✓',
        emoji: '🟢',
        color: '#10b981',
        detail: 'PLC verileri veritabanına periyodik olarak işleniyor.'
      };
    } else {
      return {
        label: 'PERİYOT DURDU ✗',
        emoji: '🔴',
        color: '#ef4444',
        detail: 'Çevrim bitti, otomatik yazıcı çıktısı tetiklendi.'
      };
    }
  };

  const statusInfo = getReadingStatus();

  return (
    <div className="settings-page">
      <div className="container">
        <h1>⚙️ Sistem Ayarları & Otomasyon Durumu</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Canlı Sistem Durumu */}
        <div className="card status-card">
          <div className="card-header">
            <h2>🔍 Donanım Durum İzleme</h2>
            <p className="card-subtitle">S7-1200 tetikleme mekanizmasının anlık durumu</p>
          </div>
          <div className="card-body">
            <div className="status-display" style={{ borderLeft: `4px solid ${statusInfo.color}` }}>
              <div className="status-main">
                <span className="status-emoji">{statusInfo.emoji}</span>
                <div className="status-info">
                  <h3>START_MEM Sinyali</h3>
                  <p className="status-value" style={{ color: statusInfo.color }}>
                    {statusInfo.label}
                  </p>
                </div>
              </div>
              <p className="status-detail">{statusInfo.detail}</p>
            </div>

            <div className="status-explanation">
              <div className="explanation-item">
                <span className="exp-icon">📌</span>
                <div>
                  <strong>Sinyal Durumu:</strong> {systemStatus.startMemState ? 'Sinyal Var (True)' : 'Sinyal Kesik (False)'}
                </div>
              </div>
              <div className="explanation-item">
                <span className="exp-icon">📊</span>
                <div>
                  <strong>DB Döngüsü:</strong> {systemStatus.isMainReadingActive ? 'Kayıt Devam Ediyor' : 'Kayıt Pasif'}
                </div>
              </div>
              <div className="explanation-item">
                <span className="exp-icon">🔄</span>
                <div>
                  <strong>Son İletişim:</strong> {lastUpdated}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Otomasyon Algoritma Kartı */}
        <div className="card info-card">
          <h3>🖨️ Yazıcı ve Çevrim Algoritması Nasıl Çalışır?</h3>
          <div className="info-content">
            <div className="info-section">
              <h4>🟢 Sinyal True Olduğunda</h4>
              <ul>
                <li>Sistem yeni bir üretim çevrimi başlatır.</li>
                <li>Dakikada bir kez tüm verileri Docker DB üzerine kaydeder.</li>
                <li>Operatör ekranı 5 saniyede bir canlı verilerle beslenir.</li>
              </ul>
            </div>

            <div className="info-section">
              <h4>🔴 Sinyal False Olduğunda</h4>
              <ul>
                <li>Veritabanı kayıt döngüsü derhal sonlandırılır.</li>
                <li>O ana kadar biriken veriler toparlanarak otomatik bir PDF rapor dosyası oluşturulur.</li>
                <li><strong>Sunucuya bağlı varsayılan yazıcıdan otomatik fiziksel çıktı çıkartılır.</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teknik Donanım Parametre Kartı */}
        <div className="card tech-card">
          <h3>⚡ Yazılım & Donanım Detayları</h3>
          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-label">Kontrol Etiketi</span>
              <span className="tech-value">START_MEM (DB2,X0.0)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Haberleşme Protokolü</span>
              <span className="tech-value">S7 Comm (nodes7)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Yazıcı Modülü</span>
              <span className="tech-value">pdf-to-printer (Auto)</span>
            </div>
          </div>
        </div>

        {/* Son Okuma İstatistikleri */}
        {lastReading && (
          <div className="card stats-card" style={{ marginTop: '20px' }}>
            <h3>📈 Son Okuma İstatistikleri</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Başarılı Tag</span>
                <span className="stat-value" style={{ color: '#10b981' }}>
                  {lastReading.tags ? '✓' : '✗'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Zaman Damgası</span>
                <span className="stat-value">
                  {new Date(lastReading.timestamp).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;